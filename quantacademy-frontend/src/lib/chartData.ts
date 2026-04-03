// Generate realistic OHLC sample data that demonstrates each strategy pattern
export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface ChartConfig {
  pattern: string;
  trend: "uptrend" | "downtrend" | "sideways" | "breakout-up" | "breakout-down" | "mean-reversion" | "accumulation" | "distribution";
  lineColor: string;
  description: string;
}

// Seed-based pseudo-random for deterministic data
let seed = 42;
function seededRandom() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

function randomBetween(min: number, max: number) {
  return min + seededRandom() * (max - min);
}

// Uptrend with pullbacks
function generateUptrend(): Candle[] {
  const candles: Candle[] = [];
  let price = 1.2;
  const trend = 0.008;
  const baseDate = new Date(2025, 0, 2);
  for (let i = 0; i < 60; i++) {
    seed = i * 7 + 42;
    const pullback = Math.sin(i / 8) * 0.02;
    const noise = randomBetween(-0.003, 0.006);
    const open = price;
    const change = trend + pullback + noise;
    const close = open + change;
    const high = Math.max(open, close) + randomBetween(0.001, 0.008);
    const low = Math.min(open, close) - randomBetween(0.001, 0.006);
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    candles.push({ time: date.toISOString().split("T")[0], open: +open.toFixed(5), high: +high.toFixed(5), low: +low.toFixed(5), close: +close.toFixed(5) });
    price = close;
  }
  return candles;
}

// Range-bound sideways
function generateRange(): Candle[] {
  const candles: Candle[] = [];
  const support = 98;
  const resistance = 105;
  let price = 100;
  const baseDate = new Date(2025, 0, 2);
  for (let i = 0; i < 60; i++) {
    seed = i * 13 + 42;
    const meanRevert = (100 - price) * 0.1;
    const noise = randomBetween(-1.5, 1.5);
    const open = price;
    const change = meanRevert + noise;
    const close = Math.max(support + 1, Math.min(resistance - 1, open + change));
    const high = Math.max(open, close) + randomBetween(0.2, 1.5);
    const low = Math.min(open, close) - randomBetween(0.2, 1.5);
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    candles.push({ time: date.toISOString().split("T")[0], open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2) });
    price = close;
  }
  return candles;
}

// Accumulation followed by markup
function generateAccumulation(): Candle[] {
  const candles: Candle[] = [];
  let price = 50;
  const baseDate = new Date(2025, 0, 2);
  for (let i = 0; i < 80; i++) {
    seed = i * 19 + 42;
    const isAccum = i < 50;
    const isMarkup = i >= 50;
    const drift = isAccum ? randomBetween(-0.15, 0.12) : randomBetween(0.3, 1.5);
    const open = price;
    const close = open + drift;
    const spread = isMarkup ? 0.6 : 0.2;
    const high = Math.max(open, close) + randomBetween(0.05, spread);
    const low = Math.min(open, close) - randomBetween(0.05, 0.1);
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    candles.push({ time: date.toISOString().split("T")[0], open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2) });
    price = close;
  }
  return candles;
}

// Distribution followed by markdown
function generateDistribution(): Candle[] {
  const candles: Candle[] = [];
  let price = 120;
  const baseDate = new Date(2025, 0, 2);
  for (let i = 0; i < 80; i++) {
    seed = i * 23 + 42;
    const isDistrib = i < 50;
    const isMarkdown = i >= 50;
    const drift = isDistrib ? randomBetween(-0.05, 0.15) : randomBetween(-1.5, -0.1);
    const open = price;
    const close = open + drift;
    const spread = isMarkdown ? 0.6 : 0.2;
    const high = Math.max(open, close) + randomBetween(0.05, spread);
    const low = Math.min(open, close) - randomBetween(0.05, 0.1);
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    candles.push({ time: date.toISOString().split("T")[0], open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2) });
    price = close;
  }
  return candles;
}

// Breakout upward after consolidation
function generateBreakoutUp(): Candle[] {
  const candles: Candle[] = [];
  let price = 42;
  const baseDate = new Date(2025, 0, 2);
  for (let i = 0; i < 60; i++) {
    seed = i * 17 + 42;
    const isBreakout = i >= 35;
    const open = price;
    const drift = isBreakout ? randomBetween(0.5, 2) : randomBetween(-0.03, 0.03);
    const noise = isBreakout ? randomBetween(-0.1, 0.3) : randomBetween(-0.08, 0.08);
    const close = open + drift + noise;
    const high = Math.max(open, close) + randomBetween(isBreakout ? 0.5 : 0.2, 1.5);
    const low = Math.min(open, close) - randomBetween(0.1, 0.8);
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    candles.push({ time: date.toISOString().split("T")[0], open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2) });
    price = close;
  }
  return candles;
}

