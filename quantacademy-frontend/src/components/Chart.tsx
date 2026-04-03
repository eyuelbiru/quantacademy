"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";
import { getChartDataForStrategy } from "@/lib/chartData";

export default function Chart({ slug }: { slug: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const candles = getChartDataForStrategy(slug);
    if (candles.length === 0) return;

    const width = containerRef.current.clientWidth || 860;

    chartRef.current = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#64748b",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      width,
      height: 280,
      timeScale: {
        borderColor: "#1e293b",
        timeVisible: false,
      },
      rightPriceScale: {
        borderColor: "#1e293b",
      },
      handleScroll: true,
      handleScale: true,
    });

    const series = chartRef.current.addSeries(CandlestickSeries, {
      upColor: "rgba(34, 197, 94, 0.25)",
      downColor: "rgba(239, 68, 68, 0.25)",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    const chartData = candles.map((c) => ({
      time: c.time as `${number}-${number}-${number}`,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    series.setData(chartData);
    chartRef.current.timeScale().fitContent();

    const handleResize = () => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth || 860,
        });
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chartRef.current?.remove();
      chartRef.current = null;
    };
  }, [slug]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="quant-card overflow-hidden"
    >
      <div className="quant-border-top" />
      <div className="flex items-center justify-between border-b border-[#1e293b] px-4 py-2">
        <span className="scanline-text">LIVE CHART — {slug?.replaceAll("-", " ") || "DEMO"}</span>
        <span className="rounded-full border border-[#1e293b] px-2 py-0.5 text-[10px] text-slate-500">
          {Math.floor(Math.random() * 50 + 150)} bars
        </span>
      </div>
      <div ref={containerRef} className="p-2" />
    </motion.div>
  );
}
