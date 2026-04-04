"use client";

import { useEffect, useState } from "react";
import { ALL_STRATEGY_NAMES, QuizQuestion } from "@/lib/strategies";
import * as progress from "@/lib/progress";

interface QuizData {
  strategySlug: string;
  strategyName: string;
  difficulty: string;
  questions: QuizQuestion[];
  score: number | null;
  total: number | null;
  completed: boolean;
}

const difficultyColor: Record<string, string> = {
  beginner: "#22c55e",
  intermediate: "#eab308",
  advanced: "#ef4444",
};

export default function ProgressPage() {
  const [data, setData] = useState<QuizData[]>([]);
  const [stats, setStats] = useState({ completed: 0, total: 45, percentage: 0 });

  useEffect(() => {
    const items: QuizData[] = ALL_STRATEGY_NAMES.map((s) => {
      const p = progress.getProgress(s.slug);
      return {
        strategySlug: s.slug,
        strategyName: s.name,
        difficulty: s.difficulty,
        questions: [],
        score: p?.quizScore ?? null,
        total: p?.quizTotal ?? null,
        completed: p?.completed ?? false,
      };
    });
    setData(items);
    setStats(progress.getCompletionStats());
  }, []);

  const completed = data.filter((d) => d.completed);
  const inProgress = data.filter((d) => !d.completed);

  return (
    <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 8px", fontSize: 28 }}>My Progress</h1>
      <p style={{ color: "#737373", margin: "0 0 24px" }}>
        {stats.completed} of {stats.total} strategies completed ({stats.percentage}%)
      </p>

      {/* Progress bar */}
      <div style={{ marginBottom: 32, background: "#1e1e1e", borderRadius: 8, overflow: "hidden", height: 12 }}>
        <div style={{ width: `${stats.percentage}%`, background: "#22c55e", height: "100%", borderRadius: 8, transition: "width 0.3s" }} />
      </div>

      {/* Quick reset */}
      <button
        onClick={() => {
          if (confirm("Reset all progress?")) {
            progress.resetAllProgress();
            window.location.reload();
          }
        }}
        style={{
          marginBottom: 32,
          padding: "8px 16px",
          borderRadius: 8,
          border: "1px solid #333",
          background: "transparent",
          color: "#737373",
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        Reset All Progress
      </button>

      {/* Completed strategies */}
      <h2 style={{ color: "#22c55e", fontSize: 18, marginBottom: 12 }}>Completed ({completed.length})</h2>
      {completed.length === 0 ? (
        <p style={{ color: "#737373", marginBottom: 24 }}>No strategies completed yet</p>
      ) : (
        <div style={{ display: "grid", gap: 8, marginBottom: 32 }}>
          {completed.map((d) => (
            <CompletedRow key={d.strategySlug} data={d} />
          ))}
        </div>
      )}

      {/* Strategies to complete */}
      <h2 style={{ color: "#a3a3a3", fontSize: 18, marginBottom: 12 }}>Incomplete ({inProgress.length})</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {inProgress.map((d) => (
          <IncompleteRow key={d.strategySlug} data={d} />
        ))}
      </div>
    </div>
  );
}

function CompletedRow({ data }: { data: QuizData }) {
  return (
    <a
      href={`/strategy/${data.strategySlug}`}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderRadius: 8,
        background: "#1e1e1e",
        border: "1px solid #22c55e33",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div>
        <span style={{ fontWeight: 500 }}>{data.strategyName}</span>
        <span style={{
          fontSize: 12,
          marginLeft: 8,
          padding: "2px 8px",
          borderRadius: 8,
          background: difficultyColor[data.difficulty] + "22",
          color: difficultyColor[data.difficulty],
        }}>
          {data.difficulty}
        </span>
      </div>
      <div style={{ color: "#22c55e", fontSize: 13 }}>
        Quiz: {data.score}/{data.total} ✓
      </div>
    </a>
  );
}

function IncompleteRow({ data }: { data: QuizData }) {
  return (
    <a
      href={`/strategy/${data.strategySlug}`}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderRadius: 8,
        background: "#111",
        border: "1px solid #222",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div>
        <span style={{ fontWeight: 500 }}>{data.strategyName}</span>
        <span style={{
          fontSize: 12,
          marginLeft: 8,
          padding: "2px 8px",
          borderRadius: 8,
          background: difficultyColor[data.difficulty] + "22",
          color: difficultyColor[data.difficulty],
        }}>
          {data.difficulty}
        </span>
      </div>
      <span style={{ color: "#737373", fontSize: 13 }}>Not completed</span>
    </a>
  );
}
