import { lazy, Suspense, useEffect, useState } from "react";
import Home from "./pages/Home";
import Journey from "./pages/Journey";
// The «صفة الصفوة» trees carry the book's text, so they load only when opened.
const TreePage = lazy(() => import("./pages/TreePage"));
import { useLang } from "./lib/i18n";

export type Route = "home" | "journey" | "prophet" | "ten";

const routeFromHash = (): Route => {
  const h = window.location.hash;
  if (h.startsWith("#/journey")) return "journey";
  if (h.startsWith("#/prophet")) return "prophet";
  if (h.startsWith("#/ten")) return "ten";
  return "home";
};

/** Tiny hash router: "#/" → home, "#/journey" → the 90-day journey, "#/prophet" and "#/ten" → the «صفة الصفوة» trees. */
export default function App() {
  const { t } = useLang();
  const [route, setRoute] = useState<Route>(routeFromHash);
  useEffect(() => {
    const onHash = () => {
      setRoute(routeFromHash());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    const titles: Record<Route, string> = { home: t.siteName, journey: t.journeyTitle, prophet: `${t.f2s} · ${t.siteName}`, ten: `${t.f3s} · ${t.siteName}` };
    document.title = titles[route];
  }, [route, t]);
  if (route === "journey") return <Journey />;
  if (route === "prophet" || route === "ten")
    return (
      <Suspense fallback={<div className="min-h-screen bg-cream" />}>
        <TreePage which={route} />
      </Suspense>
    );
  return <Home />;
}
