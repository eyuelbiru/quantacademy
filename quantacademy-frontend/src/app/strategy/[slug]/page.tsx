"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { motion } from "framer-motion";
import { Strategy, fetchStrategy, ALL_STRATEGY_NAMES, QuizQuestion } from "@/lib/strategies";
import { getProgress, markComplete, getQuizScore } from "@/lib/progress";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("@/components/Chart"), { ssr: false });
const StrategyNotes = dynamic(() => import("@/components/StrategyNotes"), { ssr: false });

const difficultyConfig: Record<string, { color: string; bg: string; ring: string; label: string; icon: string }> = {
  beginner: { color: "text-emerald-400", bg: "bg-emerald-400/10", ring: "ring-emerald-400/20", label: "Beginner", icon: "◇" },
  intermediate: { color: "text-amber-400", bg: "bg-amber-400/10", ring: "ring-amber-400/20", label: "Intermediate", icon: "◆" },
  advanced: { color: "text-rose-400", bg: "bg-rose-400/10", ring: "ring-rose-400/20", label: "Advanced", icon: "✦" },
};

export default function StrategyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<(number | undefined)[]>([]);
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    fetchStrategy(slug).then(setStrategy).catch(() => {
      const fallback = ALL_STRATEGY_NAMES.find((s) => s.slug === slug);
      if (fallback) {
        setStrategy({
          ...fallback,
          id: ALL_STRATEGY_NAMES.indexOf(fallback) + 1,
          concept: "",
          indicators: "",
          risk_management: "",
          steps: [],
          quiz_questions: [],
        } as Strategy);
      }
    });
    setQuizAnswers([]);
    setShowScore(false);
  }, [slug]);

  const handleCompleteQuiz = () => {
    if (!strategy) return;
    const questions = strategy.quiz_questions ?? [];
    const score = quizAnswers.filter((a, i) => {
      const q = questions[i];
      return q && a === q.correct_index;
    }).length;
    if (questions.length > 0 && score / questions.length >= 0.5) {
      markComplete(strategy.slug, score, questions.length);
    }
    setShowScore(true);
  };

  if (!strategy)
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <div className="scanline-text">Loading strategy data...</div>
      </div>
    );

  const questions = strategy.quiz_questions ?? [];
  const quizKey = strategy.slug;
  const prevScore = getQuizScore(quizKey);
  const isComplete = getProgress(quizKey);
  const dc = difficultyConfig[strategy.difficulty] || difficultyConfig.beginner;

  const indicators = typeof strategy.indicators === "string"
    ? strategy.indicators.split(",").map((s: string) => s.trim())
    : strategy.indicators as string[];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-4xl px-6 py-8"
    >
      {/* Back link */}
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-emerald-400"
      >
        &larr; Back to strategies
      </a>

      {/* Header */}
      <div className="mt-6 mb-8">
        <motion.h1
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="text-3xl font-light tracking-tight"
        >
          {strategy.name}
        </motion.h1>

        <motion.div
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="mt-3 flex flex-wrap items-center gap-2"
        >
          <span className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider ${dc.color} border-current/20 ${dc.bg} ring-1 ${dc.ring}`}>
            {dc.icon} {dc.label}
          </span>
          <span className="rounded-md border border-[#1e293b] bg-[#111827] px-2.5 py-1 text-xs text-slate-400">
            {strategy.family}
          </span>
          {isComplete ? (
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
              Completed {prevScore !== null ? `(${prevScore.score}/${prevScore.total})` : ""}
            </span>
          ) : (
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-400">
              Not completed
            </span>
          )}
        </motion.div>
      </div>

      {/* Concept */}
      <Section title="Concept" delay={0.15}>
        <p className="leading-relaxed text-slate-300">{strategy.concept}</p>
      </Section>

      {/* Chart */}
      <Section title="Example Chart" delay={0.2}>
        <Chart slug={slug} />
      </Section>

      {/* Deep Dive Notes */}
      <StrategyNotes slug={strategy.slug} name={strategy.name} family={strategy.family} />

      {/* Indicators */}
      <Section title="Indicators" delay={0.25}>
        <div className="flex flex-wrap gap-2">
          {indicators?.map((ind: string, i: number) => (
            <span
              key={i}
              className="rounded-md border border-[#1e293b] bg-[#0b1120]/60 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-emerald-400/30 hover:text-emerald-300"
            >
              {ind}
            </span>
          ))}
        </div>
      </Section>

      {/* Risk Management */}
      <Section title="Risk Management" delay={0.3}>
        <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.04] p-4">
          <p className="text-sm leading-relaxed text-amber-200/80">{strategy.risk_management}</p>
        </div>
      </Section>

      {/* Steps */}
      <Section title="Execution Steps" delay={0.35}>
        <ol className="space-y-3 pl-5">
          {strategy.steps.map((step, i) => {
            const colonIdx = step.indexOf(":");
            if (colonIdx > 0 && colonIdx < 40) {
              const key = step.slice(0, colonIdx).trim();
              const value = step.slice(colonIdx + 1).trim();
              return (
                <li key={i} className="flex gap-3 text-sm text-slate-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#1e293b] bg-[#111827] text-[10px] font-mono text-slate-400">
                    {i + 1}
                  </span>
                  <span>
                    <span className="font-medium text-slate-200">{key}:</span>{" "}
                    <span className="text-slate-400">{value}</span>
                  </span>
                </li>
              );
            }
            return (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#1e293b] bg-[#111827] text-[10px] font-mono text-slate-400">
                  {i + 1}
                </span>
                <span className="text-slate-300">{step}</span>
              </li>
            );
          })}
        </ol>
      </Section>

      {/* Quiz */}
      {questions.length > 0 && (
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10"
        >
          <h2 className="mb-5 flex items-center gap-2 text-lg text-slate-400">
            <span className="scanline-text">Quiz</span>
            <span className="text-xs text-slate-500">— {questions.length} questions</span>
          </h2>

          {questions.map((q: QuizQuestion, qi: number) => (
            <motion.div
              key={qi}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.42 + qi * 0.06 }}
              className="quant-card mb-4 p-5"
            >
              <div className="quant-border-top" />
              <p className="mb-3 text-sm font-medium">
                Q{qi + 1}: {q.question}
              </p>
              {q.options.map((opt, oi) => {
                const isSelected = quizAnswers[qi] === oi;
                const isCorrect = oi === q.correct_index;
                const showResult = showScore;

                let borderClass = "border-[#1e293b] hover:border-slate-500";
                if (showResult) {
                  if (isCorrect) borderClass = "!border-emerald-400/60 bg-emerald-400/5";
                  else if (isSelected && !isCorrect) borderClass = "!border-rose-400/60 bg-rose-400/5";
                } else if (isSelected) {
                  borderClass = "border-emerald-400/50 bg-emerald-400/5";
                }

                return (
                  <label
                    key={oi}
                    className={`mb-2 block cursor-pointer rounded-lg border px-3.5 py-2.5 text-sm transition-colors last:mb-0 ${borderClass}`}
                  >
                    <input
                      type="radio"
                      name={`q-${qi}`}
                      checked={isSelected}
                      onChange={() => {
                        const next = [...quizAnswers];
                        next[qi] = oi;
                        setQuizAnswers(next);
                        if (showScore) setShowScore(false);
                      }}
                      className="mr-2 accent-emerald-400"
                    />
                    {opt}
                    {showResult && isCorrect && (
                      <span className="ml-2 text-xs text-emerald-400">✓</span>
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <span className="ml-2 text-xs text-rose-400">✗</span>
                    )}
                  </label>
                );
              })}
              {showScore && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mt-2 text-xs ${
                    quizAnswers[qi] === q.correct_index ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {quizAnswers[qi] === q.correct_index
                    ? "Correct!"
                    : `Incorrect — ${q.explanation}`}
                </motion.p>
              )}
            </motion.div>
          ))}

          {/* Quiz Actions */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => {
                setQuizAnswers((prev) => {
                  const q = strategy.quiz_questions ?? [];
                  return prev.slice(0, q.length);
                });
                handleCompleteQuiz();
              }}
              disabled={quizAnswers.filter(Boolean).length < questions.length}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                quizAnswers.filter(Boolean).length >= questions.length
                  ? "bg-emerald-500 text-slate-900 hover:bg-emerald-400"
                  : "cursor-not-allowed bg-[#1e293b] text-slate-500"
              }`}
            >
              Check Answers
            </button>
            {showScore && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => {
                  setQuizAnswers([]);
                  setShowScore(false);
                }}
                className="rounded-lg border border-[#1e293b] px-5 py-2 text-sm font-medium text-slate-400 transition-colors hover:border-slate-500"
              >
                Retake Quiz
              </motion.button>
            )}
          </div>

          {/* Score Display */}
          {showScore && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-4 rounded-lg border border-[#1e293b] bg-[#111827] px-5 py-3"
            >
              <span className="text-sm text-slate-400">Score: </span>
              <span className="font-mono text-lg font-semibold">{quizAnswers.filter((a, i) => questions[i] && a === questions[i].correct_index).length}/{questions.length}</span>
            </motion.div>
          )}
        </motion.section>
      )}
    </motion.div>
  );
}

function Section({
  title,
  children,
  delay,
}: {
  title: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.section
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.35 }}
      className="mb-8"
    >
      <h2 className="mb-3 flex items-center gap-2 text-sm text-slate-500">
        <span className="scanline-text">{title}</span>
      </h2>
      {children}
    </motion.section>
  );
}