// Breakdown (support broken, price falls)
function generateBreakoutDown(): Candle[] {
  const candles: Candle[] = [];
  let price = 110;
  const baseDate = new Date(2025, 0, 2);
  for (let i = 0; i < 60; i++) {
    seed = i * 31 + 42;
    const isBreakdown = i >= 35;
    const open = price;
    const change = isBreakdown ? randomBetween(-4, -1) : randomBetween(-0.8, 0.8);
    const close = open + change;
    const high = Math.max(open, close) + randomBetween(0.3, 2);
    const low = Math.min(open, close) - randomBetween(0.3, isBreakdown ? 3 : 1.5);
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    candles.push({ time: date.toISOString().split("T")[0], open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2) });
    price = close;
  }
  return candles;
}

// Support bounce (mean reversion)
function generateSupportBounce(): Candle[] {
  const candles: Candle[] = [];
  let price = 155;
  const baseDate = new Date(2025, 0, 2);
  for (let i = 0; i < 60; i++) {
    seed = i * 11 + 42;
    const open = price;
    let change: number;
    if (i < 18) {
      change = randomBetween(-2, -0.3);
    } else if (i < 25) {
      change = randomBetween(0.5, 4);
    } else {
      const meanRevert = (160 - price) * 0.05;
      change = meanRevert + randomBetween(-1, 1);
    }
    const close = open + change;
    const high = Math.max(open, close) + randomBetween(0.3, 1.5);
    const low = Math.min(open, close) - randomBetween(0.3, 1);
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    candles.push({ time: date.toISOString().split("T")[0], open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2) });
    price = close;
  }
  return candles;
}

// Spike down then revert to mean
function generateSpikeRevert(): Candle[] {
  const candles: Candle[] = [];
  let price = 3200;
  const baseDate = new Date(2025, 0, 2);
  for (let i = 0; i < 70; i++) {
    seed = i * 3 + 42;
    const isSpike = i >= 15 && i < 25;
    const isRecovery = i >= 25;
    const open = price;
    let drift: number;
    if (isSpike) drift = randomBetween(-80, -30);
    else if (isRecovery) drift = (3200 - price) * 0.08 + randomBetween(2, 25);
    else drift = randomBetween(-5, 5);
    const close = open + drift;
    const spread = (isSpike || isRecovery) ? 20 : 10;
    const high = Math.max(open, close) + randomBetween(5, spread);
    const low = Math.min(open, close) - randomBetween(5, spread);
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    candles.push({ time: date.toISOString().split("T")[0], open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2) });
    price = close;
  }
  return candles;
}

// High frequency rapid small candles (scalping)
function generateScalping(): Candle[] {
  const candles: Candle[] = [];
  let price = 1.085;
  const baseDate = new Date(2025, 5, 15, 8, 0);
  for (let i = 0; i < 60; i++) {
    seed = i * 53 + 42;
    const open = price;
    const change = randomBetween(-0.0015, 0.002);
    const close = open + change;
    const spread = 0.0008;
    const high = Math.max(open, close) + randomBetween(0.0001, spread);
    const low = Math.min(open, close) - randomBetween(0.0001, spread);
    const date = new Date(baseDate.getTime() + i * 300000);
    candles.push({ time: date.toISOString().split("T")[0], open: +open.toFixed(5), high: +high.toFixed(5), low: +low.toFixed(5), close: +close.toFixed(5) });
    price = close;
  }
  return candles;
}

// Volatility expansion
function generateVolatility(): Candle[] {
  const candles: Candle[] = [];
  let price = 62000;
  const baseDate = new Date(2025, 0, 2);
  for (let i = 0; i < 60; i++) {
    seed = i * 29 + 42;
    const isExpanding = i >= 30;
    const vol = isExpanding ? 800 : 100;
    const open = price;
    const change = randomBetween(-vol * 0.3, vol * 0.3) + randomBetween(-vol * 0.1, vol * 0.1);
    const close = open + change;
    const high = Math.max(open, close) + randomBetween(vol * 0.1, vol);
    const low = Math.min(open, close) - randomBetween(vol * 0.1, vol);
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    candles.push({ time: date.toISOString().split("T")[0], open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2) });
    price = close;
  }
  return candles;
}

