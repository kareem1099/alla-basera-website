import { ArrowLeft, Check, ChevronLeft, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import type { QuizQuestion } from "../data/journey";
import { isArabicText, useLang } from "../lib/i18n";

interface Props {
  questions: QuizQuestion[];
}


/** Quiz state lives here; the parent remounts it (key = day) so it resets when the day changes. */
export default function Quiz({ questions }: Props) {
  const { t, num, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const total = questions.length;

  const reset = () => {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl bg-ink px-5 py-4 text-start text-primary-foreground transition-opacity hover:opacity-95"
        data-section="quiz"
      >
        <span className="min-w-0">
          <span className="block text-xs text-primary-foreground/60">{t.quizCount(num(total))}</span>
          <span className="block text-lg font-bold">{t.quizStart}</span>
        </span>
        <span className="ms-auto flex items-center gap-1 text-sm text-primary-foreground/70">
          {t.quizTime}
          <ChevronLeft className="size-5 ltr:rotate-180" aria-hidden="true" />
        </span>
      </button>
    );
  }

  const q = questions[index];
  const answered = selected !== null;

  const choose = (i: number) => {
    if (answered) return;
    setSelected(i);
    if (i === q.correctIndex) setScore((s) => s + 1);
  };
  const next = () => {
    if (index + 1 >= total) {
      setDone(true);
    } else {
      setIndex(index + 1);
      setSelected(null);
    }
  };

  return (
    <section className="rounded-2xl bg-paper p-4 ring-1 ring-ink/10 sm:p-5" aria-label={t.quizTest} data-section="quiz">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[15px] font-bold text-leaf-deep">
          {done ? t.quizResult : t.quizQ(num(index + 1), num(total))}
        </span>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            reset();
          }}
          className="ms-auto flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-ink/60 hover:bg-cream"
        >
          <X className="size-4" aria-hidden="true" />
          {t.close}
        </button>
      </div>

      {done ? (
        <div className="py-4 text-center">
          <p className="font-display text-3xl font-bold">
            {t.score(num(score), num(total))}
          </p>
          <p className="mt-2 text-ink/60">{score === total ? t.perfect : t.review}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-leaf px-5 py-2.5 font-bold text-white hover:bg-leaf-deep"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            {t.retry}
          </button>
        </div>
      ) : (
        <>
          <p className="mb-4 font-display text-xl leading-relaxed sm:text-2xl">{q.question}</p>
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={t.options}>
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correctIndex;
              const isChosen = i === selected;
              let cls = "bg-cream ring-ink/10 hover:ring-leaf/40";
              if (answered && isCorrect) cls = "bg-leaf/15 text-leaf-deep ring-leaf/40";
              else if (answered && isChosen) cls = "bg-destructive/10 ring-destructive/40";
              else if (answered) cls = "bg-cream ring-ink/10 opacity-70";
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={isChosen}
                  aria-disabled={answered}
                  onClick={() => choose(i)}
                  className={`flex items-start gap-2 rounded-xl p-3 text-start ring-1 transition-colors ${cls}`}
                >
                  <span className="font-bold text-ink/50">{t.letters[i]}</span>
                  <span className="min-w-0 flex-1 leading-relaxed">{opt}</span>
                  {answered && isCorrect && <Check className="size-5 shrink-0" aria-label={t.correctAnswer} />}
                </button>
              );
            })}
          </div>
          {answered && (
            <div className="mt-4 animate-fade-up rounded-xl bg-cream p-4 ring-1 ring-ink/10" aria-live="polite">
              <p className="mb-1 text-sm font-bold text-leaf-deep">{t.evidence}</p>
              {q.explanation &&
                (lang === "en" && isArabicText(q.explanation) ? (
                  <>
                    <p lang="ar" dir="rtl" className="font-display text-lg leading-loose whitespace-pre-line">{q.explanation}</p>
                    <p className="mt-1 text-xs text-ink/55">{t.arabicOnly}</p>
                  </>
                ) : (
                  <p className="font-display text-lg leading-loose whitespace-pre-line">{q.explanation}</p>
                ))}
              <button
                type="button"
                onClick={next}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-leaf px-5 py-2.5 font-bold text-white hover:bg-leaf-deep"
              >
                {index + 1 >= total ? t.showResult : t.nextQ}
                <ArrowLeft className="size-4 ltr:rotate-180" aria-hidden="true" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
