import { ArrowLeft, BookOpenCheck, Moon, Users } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import Logo from "../components/Logo";
import { totalDays } from "../data/journey";
import { LangToggle, useLang } from "../lib/i18n";

interface Feature {
  title: string;
  subtitle?: string;
  blurb: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  href?: string;
  cta?: string;
  tone: string;
}

export default function Home() {
  const { t, num, lang } = useLang();
  const features: Feature[] = [
    { title: t.f1(num(totalDays)), blurb: t.f1b, icon: BookOpenCheck, href: "#/journey", tone: "bg-leaf text-white" },
    { title: t.f2, subtitle: t.f2s, blurb: t.f2b, icon: Moon, href: "#/prophet", cta: t.explore, tone: "bg-saffron text-ink" },
    { title: t.f3, subtitle: t.f3s, blurb: t.f3b, icon: Users, href: "#/ten", cta: t.explore, tone: "bg-ink text-cream" },
  ];
  const display = lang === "ar" ? "font-display" : "font-display-en";

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream text-ink">
      {/* soft geometric backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%23333' stroke-width='1.2'%3E%3Crect x='22' y='22' width='36' height='36'/%3E%3Crect x='22' y='22' width='36' height='36' transform='rotate(45 40 40)'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <div className="relative mx-auto flex max-w-6xl justify-end px-4 pt-4 sm:px-6">
        <LangToggle />
      </div>

      <main className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pt-6 pb-20 sm:px-6 sm:pt-10">
        <div className="animate-fade-up flex flex-col items-center text-center">
          <Logo size="lg" />
          {lang === "en" && (
            <p className="mt-4 font-display-en text-xl tracking-wide text-ink/60 italic sm:text-2xl">Ala Baseerah · With Clear Insight</p>
          )}
          <div className="mt-8 h-px w-16 bg-saffron/60" aria-hidden="true" />
          <p lang="ar" dir="rtl" className="mx-auto mt-8 max-w-[40ch] font-display text-xl leading-[2] text-ink/70 sm:text-2xl">
            ﴿قُلْ هَٰذِهِۦ سَبِيلِيٓ أَدْعُوٓا۟ إِلَى ٱللَّهِ ۚ عَلَىٰ بَصِيرَةٍ أَنَا۠ وَمَنِ ٱتَّبَعَنِي ۖ وَسُبْحَٰنَ ٱللَّهِ وَمَآ أَنَا۠ مِنَ ٱلْمُشْرِكِينَ﴾
          </p>
          <p className="mt-3 text-sm text-ink/45">{t.verseRef}</p>
          {t.verseTr && (
            <details className="group mt-5 w-full max-w-[62ch] text-sm text-ink/60">
              <summary className="mx-auto w-fit cursor-pointer list-none rounded-full px-3 py-1 font-semibold text-leaf-deep ring-1 ring-leaf/25 hover:bg-leaf/5">
                {t.verseTrLabel}
              </summary>
              <p className="mt-4 leading-relaxed">{t.verseTr}</p>
            </details>
          )}
        </div>

        <h2 className="sr-only">{t.sections}</h2>
        <div className="mt-12 grid w-full gap-5 md:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            const ready = !!f.href;
            const inner = (
              <>
                <span className={`flex size-14 items-center justify-center rounded-2xl ${f.tone}`}>
                  <Icon className="size-7" aria-hidden="true" />
                </span>
                <h3 className={`mt-6 ${display} text-3xl leading-snug font-bold`}>{f.title}</h3>
                {f.subtitle && <p className="mt-1 text-sm font-semibold text-leaf-deep">{f.subtitle}</p>}
                <p className="mt-3 leading-relaxed text-ink/65">{f.blurb}</p>
                <span className={`mt-auto inline-flex items-center gap-2 pt-6 font-bold ${ready ? "text-leaf-deep" : "text-ink/40"}`}>
                  {ready ? (
                    <>
                      {f.cta ?? t.start}
                      <ArrowLeft className="size-5 transition-transform ltr:rotate-180 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1" aria-hidden="true" />
                    </>
                  ) : (
                    <span className="rounded-full bg-paper px-3 py-1 text-xs ring-1 ring-ink/10">{t.soon}</span>
                  )}
                </span>
              </>
            );
            const cls = "group animate-fade-up flex min-h-[320px] flex-col rounded-3xl bg-card p-7 text-start ring-1 ring-ink/10 transition";
            return ready ? (
              <a
                key={i}
                href={f.href}
                data-feature={i + 1}
                style={{ animationDelay: `${120 + i * 90}ms` }}
                className={`${cls} hover:-translate-y-1 hover:shadow-xl hover:shadow-leaf/10 hover:ring-leaf/40`}
              >
                {inner}
              </a>
            ) : (
              <div key={i} data-feature={i + 1} aria-disabled="true" style={{ animationDelay: `${120 + i * 90}ms` }} className={`${cls} opacity-90`}>
                {inner}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
