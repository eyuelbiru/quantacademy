import { Strategy } from "@/lib/strategies";

const difficultyConfig: Record<string, { color: string; label: string; icon: string }> = {
  beginner: { color: "text-emerald-400", label: "Beginner", icon: "◇" },
  intermediate: { color: "text-amber-400", label: "Intermediate", icon: "◆" },
  advanced: { color: "text-rose-400", label: "Advanced", icon: "✦" },
};

export default function StrategyCard({
  strategy,
  completed,
}: {
  strategy: Strategy;
  completed?: boolean;
}) {
  const cfg = difficultyConfig[strategy.difficulty] || difficultyConfig.beginner;

  return (
    <a
      href={`/strategy/${strategy.slug}`}
      className={`group relative block rounded-xl border p-5 text-slate-200 no-underline transition-all duration-200 ${
        completed
          ? "border-emerald-400/30 bg-emerald-400/[0.03] hover:border-emerald-400/50 hover:bg-emerald-400/[0.06]"
          : "border-[#1e293b] bg-[#111827] hover:border-emerald-400/40 hover:bg-[#1f2937]"
      }`}
    >
      {/* Glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ boxShadow: "0 0 20px rgba(16, 185, 129, 0.08), inset 0 1px 0 rgba(16, 185, 129, 0.1)" }} />

      {/* Top accent line */}
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-40 ${cfg.color}`} />

      {/* Completed badge */}
      {completed && (
        <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-[10px] text-emerald-400 ring-1 ring-emerald-400/30">
          ✓
        </span>
      )}

      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold tracking-tight transition-colors group-hover:text-emerald-300">
            {strategy.name}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{strategy.family}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
            cfg.color
          } border-current/20`}
        >
          {cfg.icon} {cfg.label}
        </span>
      </div>

      {/* Description */}
      <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-400">
        {strategy.concept || `${strategy.name} strategy — click to learn more.`}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {strategy.market.map((m) => (
          <span
            key={m}
            className="rounded-md border border-[#1e293b]/60 bg-[#0b1120]/50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500"
          >
            {m}
          </span>
        ))}
      </div>
    </a>
  );
}
