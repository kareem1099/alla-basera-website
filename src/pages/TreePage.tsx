import { ArrowLeft, ArrowRight, Moon, Users } from "lucide-react";
import BookTree from "../components/BookTree";
import { Divider, latticeBg } from "../components/Ornament";
import { safwa, type TreeKey } from "../data/safwa";
import { LangToggle, useLang } from "../lib/i18n";

/** «من هو أشرف الخلق؟» and «العشرة المبشرون بالجنة»: one page, two trees from Ibn al-Jawzi's «صفة الصفوة». */
export default function TreePage({ which }: { which: TreeKey }) {
  const { t, lang } = useLang();
  const ar = lang === "ar";
  const display = ar ? "font-display" : "font-display-en";
  const title = which === "prophet" ? t.f2 : t.f3;
  const subtitle = which === "prophet" ? t.f2s : t.f3s;
  const other: TreeKey = which === "prophet" ? "ten" : "prophet";
  const OtherIcon = other === "prophet" ? Moon : Users;
  const Go = ar ? ArrowLeft : ArrowRight;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-cream text-ink">
      {/* soft geometric backdrop that fades out down the page */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[900px] opacity-[0.06] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        style={{ backgroundImage: latticeBg() }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.76_0.145_76/0.18),transparent)]" aria-hidden="true" />

      <header className="relative">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
          <a
            href="#/"
            aria-label={t.homeAria}
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-leaf font-display text-xl font-bold text-white shadow-md shadow-leaf/25 transition hover:bg-leaf-deep"
            lang="ar"
          >
            بصيرة
          </a>
          <a href="#/" className="hidden text-sm font-semibold text-ink/50 hover:text-leaf-deep sm:block">
            {t.siteName}
          </a>
          <div className="ms-auto">
            <LangToggle />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <section className="animate-fade-up mx-auto max-w-3xl pt-4 pb-10 text-center sm:pt-8">
          <p className="text-sm font-semibold tracking-wide text-leaf-deep">{t.fromBook2}</p>
          <Divider className="mt-4" />
          <h1 className={`mt-5 ${display} ${ar ? "text-5xl sm:text-7xl" : "text-4xl sm:text-6xl"} leading-[1.3] font-bold`}>{title}</h1>
          <p className={`mt-3 ${display} text-2xl text-saffron sm:text-3xl`} style={{ color: "oklch(0.6 0.13 72)" }}>
            {subtitle}
          </p>
          <p className="mx-auto mt-5 max-w-[56ch] leading-relaxed text-ink/60">{t.treeHint}</p>
        </section>

        <BookTree key={which} treeKey={which} tree={safwa[which]} />

        <a
          href={`#/${other}`}
          className="group relative mx-auto mt-16 flex max-w-2xl items-center gap-5 overflow-hidden rounded-[2rem] bg-ink p-6 text-cream shadow-xl shadow-ink/20 transition hover:-translate-y-1 sm:p-7"
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: latticeBg("%23f3c86a", 56) }} aria-hidden="true" />
          <span className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-saffron text-ink">
            <OtherIcon className="size-7" aria-hidden="true" />
          </span>
          <div className="relative min-w-0 flex-1">
            <p className="text-xs font-semibold text-cream/55">{t.alsoRead}</p>
            <p className={`mt-1 ${display} text-2xl font-bold sm:text-3xl`}>{other === "prophet" ? t.f2 : t.f3}</p>
            <p className="mt-0.5 text-sm text-saffron">{other === "prophet" ? t.f2s : t.f3s}</p>
          </div>
          <Go className="relative size-6 shrink-0 text-saffron transition group-hover:-translate-x-1 ltr:group-hover:translate-x-1" aria-hidden="true" />
        </a>

        <p className="mt-10 text-center text-xs text-ink/40">{ar ? safwa.source.ar : safwa.source.en}</p>
      </main>
    </div>
  );
}
