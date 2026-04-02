// Ported from quantacademy/core/src/simulation.rs

import { v4 as uuidv4 } from 'uuid';
import { MarketDataFeed, SymbolConfig } from './market_data.js';
import { MatchingEngine, MatchResult, createOrder } from './matching_engine.js';
import {
  Bar,
  Event,
  Fill,
  Liquidity,
  Order,
  OrderStatus,
  OrderType,
  Position,
  Side,
  Tick,
  createPosition,
  updateUnrealized,
} from './types.js';
import { Ema, Macd, MacdValue, Rsi, Sma } from './indicators.js';

export interface PositionState {
  position: Position;
  commissionPaid: number;
}

export interface SimConfig {
  commissionRate: number;
  seed: number;
  initialCapital: number;
  tickIntervalNanos: number;
  barPeriodTicks: number;
  maxOrdersPerTick: number;
}

export const defaultSimConfig = (): SimConfig => ({
  commissionRate: 0.001,
  seed: 42,
  initialCapital: 100_000.0,
  tickIntervalNanos: 1_000_000, // 1ms
  barPeriodTicks: 100,
  maxOrdersPerTick: 10,
});

export interface SimulationStats {
  eventsEmitted: number;
  ordersSubmitted: number;
  fillsExecuted: number;
  barsGenerated: number;
  totalEquity: number;
  realizedPnl: number;
  openPositions: number;
  currentTimeNanos: string;
}

export interface IndicatorValues {
  sma: number | null;
  ema: number | null;
  rsi: number | null;
  macd: MacdValue | null;
}

export class IndicatorTracker {
  symbol: string;
  private sma: Sma;
  private ema: Ema;
  private rsi: Rsi;
  private macd: Macd;

  constructor(symbol: string) {
    this.symbol = symbol;
    this.sma = new Sma(20);
    this.ema = new Ema(20);
    this.rsi = new Rsi(14);
    this.macd = Macd.defaultParams();
  }

  update(close: number): IndicatorValues {
    return {
      sma: this.sma.update(close),
      ema: this.ema.update(close),
      rsi: this.rsi.update(close),
      macd: this.macd.update(close),
    };
  }
}

export class Simulation {
  config: SimConfig;
  private marketData: MarketDataFeed;
  private matchingEngine: MatchingEngine;
  private capital: number;
  positions: Map<string, PositionState>;
  eventLog: Event[];
  fillLog: Fill[];
  ordersSubmitted = 0;
  fillsExecuted = 0;
  barsGenerated = 0;
  isRunning = false;
  private clockNanos = 0n;

  constructor(config?: Partial<SimConfig>) {
    const c = { ...defaultSimConfig(), ...config };
    this.config = c;
    this.marketData = new MarketDataFeed(c.seed)
      .withTickInterval(c.tickIntervalNanos)
      .withBarPeriod(c.barPeriodTicks);
    this.matchingEngine = new MatchingEngine(c.commissionRate);
    this.capital = c.initialCapital;
    this.positions = new Map();
    this.eventLog = [];
    this.fillLog = [];
  }

  addSymbol(config: SymbolConfig): void {
    this.marketData.addSymbol(config);
    this.matchingEngine.getBook(config.symbol);
  }

  start(): void {
    this.clockNanos = 0n;
    this.isRunning = true;
  }

  stop(): void {
    this.isRunning = false;
  }

  runBars(numBars: number): void {
    this.start();
    for (let i = 0; i < numBars; i++) this.stepBar();
    this.stop();
  }

  runTicks(numTicks: number): void {
    this.start();
    for (let i = 0; i < numTicks; i++) this.stepTick();
    this.stop();
  }

  stepBar(): Bar | null {
    if (!this.isRunning) return null;
    const bars = this.marketData.stepBar();
    this.clockNanos += BigInt(this.config.tickIntervalNanos * this.config.barPeriodTicks);
    let lastBar: Bar | null = null;
    for (const bar of bars) {
      this.barsGenerated++;
      this.eventLog.push({
        type: 'bar_closed',
        symbol: bar.symbol,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume,
        timestampNanos: bar.timestampNanos,
      });
      lastBar = bar;
    }
    this.updatePrices();
    return lastBar;
  }

  stepTick(): [Tick | null, Bar[]] {
    if (!this.isRunning) return [null, []];
    const [ticks, bars] = this.marketData.step(1);
    this.clockNanos += BigInt(this.config.tickIntervalNanos);
    for (const tick of ticks) {
      this.eventLog.push({
        type: 'tick',
        symbol: tick.symbol,
        price: tick.price,
        timestampNanos: tick.timestampNanos,
      });
    }
    for (const bar of bars) {
      this.eventLog.push({
        type: 'bar_closed',
        symbol: bar.symbol,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume,
        timestampNanos: bar.timestampNanos,
      });
    }
    this.updatePrices();
    return [ticks[0] ?? null, bars];
  }