// Pullback in uptrend
function generatePullback(): Candle[] {
  const candles: Candle[] = [];
  let price = 100;
  const baseDate = new Date(2025, 0, 2);
  for (let i = 0; i < 60; i++) {
    seed = i * 41 + 42;
    const isPullback = i >= 20 && i < 30;
    const drift = isPullback ? -0.3 : 0.15;
    const noise = randomBetween(-0.5, 0.5);
    const open = price;
    const change = drift + noise;
    const close = open + change;
    const high = Math.max(open, close) + randomBetween(0.3, 1);
    const low = Math.min(open, close) - randomBetween(0.3, 1);
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    candles.push({ time: date.toISOString().split("T")[0], open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2) });
    price = close;
  }
  return candles;
}

// Gold price action - typical multi-week trend with pullbacks and breakouts
function generateGold(): Candle[] {
  const candles: Candle[] = [];
  let price = 2150;
  const baseDate = new Date(2025, 0, 6);
  for (let i = 0; i < 120; i++) {
    seed = i * 37 + 42;
    // Phase 1: gradual uptrend (weeks 1-4)
    // Phase 2: pullback to support (weeks 5-6)
    // Phase 3: breakout higher (weeks 7-10)
    // Phase 4: consolidation at highs (weeks 11-12)
    const open = price;
    let drift: number;
    if (i < 20) {
      // Phase 1 - uptrend
      drift = randomBetween(0.5, 8) + (i % 5 === 0 ? -3 : 0);
    } else if (i < 35) {
      // Phase 2 - pullback
      drift = randomBetween(-8, -0.5) + (i % 3 === 0 ? 3 : 0);
    } else if (i < 80) {
      // Phase 3 - strong breakout
      drift = randomBetween(1, 12) + (i % 5 === 0 ? -5 : 0);
    } else {
      // Phase 4 - consolidation
      const meanRevert = (2750 - price) * 0.05;
      drift = meanRevert + randomBetween(-8, 8);
    }
    const volatility = i >= 80 ? 15 : i >= 35 ? 12 : 8;
    const close = open + drift;
    const high = Math.max(open, close) + randomBetween(2, volatility);
    const low = Math.min(open, close) - randomBetween(2, volatility);
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    // Skip weekends
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      candles.push({ time: date.toISOString().split("T")[0], open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2) });
    }
    price = close;
  }
  return candles;
}

