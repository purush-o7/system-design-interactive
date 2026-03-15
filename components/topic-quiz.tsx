"use client";

import { useState } from "react";
import { GraduationCap, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";
import { trackEvent } from "@/lib/analytics";

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

interface TopicQuizProps {
  questions: QuizQuestion[];
}

export function TopicQuiz({ questions }: TopicQuizProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => new Array(questions.length).fill(null)
  );
  const [revealed, setRevealed] = useState<boolean[]>(
    () => new Array(questions.length).fill(false)
  );

  const answeredCount = revealed.filter(Boolean).length;
  const correctCount = answers.filter(
    (a, i) => a !== null && a === questions[i].correctIndex
  ).length;
  const allDone = answeredCount === questions.length;

  const select = (qi: number, oi: number) => {
    if (revealed[qi]) return;
    trackEvent("quiz_option_selected", {
      question: questions[qi].question,
      option: questions[qi].options[oi],
    });
    setAnswers((prev) => {
      const next = [...prev];
      next[qi] = oi;
      return next;
    });
  };

  const reveal = (qi: number) => {
    if (answers[qi] === null) return;
    const isCorrect = answers[qi] === questions[qi].correctIndex;
    trackEvent("quiz_answer_revealed", {
      question: questions[qi].question,
      correct: isCorrect,
    });
    setRevealed((prev) => {
      const next = [...prev];
      next[qi] = true;
      return next;
    });
  };

  const reset = () => {
    setAnswers(new Array(questions.length).fill(null));
    setRevealed(new Array(questions.length).fill(false));
  };

  if (!questions || questions.length === 0) return null;

  return (
    <Fade inView inViewMargin="-50px">
      <section className="rounded-xl border border-violet-500/20 bg-violet-500/[0.02] overflow-hidden">
        <div className="flex items-center justify-between border-b border-violet-500/20 bg-violet-500/[0.04] px-5 py-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-violet-400">
              Test Your Understanding
            </h2>
          </div>
          {allDone && (
            <button
              onClick={reset}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="size-3" /> Retry
            </button>
          )}
        </div>

        <div className="divide-y divide-violet-500/10">
          {questions.map((q, qi) => {
            const isRevealed = revealed[qi];
            const isCorrect = answers[qi] === q.correctIndex;
            return (
              <div key={qi} className="p-5 space-y-3">
                <p className="text-sm font-medium text-foreground">
                  {qi + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const isSelected = answers[qi] === oi;
                    const isCorrectOption = oi === q.correctIndex;
                    let optionClass =
                      "border-border/50 bg-muted/20 hover:bg-muted/40";
                    if (isRevealed) {
                      if (isCorrectOption)
                        optionClass =
                          "border-emerald-500/40 bg-emerald-500/10";
                      else if (isSelected)
                        optionClass = "border-red-500/40 bg-red-500/10";
                      else optionClass = "border-border/30 bg-muted/10 opacity-50";
                    } else if (isSelected) {
                      optionClass =
                        "border-violet-500/40 bg-violet-500/10 ring-1 ring-violet-500/30";
                    }

                    return (
                      <button
                        key={oi}
                        onClick={() => select(qi, oi)}
                        disabled={isRevealed}
                        className={cn(
                          "w-full text-left rounded-lg border px-3 py-2 text-sm transition-all flex items-center gap-2",
                          optionClass,
                          !isRevealed && "cursor-pointer"
                        )}
                      >
                        {isRevealed && isCorrectOption && (
                          <CheckCircle className="size-3.5 text-emerald-500 shrink-0" />
                        )}
                        {isRevealed && isSelected && !isCorrectOption && (
                          <XCircle className="size-3.5 text-red-500 shrink-0" />
                        )}
                        {!isRevealed && (
                          <span className="size-3.5 rounded-full border border-muted-foreground/30 shrink-0 flex items-center justify-center text-[9px] text-muted-foreground">
                            {String.fromCharCode(65 + oi)}
                          </span>
                        )}
                        <span className="text-muted-foreground">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {!isRevealed && answers[qi] !== null && (
                  <button
                    onClick={() => reveal(qi)}
                    className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Check answer →
                  </button>
                )}

                {isRevealed && (
                  <div
                    className={cn(
                      "rounded-md px-3 py-2 text-xs leading-relaxed",
                      isCorrect
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    )}
                  >
                    {isCorrect ? "Correct! " : "Not quite. "}
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {allDone && (
          <div className="border-t border-violet-500/10 px-5 py-3 flex items-center justify-between">
            <span className="text-sm font-medium">
              Score: {correctCount}/{questions.length}
            </span>
            <span className="text-xs text-muted-foreground">
              {correctCount === questions.length
                ? "Perfect! You nailed it."
                : correctCount >= questions.length / 2
                  ? "Good job! Review the explanations above."
                  : "Keep learning! Re-read the topic and try again."}
            </span>
          </div>
        )}
      </section>
    </Fade>
  );
}
