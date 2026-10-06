// End-to-end check of the built site in headless Chromium.
//   npm run build && node scripts/check-all-days.mjs [baseUrl]
// Walks day 1 → 90 with the "next day" button and verifies every day renders fully.
// With CHECK_CHAT=1 (site built with VITE_RAG_ENDPOINT pointing to scripts/mock-rag.mjs) it also tests the chat.
import { readFileSync, mkdirSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://localhost:4173/";
const data = JSON.parse(readFileSync(new URL("../src/data/journey.generated.json", import.meta.url), "utf8"));
const SHOTS = new URL("../screenshots/", import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });

const problems = [];
const fail = (msg) => problems.push(msg);
const launch = () =>
  chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined }).catch(() => chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }));

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, ignoreHTTPSErrors: true });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
// External font requests can fail in sandboxes/offline; they are not site errors.
page.on("console", (m) => m.type() === "error" && !/fonts\.g|Failed to load resource: net::/.test(m.text()) && errors.push(m.text()));
// Home page: logo + 3 features; first one opens the journey.
await page.goto(BASE, { waitUntil: "networkidle" });
if (!(await page.getByRole("img", { name: "على بصيرة" }).count())) fail("home: logo missing");
if ((await page.locator("[data-feature]").count()) !== 3) fail("home: expected 3 feature cards");
for (const t of ["دليل الشاب المسلم", "أشرف الخلق", "مسلمون حسُن إسلامهم", "العشرة المبشرون بالجنة"])
  if (!(await page.getByText(t).count())) fail(`home: missing "${t}"`);
await page.screenshot({ path: `${SHOTS}home.png`, fullPage: true });
await page.locator('[data-feature="1"]').click();
await page.locator("article[data-day]").waitFor();

