import { ArrowLeft, ArrowRight, BookOpen, Languages, Minus, Plus, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { safwa, type Branch } from "../data/safwa";
import { useLang } from "../lib/i18n";
import CompanionChat from "./CompanionChat";
import { Divider, StarMedallion, latticeBg } from "./Ornament";

interface Props {
  branch: Branch;
  branchNo: number;
  index: number;
  /** The branch after this one; the last topic of a branch continues into it. */
  nextBranch?: Branch;
  /** Shown on the last topic of the whole tree. */
  endLabel: string;
  onIndex: (i: number) => void;
  onBranch: (branch: Branch) => void;
  onClose: () => void;
}

const SIZES = ["text-lg leading-[2]", "text-xl leading-[2.1] sm:text-[1.35rem]", "text-2xl leading-[2.15] sm:text-[1.6rem]"];
const SUMMARY_SIZES = ["text-[15px]", "text-base sm:text-[17px]", "text-lg sm:text-xl"];
const SIZE_KEY = "ala-baseerah-reader-size";
const loadSize = () => {
  try {
    const v = Number(localStorage.getItem(SIZE_KEY));
    return v >= 0 && v < SIZES.length ? v : 1;
  } catch {
    return 1;
  }
};

/**
 * Highlights what the book quotes, without changing a letter of it: Quran between {…} gets ornate brackets and its
 * [سورة: آية] reference, and speech between "…" (when the quotes in the paragraph are balanced) is set in green.
 */
function rich(p: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\{([^}]*)\}(\s*\[[^\]]*\])?/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const speech = (s: string, key: string) => {
    if ((s.match(/"/g) ?? []).length % 2 !== 0) return [s];
    return s.split(/("[^"]+")/).map((part, i) =>
      part.startsWith('"') ? (
        <span key={`${key}-${i}`} className="text-leaf-deep">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };
  while ((m = re.exec(p))) {
    out.push(...speech(p.slice(last, m.index), `s${last}`));
    out.push(
      <span key={`q${m.index}`} className="font-bold text-[oklch(0.5_0.11_70)]">
        ﴿{m[1].trim()}﴾{m[2] && <span className="ms-1 text-[0.7em] font-normal text-ink/45">{m[2].trim()}</span>}
      </span>,
    );
    last = m.index + m[0].length;
  }
  out.push(...speech(p.slice(last), `s${last}`));
  return out;
}

const WIDE = "(min-width: 1024px)";
const useWide = () => {
  const [wide, setWide] = useState(() => window.matchMedia(WIDE).matches);
  useEffect(() => {
    const mq = window.matchMedia(WIDE);
    const on = () => setWide(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
};

/** Side sheet that shows one heading of «صفة الصفوة» exactly as the book has it. */
export default function LeafReader({ branch, branchNo, index, nextBranch, endLabel, onIndex, onBranch, onClose }: Props) {
  const { t, lang, num } = useLang();
  const ar = lang === "ar";
  const display = ar ? "font-display" : "font-display-en";
  const leaf = branch.leaves[index];
  const next = branch.leaves[index + 1];
  const prev = branch.leaves[index - 1];
  // Where "next" leads: the next topic, else the next branch's first topic, else back to the tree.
  const forward = next
    ? { label: t.nextTopic, title: ar ? next.ar : next.en, go: () => onIndex(index + 1) }
    : nextBranch
      ? { label: t.nextBranch, title: ar ? nextBranch.ar : nextBranch.en, go: () => onBranch(nextBranch) }
      : { label: endLabel, title: t.backToTree, go: () => close() };
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [size, setSize] = useState(loadSize);
  const [progress, setProgress] = useState(0);
  const [closing, setClosing] = useState(false);
  // The journey companion sits beside the text on wide screens and under it on phones.
  const wide = useWide();
  const chat = (
    <CompanionChat
      key={`${lang}-${leaf.id}`}
      variant="panel"
      context={{ day: 0, title: leaf.ar, unit: branch.ar, lesson: leaf.paras.join("\n"), principle: "" }}
      sub={t.topicChatSub}
      hello={t.topicChatHello}
      placeholder={t.topicPlaceholder}
    />
  );

  const close = () => {
    setClosing(true);
    window.setTimeout(onClose, 220);
  };

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      before?.focus?.();
    };
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
    setProgress(0);
  }, [index]);

  useEffect(() => {
    try {
      localStorage.setItem(SIZE_KEY, String(size));
    } catch {
      /* ignore */
    }
  }, [size]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onScroll = () => {
    const el = bodyRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? el.scrollTop / max : 1);
  };

  const Prev = ar ? ArrowRight : ArrowLeft;
  const Next = ar ? ArrowLeft : ArrowRight;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="leaf-title">
      <button
        type="button"
        aria-label={t.close}
        onClick={close}
        className={`absolute inset-0 cursor-default bg-[oklch(0.22_0.03_160/0.55)] backdrop-blur-[3px] ${closing ? "animate-fade-out" : "animate-fade-in"}`}
      />
      <div
        className={`relative flex h-full w-full max-w-[46rem] flex-col bg-cream lg:max-w-[78rem] shadow-[0_0_80px_-10px_rgba(0,0,0,0.45)] ${closing ? "animate-sheet-out" : "animate-sheet-in"}`}
      >
        {/* reading progress */}
        <div className="absolute inset-x-0 top-0 z-20 h-[3px] bg-transparent" aria-hidden="true">
          <div className="h-full bg-gradient-to-l from-saffron to-leaf transition-[width] duration-150 ltr:bg-gradient-to-r" style={{ width: `${progress * 100}%` }} />
        </div>

        <header className="relative overflow-hidden border-b border-saffron/25 bg-[linear-gradient(180deg,var(--card),var(--background))] px-5 pt-5 pb-4 sm:px-8">
          <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: latticeBg("%23333", 56) }} aria-hidden="true" />
          <div className="relative flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold text-leaf-deep">
                <StarMedallion className="size-6" shape="fill-saffron/20 stroke-saffron/70">
                  <span className="text-[11px] font-bold">{num(branchNo)}</span>
                </StarMedallion>
                <span className="truncate">{ar ? branch.ar : branch.en}</span>
                <span className="text-ink/35">·</span>
                <span className="shrink-0 text-ink/45">
                  {num(index + 1)} {t.of} {num(branch.leaves.length)}
                </span>
              </p>
              <h2 id="leaf-title" className={`mt-2 ${display} ${ar ? "text-[2.1rem] sm:text-4xl" : "text-2xl sm:text-3xl"} leading-snug font-bold`}>
                {ar ? leaf.ar : leaf.en}
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <div className="flex items-center rounded-full bg-paper p-0.5 ring-1 ring-ink/10" role="group" aria-label={t.textSize}>
                <button
                  type="button"
                  onClick={() => setSize((s) => Math.max(0, s - 1))}
                  disabled={size === 0}
                  aria-label={t.smaller}
                  className="flex size-8 items-center justify-center rounded-full hover:bg-card disabled:opacity-30"
                >
                  <Minus className="size-3.5" aria-hidden="true" />
                </button>
                <span className="px-0.5 font-display text-base font-bold text-ink/60" aria-hidden="true">
                  {ar ? "ع" : "A"}
                </span>
                <button
                  type="button"
                  onClick={() => setSize((s) => Math.min(SIZES.length - 1, s + 1))}
                  disabled={size === SIZES.length - 1}
                  aria-label={t.larger}
                  className="flex size-8 items-center justify-center rounded-full hover:bg-card disabled:opacity-30"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                </button>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label={t.close}
                className="flex size-9 items-center justify-center rounded-full bg-paper ring-1 ring-ink/10 transition hover:rotate-90 hover:ring-leaf/50"
              >
                <X className="size-[18px]" aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <div ref={bodyRef} onScroll={onScroll} className="relative min-w-0 flex-1 overflow-y-auto">
            <article key={leaf.id} className="animate-fade-up mx-auto max-w-[40rem] px-5 pt-7 pb-10 sm:px-8">
              <p className="mb-6 flex items-start gap-2.5 rounded-2xl bg-card px-4 py-3 text-sm text-ink/60 ring-1 ring-saffron/25">
                <BookOpen className="mt-0.5 size-4 shrink-0 text-saffron" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-ink/75">{t.fromSafwa}</span>
                  <span className="mx-1.5 text-ink/30">·</span>
                  <span lang="ar" className="font-display text-[15px]">
                    «{leaf.bookAr}»
                  </span>
                </span>
              </p>
              {!ar && leaf.summaryEn.length > 0 && (
                <section className="mb-8 overflow-hidden rounded-3xl bg-card ring-1 ring-leaf/20" data-summary>
                  <header className="flex items-center gap-2.5 border-b border-leaf/15 bg-leaf/[0.06] px-5 py-3">
                    <Languages className="size-4 shrink-0 text-leaf-deep" aria-hidden="true" />
                    <h3 className="font-display-en text-lg font-bold text-leaf-deep">{t.summaryLabel}</h3>
                  </header>
                  <ul className={`flex flex-col gap-3.5 px-5 py-5 leading-relaxed text-ink/85 ${SUMMARY_SIZES[size]}`}>
                    {leaf.summaryEn.map((s, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="mt-[0.6em] size-1.5 shrink-0 rotate-45 bg-saffron" aria-hidden="true" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="border-t border-ink/[0.06] px-5 py-3 text-xs leading-relaxed text-ink/50">{t.summaryNote}</p>
                </section>
              )}
              {!ar && <h3 className="mb-4 font-display-en text-lg font-bold text-ink/70">{t.originalText}</h3>}

              <div lang="ar" dir="rtl" className={`flex flex-col gap-5 font-display text-ink/90 ${SIZES[size]}`}>
                {leaf.paras.map((p, i) =>
                  p.includes("\t") ? (
                    <p key={i} className="relative mx-auto w-full max-w-[34rem] rounded-2xl border-y border-saffron/30 bg-saffron/[0.07] px-5 py-3 text-center text-leaf-deep">
                      {p.split("\t").map((h, k) => (
                        <span key={k} className="block sm:inline">
                          {k > 0 && (
                            <span className="mx-5 hidden text-saffron sm:inline" aria-hidden="true">
                              ۞
                            </span>
                          )}
                          {h}
                        </span>
                      ))}
                    </p>
                  ) : (
                    <p key={i}>
                      {rich(p)}
                    </p>
                  ),
                )}
              </div>

              <Divider className="mt-10" />
              <p className="mt-3 text-center text-xs text-ink/40">{ar ? safwa.source.ar : safwa.source.en}</p>

              <button
                type="button"
                onClick={forward.go}
                className="group mt-8 flex w-full items-center gap-4 rounded-3xl bg-leaf p-5 text-start text-white shadow-lg shadow-leaf/25 transition hover:-translate-y-0.5 hover:bg-leaf-deep"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white/65">{forward.label}</p>
                  <p className={`mt-1 ${display} text-2xl font-bold`}>{forward.title}</p>
                </div>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15 transition group-hover:bg-saffron group-hover:text-ink">
                  <Next className="size-5" aria-hidden="true" />
                </span>
              </button>

              {!wide && <div className="mt-8 overflow-hidden rounded-3xl">{chat}</div>}
            </article>
          </div>
          {wide && <div className="w-[26rem] shrink-0 border-s border-ink/10">{chat}</div>}
        </div>

        <footer className="flex items-center gap-2 border-t border-ink/10 bg-card/80 px-5 py-3 backdrop-blur sm:px-8">
          <button
            type="button"
            disabled={!prev}
            onClick={() => onIndex(index - 1)}
            className="inline-flex max-w-[45%] items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold text-leaf-deep ring-1 ring-leaf/25 transition hover:bg-leaf/5 disabled:opacity-30"
          >
            <Prev className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{prev ? (ar ? prev.ar : prev.en) : t.prevTopic}</span>
          </button>
          <div className="mx-auto hidden gap-1 sm:flex" aria-hidden="true">
            {branch.leaves.map((l, i) => (
              <span key={l.id} className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-saffron" : "w-1.5 bg-ink/15"}`} />
            ))}
          </div>
          <button
            type="button"
            onClick={forward.go}
            className="ms-auto inline-flex max-w-[45%] items-center gap-1.5 rounded-full bg-leaf px-3.5 py-2 text-sm font-bold text-white transition hover:bg-leaf-deep disabled:opacity-30 sm:ms-0"
          >
            <span className="truncate">{forward.title}</span>
            <Next className="size-4 shrink-0" aria-hidden="true" />
          </button>
        </footer>
      </div>
    </div>
  );
}
