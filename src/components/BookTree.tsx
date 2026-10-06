import { Check, ChevronLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Branch, Tree, TreeKey } from "../data/safwa";
import { useLang } from "../lib/i18n";
import LeafReader from "./LeafReader";
import { StarMedallion, StarOutline, latticeBg } from "./Ornament";

interface Props {
  treeKey: TreeKey;
  tree: Tree;
}

const readKey = (k: TreeKey) => `ala-baseerah-read-${k}`;
const loadRead = (k: TreeKey): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(readKey(k)) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

/**
 * The book as a tree: a crest on top, a trunk that fills as you scroll, and each branch (a chapter group or a
 * companion) hanging off it — alternating sides on wide screens, stacked beside the trunk on phones. Every leaf is
 * a heading from the book; tapping it opens the reader with the book's own text.
 */
export default function BookTree({ treeKey, tree }: Props) {
  const { lang, num, t } = useLang();
  const ar = lang === "ar";
  const [open, setOpen] = useState<{ branch: Branch; index: number } | null>(null);
  const [read, setRead] = useState<string[]>(() => loadRead(treeKey));
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const [active, setActive] = useState<string | undefined>(tree.branches[0]?.id);
  const listRef = useRef<HTMLOListElement>(null);
  const indexRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(readKey(treeKey), JSON.stringify(read));
    } catch {
      /* storage unavailable */
    }
  }, [read, treeKey]);

  // Reveal branches as they scroll in, and track which one is in view for the index bar.
  useEffect(() => {
    const items = Array.from(listRef.current?.querySelectorAll<HTMLElement>("[data-branch]") ?? []);
    if (!("IntersectionObserver" in window)) {
      setSeen(new Set(items.map((el) => el.dataset.branch!)));
      return;
    }
    const reveal = new IntersectionObserver(
      (entries) => {
        const ids = entries.filter((e) => e.isIntersecting).map((e) => (e.target as HTMLElement).dataset.branch!);
        if (ids.length) setSeen((s) => new Set([...s, ...ids]));
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    const spy = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive((hit.target as HTMLElement).dataset.branch);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    items.forEach((el) => {
      reveal.observe(el);
      spy.observe(el);
    });
    return () => {
      reveal.disconnect();
      spy.disconnect();
    };
  }, [tree]);

  // The trunk "grows" with scroll: its fill height follows how far the reader has scrolled through the branches.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = listRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.55 - r.top) / r.height));
      el.style.setProperty("--grow", String(p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Keep the active chip of the index bar in view.
  useEffect(() => {
    const chip = indexRef.current?.querySelector<HTMLElement>(`[data-jump="${active}"]`);
    chip?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [active]);

  const openLeaf = (branch: Branch, index: number) => {
    setOpen({ branch, index });
    const id = branch.leaves[index].id;
    setRead((r) => (r.includes(id) ? r : [...r, id]));
  };

  const jump = (id: string) => {
    const el = document.querySelector<HTMLElement>(`[data-branch="${id}"]`);
    if (!el) return;
    setSeen((s) => new Set([...s, id]));
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" });
  };

  const total = tree.branches.reduce((n, b) => n + b.leaves.length, 0);
  const readCount = tree.branches.reduce((n, b) => n + b.leaves.filter((l) => read.includes(l.id)).length, 0);
  const pct = total ? Math.round((readCount / total) * 100) : 0;
  const display = ar ? "font-display" : "font-display-en";

  return (
    <div className="relative">
      {/* ── Crest (the root of the tree) ─────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-3xl pt-8">
        <div className="animate-fade-up relative overflow-hidden rounded-[2.5rem] bg-[radial-gradient(120%_140%_at_50%_0%,var(--primary)_0%,var(--primary-deep)_55%,oklch(0.32_0.06_158)_100%)] px-6 pt-14 pb-7 text-center text-white shadow-[0_30px_60px_-25px_oklch(0.35_0.08_158/0.65)] sm:px-12">
          <div className="pointer-events-none absolute inset-0 opacity-[0.13]" style={{ backgroundImage: latticeBg("%23f3c86a", 64) }} aria-hidden="true" />
          <div className="pointer-events-none absolute inset-3 rounded-[2.1rem] border border-saffron/50" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-[18px] rounded-[1.9rem] border border-saffron/20" aria-hidden="true" />

          <h2 lang={ar ? "ar" : "en"} className={`relative ${display} ${ar ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl"} leading-[1.35] font-bold drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)]`}>
            {ar ? tree.root.ar : tree.root.en}
          </h2>
          <p className={`relative mx-auto mt-4 max-w-[58ch] text-white/85 ${ar ? "font-display text-lg leading-[2] sm:text-xl" : "text-[15px] leading-relaxed"}`}>
            {ar ? tree.root.subAr : tree.root.subEn}
          </p>

          <dl className="relative mx-auto mt-7 grid max-w-md grid-cols-3 divide-x divide-white/15 rounded-2xl bg-black/15 py-3 ring-1 ring-white/10 backdrop-blur-sm rtl:divide-x-reverse">
            {[
              [num(tree.branches.length), t.branchesLabel],
              [num(total), t.topicsLabel],
              [ar ? `${num(pct)}٪` : `${pct}%`, t.readLabel],
            ].map(([v, l]) => (
              <div key={l} className="px-2">
                <dt className="sr-only">{l}</dt>
                <dd className={`${display} text-2xl font-bold text-saffron`}>{v}</dd>
                <dd className="text-xs text-white/70">{l}</dd>
              </div>
            ))}
          </dl>
          <div className="relative mx-auto mt-4 h-1 max-w-md overflow-hidden rounded-full bg-white/15" aria-hidden="true">
            <div className="h-full rounded-full bg-saffron transition-[width] duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
        {/* crown medallion over the crest's edge */}
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center">
          <StarMedallion className="size-16 drop-shadow-lg" shape="fill-cream stroke-saffron">
            <span className={`${display} text-2xl font-bold text-leaf-deep`}>{treeKey === "prophet" ? "ﷺ" : num(10)}</span>
          </StarMedallion>
        </div>
      </div>

      {/* ── Sticky index of branches ─────────────────────────────────── */}
      <nav aria-label={t.indexLabel} className="sticky top-0 z-30 -mx-4 mt-10 border-y border-ink/10 bg-cream/85 backdrop-blur-md sm:-mx-6">
        <div ref={indexRef} className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-2.5 sm:px-6">
          {tree.branches.map((b, i) => {
            const done = b.leaves.every((l) => read.includes(l.id));
            const on = b.id === active;
            return (
              <button
                key={b.id}
                type="button"
                data-jump={b.id}
                onClick={() => jump(b.id)}
                aria-current={on ? "true" : undefined}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition ${
                  on ? "bg-leaf text-white shadow-md shadow-leaf/25" : "text-ink/65 hover:bg-paper hover:text-ink"
                }`}
              >
                <span className={`text-xs ${on ? "text-saffron" : "text-ink/35"}`}>{num(i + 1)}</span>
                {ar ? b.ar : b.en}
                {done && <Check className={`size-3.5 ${on ? "text-white" : "text-leaf"}`} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Trunk + branches ─────────────────────────────────────────── */}
      <ol ref={listRef} className="relative mt-10 pb-6" style={{ ["--grow" as string]: 0 }}>
        <span aria-hidden="true" className="absolute top-0 bottom-0 start-[18px] w-[3px] rounded-full bg-ink/[0.07] md:start-auto md:left-1/2 md:-translate-x-1/2" />
        <span
          aria-hidden="true"
          className="absolute top-0 start-[18px] w-[3px] rounded-full bg-gradient-to-b from-saffron via-saffron to-leaf shadow-[0_0_14px_oklch(0.76_0.145_76/0.55)] md:start-auto md:left-1/2 md:-translate-x-1/2"
          style={{ height: "calc(var(--grow) * 100%)" }}
        />
        {tree.branches.map((b, i) => {
          const even = i % 2 === 0;
          const readHere = b.leaves.filter((l) => read.includes(l.id)).length;
          const complete = readHere === b.leaves.length;
          const isIn = seen.has(b.id);
          // Branches overlap the one above (md:-mt-20), so only the card takes clicks; otherwise the row covers the topics above it.
          return (
            <li
              key={b.id}
              data-branch={b.id}
              className={`group/branch pointer-events-none relative grid py-4 ps-14 md:grid-cols-2 md:ps-0 ${i > 0 ? "md:-mt-20" : ""} transition duration-700 ease-out motion-reduce:transition-none ${
                isIn ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              {/* knot on the trunk */}
              <span className="absolute top-9 z-10 start-[3px] md:start-auto md:left-1/2 md:-translate-x-1/2" aria-hidden="true">
                <StarMedallion
                  className={`size-9 transition-transform duration-500 ${isIn ? "scale-100" : "scale-50"}`}
                  shape={complete ? "fill-leaf stroke-leaf" : "fill-cream stroke-saffron"}
                >
                  {complete ? <Check className="size-4 text-white" /> : <span className="block size-2 rounded-full bg-saffron" />}
                </StarMedallion>
              </span>
              {/* twig from the trunk to the card */}
              <span
                aria-hidden="true"
                className={`absolute top-[3.4rem] h-[2px] start-9 w-5 md:w-[calc(50%-1.1rem-1.5rem)] ${
                  even
                    ? "md:start-auto md:end-[calc(50%+1.1rem)] bg-gradient-to-l from-saffron/70 to-leaf/20 rtl:bg-gradient-to-r"
                    : "md:start-[calc(50%+1.1rem)] bg-gradient-to-r from-saffron/70 to-leaf/20 rtl:bg-gradient-to-l"
                }`}
              />

              <section
                className={`pointer-events-auto relative isolate overflow-hidden rounded-[1.75rem] bg-card p-5 shadow-[0_1px_0_oklch(0.28_0.02_86/0.04),0_12px_30px_-18px_oklch(0.28_0.02_86/0.25)] ring-1 ring-ink/[0.08] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_oklch(0.45_0.095_158/0.45)] hover:ring-saffron/40 sm:p-6 ${
                  even ? "md:col-start-1 md:me-12" : "md:col-start-2 md:ms-12"
                }`}
              >
                <span aria-hidden="true" className="absolute inset-x-10 top-0 h-[3px] rounded-b-full bg-gradient-to-r from-transparent via-saffron to-transparent opacity-80" />
                <StarOutline className="pointer-events-none absolute -end-10 -bottom-10 -z-10 size-44 text-saffron/[0.12] transition-transform duration-700 group-hover/branch:rotate-45" />

                <header className="flex items-start gap-4">
                  <StarMedallion className="size-12" shape="fill-saffron/15 stroke-saffron/70">
                    <span className={`${display} text-lg font-bold text-leaf-deep`}>{num(i + 1)}</span>
                  </StarMedallion>
                  <div className="min-w-0 flex-1">
                    <h3 className={`${display} ${ar ? "text-[1.85rem]" : "text-[1.4rem]"} leading-snug font-bold text-ink`}>{ar ? b.ar : b.en}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink/55">{ar ? b.blurbAr : b.blurbEn}</p>
                  </div>
                </header>

                <div className="mt-4 flex items-center gap-3 text-xs font-semibold text-ink/45">
                  <span>{t.topicsCount(num(b.leaves.length))}</span>
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-ink/[0.07]">
                    <span className="block h-full rounded-full bg-leaf transition-[width] duration-700" style={{ width: `${(readHere / b.leaves.length) * 100}%` }} />
                  </span>
                  <span className={complete ? "text-leaf-deep" : ""}>
                    {num(readHere)}/{num(b.leaves.length)}
                  </span>
                </div>

                <ul className="mt-4 flex flex-wrap gap-2">
                  {b.leaves.map((l, j) => {
                    const done = read.includes(l.id);
                    return (
                      <li key={l.id}>
                        <button
                          type="button"
                          onClick={() => openLeaf(b, j)}
                          data-leaf={l.id}
                          className={`group/leaf inline-flex items-center gap-2 rounded-full py-1.5 ps-2.5 pe-3.5 text-sm font-semibold ring-1 transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                            done
                              ? "bg-leaf/[0.08] text-leaf-deep ring-leaf/25 hover:ring-leaf/50"
                              : "bg-cream text-ink/80 ring-ink/10 hover:bg-card hover:text-leaf-deep hover:ring-saffron/60"
                          }`}
                        >
                          {done ? (
                            <Check className="size-3.5 text-leaf" aria-hidden="true" />
                          ) : (
                            <span className="size-1.5 rotate-45 bg-saffron transition-transform group-hover/leaf:scale-150" aria-hidden="true" />
                          )}
                          {ar ? l.ar : l.en}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </li>
          );
        })}
      </ol>

      {/* ── Foot of the tree ─────────────────────────────────────────── */}
      <div className="relative flex flex-col items-center pt-2 text-center">
        <StarMedallion className="size-12" shape={pct === 100 ? "fill-leaf stroke-leaf" : "fill-cream stroke-saffron"}>
          {pct === 100 ? <Check className="size-5 text-white" /> : <ChevronLeft className="size-5 rotate-[-90deg] text-saffron" />}
        </StarMedallion>
        <p className={`mt-3 ${display} text-xl font-bold text-ink/80`}>{pct === 100 ? t.treeDone : t.treeEnd}</p>
        <p className="mt-1 text-sm text-ink/50">{t.readOf(num(readCount), num(total))}</p>
      </div>

      {open && (
        <LeafReader
          branch={open.branch}
          branchNo={tree.branches.indexOf(open.branch) + 1}
          index={open.index}
          nextBranch={tree.branches[tree.branches.indexOf(open.branch) + 1]}
          onIndex={(index) => openLeaf(open.branch, index)}
          onBranch={(branch) => openLeaf(branch, 0)}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
