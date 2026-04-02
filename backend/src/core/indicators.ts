// Ported from quantacademy/core/src/indicators.rs

// --- Simple Moving Average ---
export class Sma {
  private period: number;
  private window: number[] = [];
  private sum = 0.0;

  constructor(period: number) {
    if (period <= 0) throw new Error('Period must be positive');
    this.period = period;
  }

  update(value: number): number | null {
    if (this.window.length === this.period) {
      this.sum -= this.window.shift()!;
    }
    this.window.push(value);
    this.sum += value;
    return this.window.length === this.period ? this.sum / this.period : null;
  }

  value(): number | null {
    return this.window.length === this.period ? this.sum / this.period : null;
  }
}

// --- Exponential Moving Average ---
export class Ema {
  private multiplier: number;
  private currentValue: number | null = null;
  private period: number;
  private warmupCount = 0;

  constructor(period: number) {
    if (period <= 0) throw new Error('Period must be positive');
    this.period = period;
    this.multiplier = 2.0 / (period + 1.0);
  }

  update(value: number): number | null {
    if (this.currentValue === null) {
      this.currentValue = value;
      this.warmupCount = 1;
      return this.period === 1 ? this.currentValue : null;
    }
    const ema = (value - this.currentValue) * this.multiplier + this.currentValue;
    this.currentValue = ema;
    this.warmupCount++;
    return this.warmupCount >= this.period ? ema : null;
  }

  getValue(): number | null {
    return this.currentValue;
  }
}

// --- Relative Strength Index ---
export class Rsi {
  private period: number;
  private avgGain: number | null = null;
  private avgLoss: number | null = null;
  private prevValue: number | null = null;
  private currentRsi: number | null = null;
  private sampleCount = 0;

  constructor(period: number) {
    if (period <= 0) throw new Error('Period must be positive');
    this.period = period;
  }

  update(newValue: number): number | null {
    this.sampleCount++;
    if (this.prevValue !== null) {
      const change = newValue - this.prevValue;
      const gain = Math.max(change, 0.0);
      const loss = Math.max(-change, 0.0);

      if (this.avgGain === null && this.avgLoss === null) {
        this.avgGain = gain;
        this.avgLoss = loss;
      } else if (this.avgGain !== null && this.avgLoss !== null) {
        this.avgGain = (this.avgGain * (this.period - 1.0) + gain) / this.period;
        this.avgLoss = (this.avgLoss * (this.period - 1.0) + loss) / this.period;
      }

      if (this.sampleCount > this.period && this.avgGain !== null && this.avgLoss !== null) {
        this.computeRsi();
      }
    }
    this.prevValue = newValue;
    return this.currentRsi;
  }

  private computeRsi(): void {
    const avgGain = this.avgGain ?? 0.0;
    const avgLoss = this.avgLoss ?? 0.0;
    const rs = Math.abs(avgLoss) < 1e-10 ? Infinity : avgGain / avgLoss;
    this.currentRsi = rs === Infinity ? 100.0 : 100.0 - 100.0 / (1.0 + rs);
  }

  value(): number | null {
    return this.currentRsi;
  }
}

export interface MacdValue {
  macdLine: number;
  signalLine: number;
  histogram: number;
}

export class Macd {
  private fastEma: Ema;
  private slowEma: Ema;
  private signalEma: Ema;

  constructor(fastPeriod: number, slowPeriod: number, signalPeriod: number) {
    this.fastEma = new Ema(fastPeriod);
    this.slowEma = new Ema(slowPeriod);
    this.signalEma = new Ema(signalPeriod);
  }

  static defaultParams(): Macd {
    return new Macd(12, 26, 9);
  }

  update(newValue: number): MacdValue | null {
    this.fastEma.update(newValue);
    this.slowEma.update(newValue);
    const fastV = this.fastEma.getValue();
    const slowV = this.slowEma.getValue();
    if (fastV === null || slowV === null) return null;

    const macdLine = fastV - slowV;
    this.signalEma.update(macdLine);
    const signalLine = this.signalEma.getValue();
    if (signalLine === null) return null;

    return { macdLine, signalLine, histogram: macdLine - signalLine };
  }
}

// --- Batch helpers ---
export function smaClosing(data: number[], period: number): number[] {
  const sma = new Sma(period);
  const results: number[] = [];
  for (const price of data) {
    const val = sma.update(price);
    if (val !== null) results.push(val);
  }
  return results;
}

export function emaClosing(data: number[], period: number): number[] {
  const ema = new Ema(period);
  const results: number[] = [];
  for (const price of data) {
    const val = ema.update(price);
    if (val !== null) results.push(val);
  }
  return results;
}

export function rsiClosing(data: number[], period: number): number[] {
  const rsi = new Rsi(period);
  const results: number[] = [];
  for (const price of data) {
    const val = rsi.update(price);
    if (val !== null) results.push(val);
  }
  return results;
}

export function macdClosing(
  data: number[],
  fast: number,
  slow: number,
  signal: number
): MacdValue[] {
  const macd = new Macd(fast, slow, signal);
  const results: MacdValue[] = [];
  for (const price of data) {
    const val = macd.update(price);
    if (val !== null) results.push(val);
  }
  return results;
}
