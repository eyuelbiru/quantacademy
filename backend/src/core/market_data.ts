// Ported from quantacademy/core/src/market_data.rs

import { Bar, Tick } from './types.js';

export interface SymbolConfig {
  symbol: string;
  initialPrice: number;
  volatility: number;
  spread: number;
  tickSize: number;
  drift: number;
  meanReversion: number;
  meanPrice: number;
}

export function makeSymbolConfig(
  symbol: string,
  initialPrice: number,
  volatility: number,
  spread: number
): SymbolConfig {
  return {
    symbol,
    initialPrice,
    volatility,
    spread,
    tickSize: 0.01,
    drift: 0.0,
    meanReversion: 0.0,
    meanPrice: initialPrice,
  };
}

export function forexConfig(symbol: string, rate: number): SymbolConfig {
  return {
    ...makeSymbolConfig(symbol, rate, rate * 0.00001, rate * 0.0001),
    tickSize: 0.00001,
  };
}

export function equityConfig(symbol: string, price: number): SymbolConfig {
  return makeSymbolConfig(symbol, price, price * 0.001, 0.01);
}

export function cryptoConfig(symbol: string, price: number): SymbolConfig {
  return makeSymbolConfig(symbol, price, price * 0.002, price * 0.0005);
}

const U64_MAX = 0xffffffffffffffffn; // 2^64 - 1

class LCGRng {
  state: bigint;
  constructor(seed: bigint) {
    this.state = seed & U64_MAX;
  }
  nextF64(): number {
    this.state = (this.state * 6364136223846793005n + 1n) & U64_MAX;
    const bits = this.state >> 12n;
    return Number(bits) / 2 ** 52;
  }
  nextGaussian(): number {
    const u1 = Math.max(this.nextF64(), Number.MIN_VALUE);
    const u2 = this.nextF64();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  }
}

interface SymbolState {
  config: SymbolConfig;
  currentPrice: number;
  rng: LCGRng;
  lastBar: Bar | null;
  barOpen: number;
  barHigh: number;
  barLow: number;
  barVolume: number;
  barTickCount: number;
}

export class MarketDataFeed {
  private symbols: Map<string, SymbolState>;
  private currentTimeNanosValue: bigint;
  tickIntervalNanos: bigint;
  barTickCount: number;
  private seed: bigint;

  constructor(seed: number | bigint) {
    this.seed = typeof seed === 'bigint' ? seed : BigInt(seed);
    this.symbols = new Map();
    this.currentTimeNanosValue = 0n;
    this.tickIntervalNanos = 1_000_000n; // 1ms
    this.barTickCount = 100; // 100 ticks per bar
  }

  withTickInterval(interval: number | bigint): this {
    this.tickIntervalNanos = typeof interval === 'bigint' ? interval : BigInt(interval);
    return this;
  }

  withBarPeriod(ticksPerBar: number): this {
    this.barTickCount = ticksPerBar;
    return this;
  }

  addSymbol(config: SymbolConfig): void {
    const state: SymbolState = {
      config: { ...config },
      currentPrice: config.initialPrice,
      rng: new LCGRng(this.seed + BigInt(config.symbol.split('').reduce((s, c) => s + c.charCodeAt(0), 0))),
      lastBar: null,
      barOpen: config.initialPrice,
      barHigh: config.initialPrice,
      barLow: config.initialPrice,
      barVolume: 0.0,
      barTickCount: 0,
    };
    this.symbols.set(config.symbol, state);
  }

  step(nTicks: number): [Tick[], Bar[]] {
    const ticks: Tick[] = [];
    const bars: Bar[] = [];
    for (let i = 0; i < nTicks; i++) {
      this.currentTimeNanosValue += this.tickIntervalNanos;
      for (const [_, state] of this.symbols) {
        ticks.push(generateTick(state, this.currentTimeNanosValue));
      }
    }
    // Close incomplete bars
    for (const [_, state] of this.symbols) {
      if (state.barTickCount > 0) {
        const bar = closeBar(state, this.currentTimeNanosValue);
        if (bar) bars.push(bar);
      }
    }
    return [ticks, bars];
  }

  stepBar(): Bar[] {
    const bars: Bar[] = [];
    for (let i = 0; i < this.barTickCount; i++) {
      this.currentTimeNanosValue += this.tickIntervalNanos;
      for (const [_, state] of this.symbols) {
        generateTick(state, this.currentTimeNanosValue);
      }
    }
    for (const [_, state] of this.symbols) {
      const bar = closeBar(state, this.currentTimeNanosValue);
      if (bar) bars.push(bar);
    }
    // Reset bar state
    for (const state of this.symbols.values()) {
      state.barOpen = state.currentPrice;
      state.barHigh = state.currentPrice;
      state.barLow = state.currentPrice;
      state.barVolume = 0.0;
      state.barTickCount = 0;
    }
    return bars;
  }

  currentPrice(symbol: string): number | null {
    return this.symbols.get(symbol)?.currentPrice ?? null;
  }

  symbolsList(): string[] {
    return Array.from(this.symbols.keys());
  }

  lastBar(symbol: string): Bar | null {
    return this.symbols.get(symbol)?.lastBar ?? null;
  }

  currentTimeNanos(): bigint {
    return this.currentTimeNanosValue;
  }

  reset(): void {
    this.currentTimeNanosValue = 0n;
    for (const state of this.symbols.values()) {
      state.currentPrice = state.config.initialPrice;
      state.barOpen = state.config.initialPrice;
      state.barHigh = state.config.initialPrice;
      state.barLow = state.config.initialPrice;
      state.barVolume = 0.0;
      state.barTickCount = 0;
      state.lastBar = null;
    }
  }
}

function generateTick(state: SymbolState, currentTimeNanos: bigint): Tick {
  const { config } = state;
  let change = config.volatility * state.rng.nextGaussian();
  change += config.drift;
  if (config.meanReversion > 0.0) {
    const deviation = config.meanPrice - state.currentPrice;
    change += config.meanReversion * deviation;
  }
  state.currentPrice += change;
  state.currentPrice = Math.round(state.currentPrice / config.tickSize) * config.tickSize;
  state.currentPrice = Math.max(state.currentPrice, config.tickSize);

  if (state.barTickCount === 0) {
    state.barOpen = state.currentPrice;
  }
  state.barHigh = Math.max(state.barHigh, state.currentPrice);
  state.barLow = Math.min(state.barLow, state.currentPrice);
  const volume = Math.round(state.rng.nextF64() * 100.0 + 1.0) * config.tickSize;
  state.barVolume += volume;
  state.barTickCount += 1;

  const bidAskBounce = state.rng.nextF64() < 0.5 ? -config.spread / 2.0 : config.spread / 2.0;
  const tradePrice = state.currentPrice + bidAskBounce;
  const price = Math.max(
    config.tickSize,
    Math.round(tradePrice / config.tickSize) * config.tickSize
  );

  return {
    symbol: config.symbol,
    price,
    volume: Math.max(0.0, volume),
    timestampNanos: currentTimeNanos,
  };
}

function closeBar(state: SymbolState, currentTimeNanos: bigint): Bar | null {
  if (state.barTickCount === 0) return null;
  const bar: Bar = {
    symbol: state.config.symbol,
    open: state.barOpen,
    high: state.barHigh,
    low: state.barLow,
    close: state.currentPrice,
    volume: state.barVolume,
    timestampNanos: currentTimeNanos,
  };
  state.lastBar = bar;
  return bar;
}
