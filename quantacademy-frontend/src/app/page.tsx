"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Strategy, ALL_STRATEGY_NAMES, fetchStrategies } from "@/lib/strategies";
import { getCompletedStrategies, getCompletionStats } from "@/lib/progress";
import StrategyCard from "@/components/StrategyCard";

type Filter = "all" | "beginner" | "intermediate" | "advanced";
type StatusFilter = "all" | "completed" | "uncompleted";

export default function HomePage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [familyFilter, setFamilyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [completed, setCompleted] = useState<string[]>([]);
  const [stats, setStats] = useState({ completed: 0, total: 44, percentage: 0 });

  useEffect(() => {
    fetchStrategies().then(setStrategies).catch(() => {
      setStrategies(
        ALL_STRATEGY_NAMES.map((s, i) => ({
          ...s,
          id: i + 1,
          concept: "",
          indicators: "",
          risk_management: "",
          steps: [],
          quiz_questions: [],
        } as Strategy))
      );
    });
    setCompleted(getCompletedStrategies());
    setStats(getCompletionStats());
  }, []);

  const families = [...new Set(strategies.map((s) => s.family))];

  const filtered = strategies.filter((s) => {
    if (filter !== "all" && s.difficulty !== filter) return false;
    if (familyFilter !== "all" && s.family !== familyFilter) return false;
    if (statusFilter === "completed" && !completed.includes(s.slug)) return false;
    if (statusFilter === "uncompleted" && completed.includes(s.slug)) return false;
    return true;
  });

  const difficultyStats = {
    beginner: strategies.filter((s) => s.difficulty === "beginner").length,
    intermediate: strategies.filter((s) => s.difficulty === "intermediate").length,
    advanced: strategies.filter((s) => s.difficulty === "advanced").length,
  };

  const FilterButton = ({
    label,
    active,
    onClick,
    accent,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
    accent?: boolean;
  }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
        active
          ? accent
            ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
            : "border-slate-300 bg-slate-100 text-slate-900"
          : "border-[#1e293b] text-slate-400 hover:border-slate-600 hover:text-slate-300"
      }`}
    >
      {label}
    </motion.button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-7xl px-6 py-8"
    >
      {/* Header Section */}
      <div className="mb-8">
        <motion.h1
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 text-3xl font-extralight tracking-tight"
        >
          <span className="text-emerald-400 font-semibold">Trading</span>
          Strategies
        </motion.h1>
        <motion.p
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-1 text-sm text-slate-500"
        >
          {strategies.length} strategies &middot; {families.length} families &middot; 3 markets
        </motion.p>
      </div>

      {/* Stats Bento Row */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5"
      >
        <StatCard label="Completed" value={`${stats.completed}`} sub={`of ${stats.total}`} />
        <StatCard label="Progress" value={`${stats.percentage}%`} accent />
        <div className="col-span-2 sm:col-span-1">
          <StatCard label="Beginner" value={String(difficultyStats.beginner)} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <StatCard label="Intermediate" value={String(difficultyStats.intermediate)} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <StatCard label="Advanced" value={String(difficultyStats.advanced)} />
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        style={{ originX: 0 }}
        className="relative mb-8 h-1 overflow-hidden rounded-full bg-[#1e293b]"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
          style={{ width: `${stats.percentage}%` }}
        />
        <div className="absolute inset-0 h-px w-full animate-pulse bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mb-6 flex flex-wrap items-center gap-3"
      >
        <select
          value={familyFilter}
          onChange={(e) => setFamilyFilter(e.target.value)}
          className="rounded-lg border border-[#1e293b] bg-[#111827] px-3 py-1.5 text-sm text-slate-300 outline-none transition-colors hover:border-slate-600 focus:border-emerald-400/50"
        >
          <option value="all">All Families</option>
          {families.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        {(["all", "beginner", "intermediate", "advanced"] as Filter[]).map((d) => (
          <FilterButton key={d} label={d} active={filter === d} onClick={() => setFilter(d)} />
        ))}

        <div className="mx-2 h-6 w-px bg-[#1e293b]" />

        {(["all", "completed", "uncompleted"] as StatusFilter[]).map((s) => (
          <FilterButton
            key={s}
            label={s}
            active={statusFilter === s}
            onClick={() => setStatusFilter(s)}
            accent={s !== "all"}
          />
        ))}
      </motion.div>

      {/* Strategy Grid */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filtered.map((s, i) => (
          <motion.div
            key={s.slug}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 + i * 0.04, duration: 0.35 }}
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
          >
            <StrategyCard strategy={s} completed={completed.includes(s.slug)} />
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 text-center text-sm text-slate-500"
        >
          No strategies match your filters
        </motion.p>
      )}
    </motion.div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="quant-card p-4">
      <div className="quant-border-top" />
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${accent ? "text-emerald-400" : "text-slate-200"}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-slate-600">{sub}</p>}
    </div>
  );
}