  submitOrder(order: Order): Fill[] {
    const { symbol, side } = order;
    switch (order.orderType) {
      case OrderType.Market:
        this.ordersSubmitted++;
        const result = this.matchingEngine.matchMarketOrder(order, this.clockNanos);
        if (result.rejected) return [];
        for (const fill of result.fills) this.processFill(fill);
        if (result.fills.length > 0) this.updatePositionFromFills(symbol, side, result.fills);
        return result.fills;

      case OrderType.Limit: {
        const limitPrice = order.price;
        if (limitPrice === undefined) return [];
        const orderId = order.id;
        this.ordersSubmitted++;
        // Add liquidity to book
        this.matchingEngine.addLiquidity(symbol, limitPrice, order.quantity, side, this.clockNanos, orderId);
        // Try to match
        const matchResult = this.matchingEngine.matchMarketOrder(order, this.clockNanos);
        if (matchResult.rejected) return [];
        for (const fill of matchResult.fills) this.processFill(fill);
        if (matchResult.fills.length > 0) this.updatePositionFromFills(symbol, side, matchResult.fills);
        return matchResult.fills;
      }

      case OrderType.Stop:
      case OrderType.StopLimit:
        this.ordersSubmitted++;
        return []; // Not triggered until price action
    }
  }

  cancelOrder(orderId: string): void {
    this.matchingEngine.cancelOrder(orderId);
  }

  closePosition(symbol: string): number | null {
    const state = this.positions.get(symbol);
    if (!state || Math.abs(state.position.quantity) < 1e-9) return null;

    const exitSide = state.position.side === Side.Buy ? Side.Sell : Side.Buy;
    const exitQuantity = state.position.quantity;

    const order = createOrder(symbol, exitSide, exitQuantity, OrderType.Market, this.clockNanos);
    this.submitOrder(order);

    return state.position.realizedPnl;
  }

  totalEquity(): number {
    const unrealized = Array.from(this.positions.values()).reduce(
      (sum, s) => sum + s.position.unrealizedPnl,
      0.0
    );
    return this.capital + this.totalRealizedPnl() + unrealized;
  }

  totalRealizedPnl(): number {
    let sum = 0.0;
    for (const s of this.positions.values()) sum += s.position.realizedPnl;
    return sum;
  }

  getMarketData(): MarketDataFeed {
    return this.marketData;
  }

  getMatchingEngine(): MatchingEngine {
    return this.matchingEngine;
  }

  getCapital(): number {
    return this.capital;
  }

  stats(): SimulationStats {
    return {
      eventsEmitted: this.eventLog.length,
      ordersSubmitted: this.ordersSubmitted,
      fillsExecuted: this.fillsExecuted,
      barsGenerated: this.barsGenerated,
      totalEquity: this.totalEquity(),
      realizedPnl: this.totalRealizedPnl(),
      openPositions: Array.from(this.positions.values()).filter(
        (s) => Math.abs(s.position.quantity) >= 1e-9
      ).length,
      currentTimeNanos: this.clockNanos.toString(),
    };
  }

  // -- Internal helpers --

  private processFill(fill: Fill): void {
    this.fillsExecuted++;
    const commission = fill.price * fill.quantity * this.config.commissionRate;
    this.capital -= commission;
    this.eventLog.push({ type: 'order_filled', fill });
    this.fillLog.push(fill);
  }

  private updatePositionFromFills(symbol: string, side: Side, fills: Fill[]): void {
    const totalQty = fills.reduce((s, f) => s + f.quantity, 0.0);
    const avgPrice =
      totalQty > 0.0 ? fills.reduce((s, f) => s + f.price * f.quantity, 0.0) / totalQty : 0;
    if (avgPrice === 0) return;
    const commission = fills.reduce(
      (s, f) => s + f.price * f.quantity * this.config.commissionRate,
      0.0
    );

    const existing = this.positions.get(symbol);
    if (existing) {
      if (existing.position.side === side) {
        // Pyramiding
        const totalCost = existing.position.entryPrice * existing.position.quantity + avgPrice * totalQty;
        existing.position.quantity += totalQty;
        if (existing.position.quantity > 1e-9) {
          existing.position.entryPrice = totalCost / existing.position.quantity;
        }
        updateUnrealized(existing.position, avgPrice);
        existing.commissionPaid += commission;
      } else {
        // Closing/reversing
        const closeQty = Math.min(totalQty, existing.position.quantity);
        if (Math.abs(closeQty) >= 1e-9) {
          const pnl =
            existing.position.side === Side.Buy
              ? (avgPrice - existing.position.entryPrice) * closeQty
              : (existing.position.entryPrice - avgPrice) * closeQty;
          existing.position.realizedPnl += pnl;
          existing.position.quantity -= closeQty;
          existing.position.quantity = Math.max(0.0, existing.position.quantity);
          updateUnrealized(existing.position, avgPrice);
        }
        if (existing.position.quantity < 1e-9 && totalQty > closeQty) {
          this.positions.delete(symbol);
          const newPos = createPosition(symbol, side, totalQty - closeQty, avgPrice, this.clockNanos);
          this.positions.set(symbol, { position: newPos, commissionPaid: commission });
        } else if (existing.position.quantity < 1e-9) {
          this.positions.delete(symbol);
        } else {
          existing.commissionPaid += commission;
        }
      }
    } else {
      // New position
      const pos = createPosition(symbol, side, totalQty, avgPrice, this.clockNanos);
      this.positions.set(symbol, { position: pos, commissionPaid: commission });
    }
  }

  private updatePrices(): void {
    for (const [symbol, state] of this.positions) {
      const price = this.marketData.currentPrice(symbol);
      if (price !== null) updateUnrealized(state.position, price);
    }
  }
}
