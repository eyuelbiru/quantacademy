import { describe, test, expect } from 'vitest';
import { Simulation, SimConfig, defaultSimConfig, IndicatorTracker } from './simulation.js';
import { MarketDataFeed, makeSymbolConfig, forexConfig, cryptoConfig } from './market_data.js';
import { Side, OrderType, OrderStatus } from './types.js';
import { createOrder } from './matching_engine.js';
import { OrderBook } from './order_book.js';
import { MatchingEngine } from './matching_engine.js';
import { Sma, Ema, Rsi, Macd, smaClosing, emaClosing, rsiClosing, macdClosing } from './indicators.js';

// ---------------------------------------------------------------------------
// OrderBook tests
// ---------------------------------------------------------------------------

describe('OrderBook', () => {
  test('best bid/ask', () => {
    const book = new OrderBook('BTC');
    book.addOrder('1', 42000, 1.0, Side.Buy, 100n);
    book.addOrder('2', 42100, 1.0, Side.Buy, 100n);
    book.addOrder('3', 42200, 1.0, Side.Sell, 100n);
    book.addOrder('4', 42300, 1.0, Side.Sell, 100n);
    expect(book.bestBid()).toBe(42100);
    expect(book.bestAsk()).toBe(42200);
    expect(book.spread()).toBe(100);
  });

  test('mid price', () => {
    const book = new OrderBook('ETH');
    book.addOrder('1', 2000, 1.0, Side.Buy, 100n);
    book.addOrder('2', 2100, 1.0, Side.Sell, 100n);
    expect(book.midPrice()).toBe(2050);
  });

  test('match buy from ask', () => {
    const book = new OrderBook('BTC');
    book.addOrder('1', 42000, 1.0, Side.Buy, 100n);
    book.addOrder('2', 42100, 1.0, Side.Sell, 100n);
    const result = book.matchQuantity(Side.Buy, 0.5);
    expect(result).not.toBeNull();
    expect(result!.price).toBe(42100);
    expect(result!.fillQty).toBe(0.5);
  });

  test('remove order', () => {
    const book = new OrderBook('BTC');
    book.addOrder('1', 42000, 1.0, Side.Buy, 100n);
    expect(book.bestBid()).toBe(42000);
    book.removeOrder('1');
    expect(book.bestBid()).toBeNull();
  });

  test('depth calculation', () => {
    const book = new OrderBook('BTC');
    book.addOrder('1', 42000, 1.0, Side.Buy, 100n);
    book.addOrder('2', 41900, 2.0, Side.Buy, 100n);
    book.addOrder('3', 42100, 1.0, Side.Sell, 100n);
    expect(book.depthAt(Side.Sell, 1)).toBe(1.0);
  });
});

// ---------------------------------------------------------------------------
// MatchingEngine tests
// ---------------------------------------------------------------------------

