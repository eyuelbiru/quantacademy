"use client";

import { useEffect, useState, useCallback } from "react";

/* ─────────────────────────────────────────────
   Data model
───────────────────────────────────────────── */
interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Indicator {
  showSma20: boolean;
  showSma50: boolean;
  showEma12: boolean;
  showRsi: boolean;
}

type TimeFrame = "1m" | "5m" | "15m" | "1H" | "4H" | "1D";

/* ─────────────────────────────────────────────
   Utilities
───────────────────────────────────────────── */
function computeSMA(data: Candle[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += data[j].close;
      result.push(sum / period);
    }
  }
  return result;
}

function computeEMA(data: Candle[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(data[i].close);
    } else if (i < period - 1) {
      result.push(data[i].close);
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) sum += data[j].close;
      result.push(sum / period);
    } else {
      const prev = result[i - 1]!;
      result.push((data[i].close - prev) * multiplier + prev);
    }
  }
  return result;
}

function computeRSI(data: Candle[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];
  let gains = 0;
  let losses = 0;
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(null);
      continue;
    }
    const change = data[i].close - data[i - 1].close;
    if (i <= period) {
      if (change > 0) gains += change;
      else losses -= change;
      if (i < period) {
        result.push(null);
        continue;
      }
      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result.push(100 - 100 / (1 + rs));
      continue;
    }
    const change2 = data[i].close - data[i - 1].close;
    const prev = result[i - 1];
    let avgGain2 = 0;
    let avgLoss2 = 0;
    if (prev !== null) {
      const rsPrev = (100 / (100 - prev)) - 1;
      if (rsPrev !== 0) {
        avgGain2 = rsPrev * 1;
        avgLoss2 = 1;
      }
    }
    if (change2 > 0) avgGain2 = (avgGain2 * (period - 1) + change2) / period;
    else avgLoss2 = (avgLoss2 * (period - 1) - change2) / period;
    const rs2 = avgLoss2 === 0 ? 100 : avgGain2 / avgLoss2;
    result.push(100 - 100 / (1 + rs2));
  }
  return result;
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function ChartPage() {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [symbol, setSymbol] = useState("EUR/USD");
  const [timeframe, setTimeframe] = useState<TimeFrame>("1H");
  const [indicators, setIndicators] = useState<Indicator>({
    showSma20: true,
    showSma50: false,
    showEma12: true,
    showRsi: true,
  });
  const [hovered, setHovered] = useState<Candle | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number>(-1);

  // Generate simulated realistic price data
  const regenerateData = useCallback(() => {
    const base = symbol.includes("BTC") ? 67000 : symbol.includes("USD") ? 1.0800 : 150;
    const volatility = symbol.includes("BTC") ? 800 : symbol.includes("USD") ? 0.002 : 3;
    const numCandles = 60;
    const data: Candle[] = [];
    let price = base;
    const now = Date.now();

    for (let i = 0; i < numCandles; i++) {
      const change = (Math.random() - 0.48) * volatility;
      const open = price;
      const close = price + change;
      const wick = Math.abs(change) * (0.5 + Math.random());
      const high = Math.max(open, close) + wick;
      const low = Math.min(open, close) - wick;
      const volume = Math.floor(1000 + Math.random() * 9000);
      const timeOffset = i * 3600000;
      const date = new Date(now - (numCandles - i) * 3600000);
      data.push({
        time: date.toLocaleString(),
        open: +open.toFixed(symbol.includes("USD") ? 4 : 2),
        high: +high.toFixed(symbol.includes("USD") ? 4 : 2),
        low: +low.toFixed(symbol.includes("USD") ? 4 : 2),
        close: +close.toFixed(symbol.includes("USD") ? 4 : 2),
        volume,
      });
      price = close;
    }
    setCandles(data);
  }, [symbol]);

  useEffect(() => {
    regenerateData();
  }, [symbol, timeframe, regenerateData]);

  // Auto-refresh every 3 seconds to simulate live data
  useEffect(() => {
    const interval = setInterval(() => {
      setCandles((prev) => {
        if (prev.length === 0) return prev;
        const last = { ...prev[prev.length - 1] };
        const volatility = symbol.includes("BTC") ? 50 : symbol.includes("USD") ? 0.0002 : 0.5;
        const change = (Math.random() - 0.48) * volatility;
        last.close = +(last.close + change).toFixed(symbol.includes("USD") ? 4 : 0);
        last.high = +Math.max(last.high, last.close).toFixed(symbol.includes("USD") ? 4 : 0);
        last.low = +Math.min(last.low, last.close).toFixed(symbol.includes("USD") ? 4 : 0);
        return [...prev.slice(0, -1), last];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [symbol]);

  /* ── Chart constants ── */
  const CHART_W = 900;
  const CHART_H = 380;
  const RSI_H = 80;
  const PADDING = { top: 20, right: 60, bottom: 30, left: 10 };
  const plotW = CHART_W - PADDING.left - PADDING.right;
  const plotH = CHART_H - PADDING.top - PADDING.bottom;

  const sma20 = computeSMA(candles, 20);
  const sma50 = computeSMA(candles, 50);
  const ema12 = computeEMA(candles, 12);
  const rsi = computeRSI(candles);

  const allPrices = candles.flatMap((c) => [c.high, c.low]);
  indicators.showSma20 && sma20.forEach((v) => v !== null && allPrices.push(v));
  indicators.showSma50 && sma50.forEach((v) => v !== null && allPrices.push(v));
  indicators.showEma12 && ema12.forEach((v) => v !== null && allPrices.push(v));

  const priceMin = Math.min(...allPrices);
  const priceMax = Math.max(...allPrices);
  const priceRange = priceMax - priceMin || 1;

  const toX = (i: number) => PADDING.left + (i / Math.max(candles.length - 1, 1)) * plotW;
  const toY = (price: number) => CHART_H - PADDING.bottom - ((price - priceMin) / priceRange) * plotH;
  const barWidth = Math.max(1, plotW / candles.length - 1);

  const rsiData = rsi;
  const hasRsi = indicators.showRsi && rsi.some((v) => v !== null);

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            style={{ background: "#111", color: "#e5e5e5", border: "1px solid #333", borderRadius: 6, padding: "6px 12px", minWidth: 120 }}
          >
            <optgroup label="Forex">
              <option>EUR/USD</option>
              <option>GBP/USD</option>
              <option>USD/JPY</option>
            </optgroup>
            <optgroup label="Equities">
              <option>AAPL</option>
              <option>MSFT</option>
              <option>TSLA</option>
            </optgroup>
            <optgroup label="Crypto">
              <option>BTC/USD</option>
              <option>ETH/USD</option>
            </optgroup>
          </select>
          {(["1m", "5m", "15m", "1H", "4H", "1D"] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: "4px 12px",
                borderRadius: 4,
                border: timeframe === tf ? "1px solid #e5e5e5" : "1px solid #333",
                background: timeframe === tf ? "#1a3a5c" : "transparent",
                color: timeframe === tf ? "#e5e5e5" : "#737373",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              {tf}
            </button>
          ))}
          <button onClick={regenerateData} style={{
            padding: "6px 16px", borderRadius: 4, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13,
          }}>
            Refresh
          </button>
        </div>

        {/* Indicator toggles */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { key: "showSma20", label: "SMA 20", color: "#6366f1" },
            { key: "showSma50", label: "SMA 50", color: "#a855f7" },
            { key: "showEma12", label: "EMA 12", color: "#eab308" },
            { key: "showRsi", label: "RSI", color: "#3b82f6" },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setIndicators((prev) => ({ ...prev, [key]: !prev[key as keyof Indicator] }))}
              style={{
                padding: "4px 10px", borderRadius: 4, fontSize: 12, cursor: "pointer",
                border: `1px solid ${(indicators as any)[key] ? color : "#444"}`,
                background: (indicators as any)[key] ? color + "22" : "transparent",
                color: (indicators as any)[key] ? color : "#555",
              }}
            >
              {(indicators as any)[key] ? "✓ " : ""}{label}
            </button>
          ))}
        </div>
      </div>

      {/* Price info */}
      {hovered && (
        <div style={{ marginBottom: 8, fontSize: 13, color: "#a3a3a3", display: "flex", gap: 16, flexWrap: "wrap" }}>
          <span><b style={{ color: "#e5e5e5" }}>{hovered.time}</b></span>
          <span>O <span style={{ color: "#e5e5e5" }}>{hovered.open}</span></span>
          <span>H <span style={{ color: "#22c55e" }}>{hovered.high}</span></span>
          <span>L <span style={{ color: "#ef4444" }}>{hovered.low}</span></span>
          <span>C <span style={{ color: "#e5e5e5" }}>{hovered.close}</span></span>
          <span>V <span style={{ color: "#e5e5e5" }}>{hovered.volume}</span></span>
          {hovered.close >= hovered.open ? (
            <span style={{ color: "#22c55e" }}>▲ {((hovered.close - hovered.open) / hovered.open * 100).toFixed(3)}%</span>
          ) : (
            <span style={{ color: "#ef4444" }}>▼ {((hovered.close - hovered.open) / hovered.open * 100).toFixed(3)}%</span>
          )}
          {hoverIndex >= 0 && rsi[hoverIndex] && (
            <span>RSI <span style={{ color: rsi[hoverIndex]! > 70 ? "#ef4444" : rsi[hoverIndex]! < 30 ? "#22c55e" : "#e5e5e5" }}>{rsi[hoverIndex]!.toFixed(1)}</span></span>
          )}
        </div>
      )}

      {/* SVG Chart */}
      <svg viewBox={`0 0 ${CHART_W} ${hasRsi ? CHART_H + RSI_H + 24 : CHART_H}`} style={{ width: "100%", background: "#0a0a0a", borderRadius: 8, border: "1px solid #222" }}>
        <defs>
          <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = PADDING.top + pct * plotH;
          const price = priceMax - pct * priceRange;
          return (
            <g key={pct}>
              <line x1={PADDING.left} y1={y} x2={CHART_W - PADDING.right} y2={y} stroke="#222" strokeWidth="1" />
              <text x={CHART_W - PADDING.right + 4} y={y + 4} fill="#666" fontSize="9" fontFamily="monospace">{price.toFixed(symbol.includes("USD") && symbol.includes("BTC") ? 0 : symbol.includes("USD") ? 4 : 2)}</text>
            </g>
          );
        })}

        {/* Candlesticks */}
        {candles.map((c, i) => {
          const x = toX(i);
          const bullish = c.close >= c.open;
          const bodyTop = toY(Math.max(c.open, c.close));
          const bodyBottom = toY(Math.min(c.open, c.close));
          const bodyHeight = Math.max(1, bodyBottom - bodyTop);
          const color = bullish ? "#22c55e" : "#ef4444";
          return (
            <g key={i}
              onMouseEnter={() => { setHovered(c); setHoverIndex(i); }}
              onMouseLeave={() => { setHovered(null); setHoverIndex(-1); }}
              style={{ cursor: "crosshair" }}
            >
              {/* Wick */}
              <line x1={x} y1={toY(c.high)} x2={x} y2={toY(c.low)} stroke={color} strokeWidth="1" />
              {/* Body */}
              <rect x={x - barWidth / 2} y={bodyTop} width={barWidth} height={bodyHeight} fill={bullish ? "#22c55e" : "#ef4444"} rx="0.5" />
              {/* Hover overlay */}
              {hoverIndex === i && (
                <rect x={x - barWidth / 2 - 2} y={toY(c.high)} width={barWidth + 4} height={toY(c.low) - toY(c.high)} fill="none" stroke="#fff" strokeWidth="0.5" strokeDasharray="3" />
              )}
            </g>
          );
        })}

        {/* SMA 20 */}
        {indicators.showSma20 && sma20.map((v, i) => {
          if (v === null || i === 0) return null;
          const prev = sma20[i - 1];
          if (prev === null) return null;
          return <line key={`sma20-${i}`} x1={toX(i - 1)} y1={toY(prev)} x2={toX(i)} y2={toY(v)} stroke="#6366f1" strokeWidth="1.2" />;
        })}

        {/* SMA 50 */}
        {indicators.showSma50 && sma50.map((v, i) => {
          if (v === null || i === 0) return null;
          const prev = sma50[i - 1];
          if (prev === null) return null;
          return <line key={`sma50-${i}`} x1={toX(i - 1)} y1={toY(prev)} x2={toX(i)} y2={toY(v)} stroke="#a855f7" strokeWidth="1.2" />;
        })}

        {/* EMA 12 */}
        {indicators.showEma12 && ema12.map((v, i) => {
          if (v === null || i === 0) return null;
          const prev = ema12[i - 1];
          if (!prev || prev === null) return null;
          return <line key={`ema12-${i}`} x1={toX(i - 1)} y1={toY(prev)} x2={toX(i)} y2={toY(v)} stroke="#eab308" strokeWidth="1.2" />;
        })}

        {/* RSI sub-chart */}
        {hasRsi && (() => {
          const rsiY = CHART_H + 12;
          const rsiPlotH = RSI_H - 16;
          return (
            <>
              {/* Background */}
              <rect x={PADDING.left} y={rsiY + 12} width={plotW} height={rsiPlotH} fill="#0f0f0f" rx="4" />
              {/* 70 / 30 / 50 lines */}
              <line x1={PADDING.left} y1={rsiY + 12} x2={CHART_W - PADDING.right} y2={rsiY + 12} stroke="#333" strokeWidth="0.5" />
              {/* 70 line */}
              <line x1={PADDING.left} y1={rsiY + 12 + rsiPlotH * (30/100)} x2={CHART_W - PADDING.right} y2={rsiY + 12 + rsiPlotH * (30/100)} stroke="#ef4444" strokeWidth="0.5" strokeDasharray="4" />
              {/* 50 line */}
              <line x1={PADDING.left} y1={rsiY + 12 + rsiPlotH * (50/100)} x2={CHART_W - PADDING.right} y2={rsiY + 12 + rsiPlotH * (50/100)} stroke="#555" strokeWidth="0.5" />
              {/* 30 line */}
              <line x1={PADDING.left} y1={rsiY + 12 + rsiPlotH * (70/100)} x2={CHART_W - PADDING.right} y2={rsiY + 12 + rsiPlotH * (70/100)} stroke="#22c55e" strokeWidth="0.5" strokeDasharray="4" />
              {/* Overbought / Oversold labels */}
              <text x={CHART_W - PADDING.right + 4} y={rsiY + 12 + rsiPlotH * (30/100) + 10} fill="#ef4444" fontSize="8">70</text>
              <text x={CHART_W - PADDING.right + 4} y={rsiY + 12 + rsiPlotH * (70/100) + 10} fill="#22c55e" fontSize="8">30</text>
              {/* RSI line */}
              {rsi.map((v, i) => {
                if (v === null || i === 0) return null;
                const prev = rsi[i - 1];
                if (prev === null) return null;
                const x1 = toX(i - 1);
                const y1 = rsiY + 12 + rsiPlotH * ((100 - v) / 100);
                const x2 = toX(i);
                const y2 = rsiY + 12 + rsiPlotH * ((100 - prev) / 100);
                return <line key={`rsi-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth="1.2" />;
              })}
            </>
          );
        })()}
      </svg>

      {/* Legend */}
      <div style={{ marginTop: 12, fontSize: 12, color: "#666", display: "flex", gap: 12 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ display: "inline-block", width: 16, height: 3, background: "#22c55e", borderRadius: 1 }} /> Green = Bullish (close &ge; open)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ display: "inline-block", width: 16, height: 3, background: "#ef4444", borderRadius: 1 }} /> Red = Bearish (close &lt; open)
        </span>
      </div>

      {/* Strategy info cards */}
      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <Card title="Trend Signal" value={(() => {
          if (sma20.length === 0) return "—";
          const last = sma20[sma20.length - 1];
          if (last === null) return "—";
          const lastPrice = candles[candles.length - 1]?.close ?? 0;
          return lastPrice > last ? "Bullish" : "Bearish";
        })()} color={(() => {
          if (sma20.length === 0) return "#737373";
          const last = sma20[sma20.length - 1];
          if (last === null) return "#737373";
          const lastPrice = candles[candles.length - 1]?.close ?? 0;
          return lastPrice > last ? "#22c55e" : "#ef4444";
        })()} />
        <Card title="RSI" value={(() => {
          const last = rsi.filter((v) => v !== null).pop();
          return last ? last.toFixed(1) : "—";
        })()} color={(() => {
          const last = rsi.filter((v) => v !== null).pop();
          if (!last) return "#737373";
          return last > 70 ? "#ef4444" : last < 30 ? "#22c55e" : "#e5e5e5";
        })()} />
        <Card title="SMA 20" value={(() => {
          const last = sma20.filter((v) => v !== null).pop();
          const sym = symbol.includes("BTC") ? 0 : symbol.includes("USD") ? 4 : 2;
          return last ? last.toFixed(sym) : "—";
        })()} color="#6366f1" />
        <Card title="Volatility" value={(() => {
          if (candles.length < 2) return "—";
          const changes = candles.slice(-20).map((c) => Math.abs(c.high - c.low) / c.open * 100);
          const avg = changes.reduce((a, b) => a + b, 0) / changes.length;
          return avg.toFixed(3) + "%";
        })()} color="#e5e5e5" />
      </div>
    </div>
  );
}

function Card({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div style={{ padding: "12px 16px", borderRadius: 8, background: "#111", border: "1px solid #222" }}>
      <div style={{ fontSize: 12, color: "#737373", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color }}>{value}</div>
    </div>
  );
}