// Map each strategy slug to its chart config type
export const CHART_PATTERNS: Record<string, ChartConfig> = {
  "trend-following": { pattern: "uptrend", trend: "uptrend", lineColor: "#22c55e", description: "Uptrend with higher highs and higher lows" },
  "mean-reversion": { pattern: "spike-revert", trend: "mean-reversion", lineColor: "#eab308", description: "Price spikes to extreme then reverts to mean" },
  "breakout": { pattern: "breakout-up", trend: "breakout-up", lineColor: "#3b82f6", description: "Consolidation followed by decisive breakout" },
  "range-trading": { pattern: "range", trend: "sideways", lineColor: "#a855f7", description: "Price oscillating between support and resistance" },
  "scalping": { pattern: "scalping", trend: "sideways", lineColor: "#06b6d4", description: "Tiny rapid price movements for quick trades" },
  "swing-trading": { pattern: "pullback", trend: "uptrend", lineColor: "#22c55e", description: "Uptrend with pullback entry opportunities" },
  "position-trading": { pattern: "uptrend", trend: "uptrend", lineColor: "#22c55e", description: "Long-term gradual uptrend" },
  "day-trading": { pattern: "pullback", trend: "uptrend", lineColor: "#22c55e", description: "Intraday price action with entries" },
  "carry-trade": { pattern: "uptrend", trend: "uptrend", lineColor: "#22c55e", description: "Steady appreciation from rate differential" },
  "arbitrage": { pattern: "range", trend: "sideways", lineColor: "#a855f7", description: "Price convergence between markets" },
  "statistical-arbitrage": { pattern: "range", trend: "sideways", lineColor: "#a855f7", description: "Mean-reverting spread between correlated assets" },
  "pairs-trading": { pattern: "range", trend: "sideways", lineColor: "#a855f7", description: "Spread oscillating around historical mean" },
  "momentum": { pattern: "uptrend", trend: "uptrend", lineColor: "#22c55e", description: "Strong momentum continuation" },
  "smc": { pattern: "pullback", trend: "uptrend", lineColor: "#22c55e", description: "Liquidity sweep, break of structure, then run" },
  "ict-method": { pattern: "pullback", trend: "uptrend", lineColor: "#22c55e", description: "Optimal trade entry after FVG fill" },
  "wyckoff-method": { pattern: "accumulation", trend: "accumulation", lineColor: "#22c55e", description: "Wyckoff accumulation followed by markup" },
  "elliott-wave": { pattern: "uptrend", trend: "uptrend", lineColor: "#22c55e", description: "Five-wave impulse pattern (1-2-3-4-5)" },
  "fibonacci-retracement": { pattern: "pullback", trend: "uptrend", lineColor: "#22c55e", description: "Pullback to Fibonacci level then continuation" },
  "supply-demand": { pattern: "breakout-up", trend: "breakout-up", lineColor: "#3b82f6", description: "Price reacting to supply/demand zones" },
  "order-flow": { pattern: "pullback", trend: "uptrend", lineColor: "#22c55e", description: "Order flow imbalance pattern" },
  "volume-profile": { pattern: "range", trend: "sideways", lineColor: "#a855f7", description: "Price around volume profile POC" },
  "price-action": { pattern: "pullback", trend: "uptrend", lineColor: "#22c55e", description: "Clean price action with confirmations" },
  "candlestick-patterns": { pattern: "range", trend: "sideways", lineColor: "#a855f7", description: "Candlestick patterns at key levels" },
  "support-resistance": { pattern: "range", trend: "sideways", lineColor: "#a855f7", description: "Bouncing off support and resistance" },
  "ma-crossover": { pattern: "uptrend", trend: "uptrend", lineColor: "#22c55e", description: "Moving average crossover buy signals" },
  "rsi-divergence": { pattern: "spike-revert", trend: "mean-reversion", lineColor: "#eab308", description: "RSI divergence signaling reversal" },
  "macd-strategies": { pattern: "uptrend", trend: "uptrend", lineColor: "#22c55e", description: "MACD crossover in trending market" },
  "bollinger-bands": { pattern: "range", trend: "sideways", lineColor: "#a855f7", description: "Bounce off Bollinger Band edges" },
  "ichimoku-cloud": { pattern: "uptrend", trend: "uptrend", lineColor: "#22c55e", description: "Price breaking through Ichimoku cloud" },
  "harmonic-patterns": { pattern: "spike-revert", trend: "mean-reversion", lineColor: "#eab308", description: "Harmonic PRZ completion and reversal" },
  "fair-value-gaps": { pattern: "pullback", trend: "uptrend", lineColor: "#22c55e", description: "FVG fill before continuation" },
  "order-blocks": { pattern: "pullback", trend: "uptrend", lineColor: "#22c55e", description: "Price respecting order block levels" },
  "liquidity-sweeps": { pattern: "spike-revert", trend: "mean-reversion", lineColor: "#eab308", description: "Liquidity sweep then sharp reversal" },
  "change-of-character": { pattern: "spike-revert", trend: "mean-reversion", lineColor: "#eab308", description: "Choch signaling trend reversal" },
  "break-of-structure": { pattern: "uptrend", trend: "uptrend", lineColor: "#22c55e", description: "BOS confirming new trend" },
  "gap-trading": { pattern: "breakout-up", trend: "breakout-up", lineColor: "#3b82f6", description: "Gap up at open with fill attempt" },
  "news-trading": { pattern: "volatility", trend: "breakout-up", lineColor: "#ec4899", description: "Volatility spike on news" },
  "volatility-trading": { pattern: "volatility", trend: "breakout-up", lineColor: "#ec4899", description: "Expanding volatility opportunities" },
  "grid-trading": { pattern: "range", trend: "sideways", lineColor: "#a855f7", description: "Capturing oscillations in range" },
  "dca": { pattern: "uptrend", trend: "uptrend", lineColor: "#22c55e", description: "Long-term accumulation through DCA" },
  "seasonality": { pattern: "uptrend", trend: "uptrend", lineColor: "#22c55e", description: "Seasonal price pattern" },
  "sentiment-contrarian": { pattern: "spike-revert", trend: "mean-reversion", lineColor: "#eab308", description: "Extreme sentiment reversal" },
  "market-making": { pattern: "range", trend: "sideways", lineColor: "#a855f7", description: "Bid-ask spread in range" },
  "ml-ai-driven": { pattern: "pullback", trend: "uptrend", lineColor: "#22c55e", description: "ML-identified entry signal" },
};

export function getChartDataForStrategy(slug: string): Candle[] {
  const config = CHART_PATTERNS[slug];
  if (!config) return generateUptrend();
  switch (config.pattern) {
    case "uptrend": return generateUptrend();
    case "range": return generateRange();
    case "breakout-up": return generateBreakoutUp();
    case "breakout-down": return generateBreakoutDown();
    case "spike-revert": return generateSpikeRevert();
    case "accumulation": return generateAccumulation();
    case "distribution": return generateDistribution();
    case "scalping": return generateScalping();
    case "volatility": return generateVolatility();
    case "pullback": return generatePullback();
    default: return generateUptrend();
  }
}