describe('MatchingEngine', () => {
  function makeOrder(symbol: string, side: Side, qty: number) {
    return createOrder(symbol, side, qty, OrderType.Market, 0n);
  }

  test('market buy fills from book', () => {
    const engine = new MatchingEngine(0.001);
    engine.addLiquidity('BTC', 42000, 2.0, Side.Sell, 100n, 'ask1');
    engine.addLiquidity('BTC', 42100, 1.0, Side.Sell, 100n, 'ask2');

    const order = makeOrder('BTC', Side.Buy, 1.5);
    const result = engine.matchMarketOrder(order, 200n);
    expect(result.rejected).toBe(false);
    expect(result.fills.length).toBe(1);
    expect(result.fills[0].quantity).toBe(1.5);
    expect(result.fills[0].price).toBe(42000);
    expect(result.updatedOrder.status).toBe(OrderStatus.Filled);
  });

  test('market sell fills from book (multiple levels)', () => {
    const engine = new MatchingEngine(0.001);
    engine.addLiquidity('BTC', 42000, 1.0, Side.Buy, 100n, 'bid1');
    engine.addLiquidity('BTC', 41900, 2.0, Side.Buy, 100n, 'bid2');

    const order = makeOrder('BTC', Side.Sell, 2.5);
    const result = engine.matchMarketOrder(order, 200n);
    expect(result.rejected).toBe(false);
    expect(result.fills.length).toBe(2);
    expect(result.fills[0].price).toBe(42000);
    expect(result.fills[0].quantity).toBe(1.0);
    expect(result.fills[1].price).toBe(41900);
    expect(result.fills[1].quantity).toBe(1.5);
  });

  test('reject fully filled order', () => {
    const engine = new MatchingEngine(0.001);
    const order = makeOrder('BTC', Side.Buy, 1.0);
    order.filledQuantity = 1.0;
    const result = engine.matchMarketOrder(order, 100n);
    expect(result.rejected).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Indicator tests
// ---------------------------------------------------------------------------

describe('Indicators', () => {
  test('SMA warmup', () => {
    const sma = new Sma(3);
    expect(sma.update(1)).toBeNull();
    expect(sma.update(2)).toBeNull();
    expect(sma.update(3)).toBe(2);
  });

  test('SMA rolling', () => {
    const sma = new Sma(3);
    sma.update(1);
    sma.update(2);
    sma.update(3);
    expect(sma.update(4)).toBe(3); // (2+3+4)/3
  });

  test('EMA warmup and convergence', () => {
    const ema = new Ema(3);
    expect(ema.update(10)).toBeNull();
    const v2 = ema.update(20);
    const v3 = ema.update(30);
    expect(v3).not.toBeNull();
    expect(Math.abs(v3! - 22.5)).toBeLessThan(0.01);
  });

  test('EMA constant value', () => {
    const ema = new Ema(5);
    for (let i = 0; i < 10; i++) ema.update(100);
    expect(Math.abs(ema.getValue()! - 100)).toBeLessThan(0.01);
  });

  test('RSI always gains', () => {
    const rsi = new Rsi(5);
    rsi.update(10);
    let value: number | null = null;
    for (let i = 1; i < 20; i++) value = rsi.update(10 + i);
    if (value !== null) expect(value).toBeGreaterThan(90);
  });

  test('RSI always loses', () => {
    const rsi = new Rsi(5);
    rsi.update(100);
    let value: number | null = null;
    for (let i = 1; i < 20; i++) value = rsi.update(100 - i);
    if (value !== null) expect(value).toBeLessThan(10);
  });

  test('MACD warmup', () => {
    const macd = Macd.defaultParams();
    for (let i = 0; i < 20; i++) macd.update(100 + i);
    const val = macd.update(125);
    expect(val).not.toBeNull();
  });

  test('MACD constant value → 0 histogram', () => {
    const macd = Macd.defaultParams();
    for (let i = 0; i < 50; i++) macd.update(100);
    const val = macd.update(100)!;
    expect(Math.abs(val.macdLine)).toBeLessThan(0.01);
    expect(Math.abs(val.histogram)).toBeLessThan(0.01);
  });

  test('batch SMA', () => {
    const data = [1, 2, 3, 4, 5, 6];
    expect(smaClosing(data, 3)).toEqual([2, 3, 4, 5]);
  });

  test('batch RSI values in range', () => {
    const data = Array.from({ length: 30 }, (_, i) => (i % 2) * 10);
    const result = rsiClosing(data, 5);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((v) => v >= 0 && v <= 100)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// MarketDataFeed tests
// ---------------------------------------------------------------------------

describe('MarketDataFeed', () => {
  function makeFeed() {
    const feed = new MarketDataFeed(42);
    feed.addSymbol(makeSymbolConfig('BTC/USD', 50000, 10, 5));
    feed.addSymbol(forexConfig('EUR/USD', 1.0850));
    return feed;
  }

  test('generates ticks', () => {
    const feed = makeFeed();
    const [ticks, bars] = feed.step(10);
    expect(ticks.length).toBe(20); // 2 symbols * 10
    expect(ticks.every((t) => t.price > 0)).toBe(true);
  });

  test('generates bars', () => {
    const feed = makeFeed();
    const bars = feed.stepBar();
    expect(bars.length).toBe(2);
    for (const bar of bars) {
      expect(bar.high).toBeGreaterThanOrEqual(bar.low);
      expect(bar.high).toBeGreaterThanOrEqual(bar.open);
      expect(bar.volume).toBeGreaterThan(0);
    }
  });

  test('deterministic output', () => {
    const feed1 = makeFeed();
    const feed2 = makeFeed();
    const [t1] = feed1.step(5);
    const [t2] = feed2.step(5);
    for (let i = 0; i < t1.length; i++) {
      expect(t1[i].price).toBe(t2[i].price);
    }
  });

  test('reset returns to initial', () => {
    const feed = makeFeed();
    feed.step(10);
    feed.reset();
    expect(feed.currentPrice('BTC/USD')).toBe(50000);
    expect(feed.currentPrice('EUR/USD')).toBe(1.0850);
  });
});

// ---------------------------------------------------------------------------
// Simulation tests
// ---------------------------------------------------------------------------

function makeSim() {
  const sim = new Simulation({ commissionRate: 0.001, seed: 42, initialCapital: 100_000, tickIntervalNanos: 1_000_000, barPeriodTicks: 50, maxOrdersPerTick: 10 });
  sim.addSymbol(makeSymbolConfig('BTC/USD', 50000, 10, 5));
  sim.addSymbol(forexConfig('EUR/USD', 1.1));
  return sim;
}

describe('Simulation', () => {
  test('starts and stops', () => {
    const sim = makeSim();
    expect(sim.isRunning).toBe(false);
    sim.start();
    expect(sim.isRunning).toBe(true);
    sim.stop();
    expect(sim.isRunning).toBe(false);
  });

  test('runs bars', () => {
    const sim = makeSim();
    sim.runBars(5);
    expect(sim.getMarketData().currentPrice('BTC/USD')).toBeGreaterThan(0);
  });

  test('stats after run', () => {
    const sim = makeSim();
    sim.runBars(10);
    const stats = sim.stats();
    expect(stats.eventsEmitted).toBeGreaterThan(0);
    expect(stats.barsGenerated).toBeGreaterThan(0);
    expect(stats.ordersSubmitted).toBe(0);
  });

  test('submit market order produces fills', () => {
    const sim = makeSim();
    sim.runTicks(20);
    sim.getMatchingEngine().addLiquidity('BTC/USD', 50100, 1.0, Side.Sell, sim['clockNanos'], 'ask1');
    const order = createOrder('BTC/USD', Side.Buy, 1.0, OrderType.Market, sim['clockNanos']);
    const fills = sim.submitOrder(order);
    expect(fills.length).toBeGreaterThan(0);
    expect(fills[0].side).toBe(Side.Buy);
  });

  test('total equity starts at capital', () => {
    const sim = makeSim();
    expect(Math.abs(sim.totalEquity() - 100_000)).toBeLessThan(0.01);
  });

  test('close position returns null without position', () => {
    const sim = makeSim();
    expect(sim.closePosition('BTC/USD')).toBeNull();
  });

  test('indicator tracker works', () => {
    const tracker = new IndicatorTracker('TEST');
    const values: ReturnType<typeof tracker.update>[] = [];
    for (let i = 0; i < 30; i++) values.push(tracker.update(100 + i));
    const last = values[values.length - 1];
    expect(last.sma).not.toBeNull();
    expect(last.ema).not.toBeNull();
    expect(last.rsi).not.toBeNull();
    expect(last.macd).not.toBeNull();
  });

  test('event log accumulates', () => {
    const sim = makeSim();
    const initial = sim.eventLog.length;
    sim.runTicks(5);
    expect(sim.eventLog.length).toBeGreaterThan(initial);
  });
});