const PAGE_CITE = /\(\s*ص\s*[\d٠-٩]|(^|[\s(])ص\s?[\d٠-٩]+/;
const FORBIDDEN_UI = ["الفصل الأول", "الفصل الثاني", "الفصل الثالث", "مقدمة وتمهيد", "تنبيهات", "مصادر الصفحات", "جاهز للمراجعة", "خريطة/إنفوجراف"];

async function checkDay(n) {
  const d = data.days[n - 1];
  const art = page.locator("article[data-day]");
  await art.waitFor();
  const shown = Number(await art.getAttribute("data-day"));
  if (shown !== n) return fail(`expected day ${n}, card shows ${shown}`);
  const sections = await art.locator("section[data-section]").evaluateAll((els) =>
    els.map((e) => ({ title: e.getAttribute("data-section"), h3: e.querySelector("h3")?.textContent?.trim() ?? "", text: e.innerText.trim() })),
  );
  for (const s of sections) {
    if (s.title === "quiz") continue;
    if (!s.h3) fail(`day ${n}: section "${s.title}" has no title row`);
    if (s.text.replace(s.h3, "").trim().length < 2) fail(`day ${n}: section "${s.title}" is empty`);
  }
  const titles = sections.map((s) => s.title);
  const expectEvidence = [["الدليل من القرآن", d.quran], ["الدليل من السنة", d.sunnah], ["تصحيح مفهوم", d.misconception], ["اقتباس من الكتاب", d.quote]];
  for (const [t, v] of expectEvidence) {
    if (!!v !== titles.includes(t)) fail(`day ${n}: section "${t}" presence mismatch (data ${!!v})`);
  }
  for (const t of ["سؤال النهارده", "المبدأ الأساسي", "درس اليوم"]) if (!titles.includes(t)) fail(`day ${n}: missing "${t}"`);
  if ((await art.locator('[data-section="عمل النهارده"]').count()) !== 1) fail(`day ${n}: missing action card`);
  const bodyText = await page.locator("body").innerText();
  if (PAGE_CITE.test(bodyText.replace(/[﴿][^﴾]*[﴾]/g, ""))) {
    const m = bodyText.match(PAGE_CITE);
    fail(`day ${n}: page citation visible: "${bodyText.slice(Math.max(0, m.index - 20), m.index + 15)}"`);
  }
  for (const f of FORBIDDEN_UI) if (bodyText.includes(f)) fail(`day ${n}: forbidden text visible: ${f}`);
  if (!bodyText.includes(d.title)) fail(`day ${n}: title not rendered`);
}

async function runQuiz(n) {
  const quizBtn = page.getByRole("button", { name: /ابدأ اختبار اليوم/ });
  await quizBtn.click();
  for (let i = 0; i < 3; i++) {
    const opts = page.locator('[role="radio"]');
    if ((await opts.count()) !== 4) fail(`day ${n}: quiz q${i + 1} does not show 4 options`);
    await opts.nth(data.days[n - 1].quiz[i].correctIndex).click();
    const ev = await page.getByText("الدليل:").count();
    if (!ev) fail(`day ${n}: evidence box missing after answering q${i + 1}`);
    await page.getByRole("button", { name: i < 2 ? "السؤال التالي" : "عرض النتيجة" }).click();
  }
  const score = await page.getByText("٣ من ٣").count();
  if (!score) fail(`day ${n}: perfect score not shown`);
  if (!(await page.getByRole("button", { name: "إعادة الاختبار" }).count())) fail(`day ${n}: retry button missing`);
}

// Walk 1 → 90 with the next button.
const WALK_TO = process.env.CHAT_ONLY ? 1 : data.days.length;
for (let n = 1; n <= WALK_TO; n++) {
  await checkDay(n);
  if ([1, 2, 3, 5, 7, 18, 23, 90].includes(n)) {
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${SHOTS}day-${n}.png`, fullPage: true });
    await runQuiz(n);
  }
  if (n === WALK_TO && WALK_TO < data.days.length) break;
  if (n < data.days.length) {
    await page.getByRole("button", { name: "المتابعة إلى اليوم التالي" }).click();
  } else {
    if (!(await page.getByText("أتممت الرحلة").count())) fail("day 90: completion message missing");
    if (await page.getByRole("button", { name: "المتابعة إلى اليوم التالي" }).count()) fail("day 90: next button still shown");
  }
}

// English pass: toggle the language and walk all days again.
if (!process.env.CHAT_ONLY) {
  await page.goto(BASE + "#/journey", { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("[data-lang-toggle]").first().click();
  if ((await page.getAttribute("html", "dir")) !== "ltr" || (await page.getAttribute("html", "lang")) !== "en") fail("en: html dir/lang not switched");
  for (let n = 1; n <= data.days.length; n++) {
    const t = data.en.days[n];
    const art = page.locator("article[data-day]");
    await art.waitFor();
    if (Number(await art.getAttribute("data-day")) !== n) { fail(`en: expected day ${n}`); break; }
    const h1 = (await art.locator("h1").innerText()).trim();
    if (!t?.title || h1 !== t.title) fail(`en day ${n}: title not English`);
    const titles = await art.locator("section[data-section]").evaluateAll((els) => els.map((e) => e.getAttribute("data-section")));
    for (const [k, v] of [["الدليل من القرآن", data.days[n - 1].quran], ["الدليل من السنة", data.days[n - 1].sunnah], ["تصحيح مفهوم", data.days[n - 1].misconception]])
      if (!!v !== titles.includes(k)) fail(`en day ${n}: section ${k} presence mismatch`);
    if (data.days[n - 1].quran) {
      const q = await art.locator('[data-section="الدليل من القرآن"]').innerText();
      if (!q.includes("Source:")) fail(`en day ${n}: Quran translation/source missing`);
    }
    if (data.days[n - 1].sunnah && !(await art.locator('[data-section="الدليل من السنة"]').innerText()).includes("approved source"))
      fail(`en day ${n}: Sunnah untranslated note missing`);
    const body = await page.locator("body").innerText();
    if (PAGE_CITE.test(body.replace(/[﴿][^﴾]*[﴾]/g, ""))) fail(`en day ${n}: page citation visible`);
    if ([1, 3, 30, 90].includes(n)) {
      await page.screenshot({ path: `${SHOTS}en-day-${n}.png`, fullPage: true });
      const quizBtn = page.getByRole("button", { name: /Start today's quiz/ });
      await quizBtn.click();
      for (let i = 0; i < 3; i++) {
        await page.locator('[role="radio"]').nth(data.days[n - 1].quiz[i].correctIndex).click();
        await page.getByRole("button", { name: i < 2 ? "Next question" : "Show result" }).click();
      }
      if (!(await page.getByText("3 of 3").count())) fail(`en day ${n}: perfect score not shown`);
    }
    if (n < data.days.length) await page.getByRole("button", { name: "Continue to the next day" }).click();
  }
  // home in English, then back to Arabic
  await page.goto(BASE, { waitUntil: "networkidle" });
  if (!(await page.getByText("The Young Muslim's Guide in 90 Days").count())) fail("en: home not translated");
  await page.screenshot({ path: `${SHOTS}en-home.png`, fullPage: true });
  await page.locator("[data-lang-toggle]").first().click();
  if ((await page.getAttribute("html", "dir")) !== "rtl") fail("toggle back to Arabic failed");
}
if (WALK_TO === 1 || !process.env.CHAT_ONLY) {
  await page.goto(BASE + "#/journey", { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
}
// Units dropdown: choose unit 6 → its first day, Escape closes.
await page.getByRole("button", { name: /الوحدة الحالية/ }).click();
await page.locator('[role="listbox"] [role="option"]').nth(5).click();
const u6 = data.units[5];
if (Number(await page.locator("article[data-day]").getAttribute("data-day")) !== u6.startDay) fail("unit selection did not open first day of unit 6");
await page.getByRole("button", { name: /الوحدة الحالية/ }).click();
await page.keyboard.press("Escape");
if (await page.locator('[role="listbox"]').count()) fail("units listbox did not close on Escape");

// Chat
if (process.env.CHECK_CHAT === "1") {
  const MOCK = process.env.MOCK_URL || "http://localhost:8787";
  const input = page.getByLabel("سؤالك");
  if (await input.isDisabled()) fail("chat: input disabled although endpoint configured");
  if (!(await page.getByText("متصل", { exact: true }).count())) fail("chat: status pill not «متصل»");
  await input.fill("ما معنى الإيمان؟");
  await input.press("Enter");
  await page.getByText("إجابة تجريبية").first().waitFor({ timeout: 10000 });
  const last = await (await fetch(`${MOCK}/last`)).json();
  if (process.env.EXPECT_FORMAT === "azure-chat") {
    if (!Array.isArray(last?.messages) || last.messages[0].role !== "system") fail("chat: azure-chat payload shape wrong");
  } else if (!last?.question || !last?.context?.day || !Array.isArray(last?.history)) fail(`chat: payload shape wrong ${JSON.stringify(last)}`);
  if (!(await page.getByText("من الكتاب").count())) fail("chat: sources chips missing");
  await page.screenshot({ path: `${SHOTS}chat-${process.env.EXPECT_FORMAT || process.env.MOCK_SHAPE || "custom"}.png` });
  // suggested question
  const sugg = page.locator("aside button.rounded-full").first();
  if (await sugg.count()) await sugg.click();
  // day change clears
  await page.getByRole("button", { name: "المتابعة إلى اليوم التالي" }).click();
  if (await page.getByText("إجابة تجريبية").count()) fail("chat: conversation not cleared on day change");
} else if (process.env.CHECK_CHAT === "fail") {
  const input = page.getByLabel("سؤالك");
  await input.fill("سؤال");
  await input.press("Enter");
  await page.getByText("إعادة المحاولة").waitFor({ timeout: 10000 });
  await page.screenshot({ path: `${SHOTS}chat-error.png` });
} else {
  const input = page.getByLabel("سؤالك");
  if (!(await input.isDisabled())) fail("chat: input should be disabled when endpoint not set");
  if ((await input.getAttribute("placeholder")) !== "يعمل بعد ربط نظامك الذكي…") fail("chat: placeholder wrong");
  if (!(await page.getByText("بانتظار الربط").count())) fail("chat: status pill not «بانتظار الربط»");
}

// Mobile
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, ignoreHTTPSErrors: true });
await m.goto(BASE, { waitUntil: "networkidle" });
const overflowHome = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
if (overflowHome > 1) fail(`mobile: horizontal overflow on home ${overflowHome}px`);
await m.screenshot({ path: `${SHOTS}mobile-home.png`, fullPage: true });
await m.goto(BASE + "#/journey", { waitUntil: "networkidle" });
const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
if (overflow > 1) fail(`mobile: horizontal overflow ${overflow}px`);
await m.screenshot({ path: `${SHOTS}mobile-day-1.png`, fullPage: true });
// longest title day on mobile
const longest = data.days.reduce((a, b) => (b.title.length + b.lesson.join("").length > a.title.length + a.lesson.join("").length ? b : a));
for (let i = 1; i < longest.day; i++) await m.getByRole("button", { name: "المتابعة إلى اليوم التالي" }).click();
const overflow2 = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
if (overflow2 > 1) fail(`mobile: horizontal overflow on longest day ${longest.day}: ${overflow2}px`);
await m.screenshot({ path: `${SHOTS}mobile-day-${longest.day}.png`, fullPage: true });

if (errors.length) fail("browser errors: " + [...new Set(errors)].join(" | "));
await browser.close();

if (problems.length) {
  console.error(`✖ ${problems.length} problem(s):\n - ` + problems.join("\n - "));
  process.exit(1);
}
console.log(`✔ all ${data.days.length} days rendered and verified (next-day walk 1→${data.days.length}, quizzes, units menu, chat mode: ${process.env.CHECK_CHAT || "disabled"}, mobile)`);
