// Reads data/90_day_journey.xlsx and writes src/data/journey.generated.json.
// The Excel file is the single source of truth: no content lives in source code.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(root, "data/90_day_journey.xlsx");
const OUT = resolve(root, "src/data/journey.generated.json");
const SHEET_NAME = "خطة الـ90 يوم";
const LETTERS = ["أ", "ب", "ج", "د"];

const fail = (msg) => {
  console.error(`\n✖ build-data: ${msg}\n`);
  process.exit(1);
};

const wb = XLSX.read(readFileSync(SRC), { type: "buffer" });
const norm = (s) => s.replace(/\s+/g, " ").trim();
const sheetName = wb.SheetNames.find((n) => n === SHEET_NAME) ?? wb.SheetNames.find((n) => norm(n) === norm(SHEET_NAME)) ?? wb.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: null, raw: true });

// Read the usage guide once (not displayed) so its rules are visible in the build log.
const guideName = wb.SheetNames.find((n) => n.includes("دليل"));
if (guideName) {
  const guide = XLSX.utils.sheet_to_json(wb.Sheets[guideName], { header: 1, defval: "" });
  console.log(`• usage guide sheet "${guideName}": ${guide.length} rows read`);
}

const clean = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/\r\n?/g, "\n").trim();
  return s === "" ? null : s;
};
const num = (v) => {
  const s = clean(v);
  if (s === null) return null;
  const n = Number(s.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  return Number.isFinite(n) ? n : null;
};
const col = (row, name) => {
  if (name in row) return row[name];
  const key = Object.keys(row).find((k) => norm(k) === norm(name));
  return key ? row[key] : null;
};
// Strip page citations for display only: "(ص11)", "ص 6", "(ص 5-6)", "(ص٥–٦)".
const stripPages = (s) =>
  s
    .replace(/\s*\(\s*ص\s*[\d٠-٩]+(?:\s*[-–]\s*[\d٠-٩]+)?\s*\)/g, "")
    .replace(/\s*(?<![؀-ۿ])ص\s*[\d٠-٩]+(?:\s*[-–]\s*[\d٠-٩]+)?(?![\d٠-٩])/g, "")
    .trim();

const parseOptions = (s) => {
  if (!s) return [];
  return s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[أبجد]\s*[)\-.:]\s*/, ""));
};
const parseMisconception = (s) => {
  if (!s) return null;
  const m = s.match(/الناس\s*بتقول\s*[:：]\s*([\s\S]*?)\s*الصح\s*هو\s*[:：]\s*([\s\S]*)$/);
  if (!m) return { peopleSay: null, correct: s };
  return { peopleSay: m[1].trim() || null, correct: m[2].trim() };
};
const paragraphs = (s) => (s ? s.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean) : []);
const lines = (s) => (s ? s.split("\n").map((p) => p.trim()).filter(Boolean) : []);

const errors = [];
const days = rows
  .filter((r) => num(col(r, "اليوم")) !== null)
  .map((r) => {
    const day = num(col(r, "اليوم"));
    const quiz = [1, 2, 3]
      .map((n) => {
        const question = clean(col(r, `سؤال ${n} - نص السؤال`));
        const options = parseOptions(clean(col(r, `سؤال ${n} - الخيارات`)));
        const letter = clean(col(r, `سؤال ${n} - الإجابة الصحيحة`));
        const evidence = clean(col(r, `سؤال ${n} - الدليل من الكتاب`));
        if (!question && options.length === 0) return null;
        return { question, options, correctIndex: letter ? LETTERS.indexOf(letter.trim()) : -1, explanation: evidence ? stripPages(evidence) : null };
      })
      .filter(Boolean);
    return {
      day,
      unitNumber: num(col(r, "الوحدة رقم")),
      unitTitle: clean(col(r, "اسم الوحدة")),
      title: clean(col(r, "عنوان اليوم")),
      question: clean(col(r, "بطاقة 1 - سؤال النهارده")),
      principle: clean(col(r, "بطاقة 2 - المبدأ")),
      quran: clean(col(r, "بطاقة 3 - الدليل من القرآن")),
      sunnah: clean(col(r, "بطاقة 4 - الدليل من السنة")),
      misconception: parseMisconception(clean(col(r, "بطاقة تصحيح مفهوم"))),
      action: clean(col(r, "عمل النهارده")),
      lesson: paragraphs(clean(col(r, "الدرس المكتوب"))),
      quote: (() => {
        const q = clean(col(r, "اقتباس من الكتاب"));
        return q ? stripPages(q) : null;
      })(),
      quiz,
      askTheBook: lines(clean(col(r, "اسأل في الكتاب (أسئلة مقترحة)"))),
    };
  })
  .sort((a, b) => a.day - b.day);

// ---------- validation ----------
if (days.length !== 90) errors.push(`expected 90 days, found ${days.length}`);
days.forEach((d, i) => {
  if (d.day !== i + 1) errors.push(`day numbering broken at position ${i + 1} (found ${d.day})`);
});
const missing = (field, pick) => days.filter((d) => !pick(d)).map((d) => d.day);
for (const [field, pick] of [
  ["title", (d) => d.title],
  ["question", (d) => d.question],
  ["principle", (d) => d.principle],
  ["action", (d) => d.action],
  ["lesson", (d) => d.lesson.length],
  ["unit number", (d) => d.unitNumber !== null],
  ["unit title", (d) => d.unitTitle],
]) {
  const m = missing(field, pick);
  if (m.length) errors.push(`missing ${field} on days: ${m.join(", ")}`);
}
const badQuiz = days.filter((d) => d.quiz.length !== 3 || d.quiz.some((q) => !q.question || q.options.length !== 4 || q.correctIndex < 0)).map((d) => d.day);
if (badQuiz.length) errors.push(`quiz must have 3 questions × 4 options with a valid letter — bad days: ${badQuiz.join(", ")}`);

const unitMap = new Map();
for (const d of days) {
  const u = unitMap.get(d.unitNumber) ?? { number: d.unitNumber, title: d.unitTitle, startDay: d.day, endDay: d.day };
  u.startDay = Math.min(u.startDay, d.day);
  u.endDay = Math.max(u.endDay, d.day);
  unitMap.set(d.unitNumber, u);
}
const units = [...unitMap.values()].sort((a, b) => a.startDay - b.startDay).map((u) => ({ ...u, dayCount: u.endDay - u.startDay + 1 }));
let expected = 1;
for (const u of units) {
  if (u.startDay !== expected) errors.push(`unit ${u.number} starts at day ${u.startDay}, expected ${expected} (gap or overlap)`);
  const strays = days.filter((d) => d.day >= u.startDay && d.day <= u.endDay && d.unitNumber !== u.number).map((d) => d.day);
  if (strays.length) errors.push(`unit ${u.number} range overlaps other units on days: ${strays.join(", ")}`);
  expected = u.endDay + 1;
}
if (days.length && expected !== days.length + 1) errors.push(`units do not cover all days (end at ${expected - 1})`);

// English translations: data/translations/en/*.json → { units: {n: title}, days: [{ day, title, ... }] }.
// Quran/Sunnah English is accepted only with a named approved source (quranEn/sunnahEn + *Source).
const EN_DIR = resolve(root, "data/translations/en");
const en = { units: {}, days: {} };
let quranEn = null;
if (existsSync(EN_DIR)) {
  for (const f of readdirSync(EN_DIR).filter((x) => x.endsWith(".json")).sort()) {
    const j = JSON.parse(readFileSync(resolve(EN_DIR, f), "utf8"));
    if (j.quran) { quranEn = j; continue; }
    Object.assign(en.units, j.units ?? {});
    for (const t of j.days ?? []) {
      const d = days.find((x) => x.day === t.day);
      if (!d) { errors.push(`en/${f}: unknown day ${t.day}`); continue; }
      const where = `en day ${t.day}`;
      for (const k of ["title", "question", "principle", "action"]) if (!t[k]) errors.push(`${where}: missing ${k}`);
      if (!Array.isArray(t.lesson) || !t.lesson.length) errors.push(`${where}: missing lesson`);
      if (!!t.misconception !== !!d.misconception) errors.push(`${where}: misconception presence differs from Arabic`);
      if (t.quote && !d.quote) errors.push(`${where}: quote given but the Arabic has none`); // omitted → Arabic shown (e.g. a hadith)
      if (!Array.isArray(t.quiz) || t.quiz.length !== d.quiz.length || t.quiz.some((q) => !q.question || q.options?.length !== 4))
        errors.push(`${where}: quiz must mirror the Arabic (3 questions × 4 options, same order)`);
      if (t.quranEn && !t.quranSource) errors.push(`${where}: quranEn needs quranSource`);
      if (t.sunnahEn && !t.sunnahSource) errors.push(`${where}: sunnahEn needs sunnahSource`);
      en.days[t.day] = t;
    }
  }
}
if (quranEn) {
  for (const [day, items] of Object.entries(quranEn.quran)) {
    const d = days.find((x) => x.day === Number(day));
    if (!d?.quran) { errors.push(`quran_en: day ${day} has no Arabic Quran evidence`); continue; }
    en.days[day] = {
      ...(en.days[day] ?? { day: Number(day) }),
      quranEn: items.map((i) => `${i.text} ${i.ref}${i.partial ? " ⁽*⁾" : ""}`).join("\n\n"),
      quranPartial: items.some((i) => i.partial),
      quranSource: quranEn.source,
    };
  }
}
// Every Arabic quotation kept inside the English text (﴿…﴾ or «…») must exist verbatim in the Arabic day.
const arBlob = (d) => JSON.stringify(d);
for (const [day, t] of Object.entries(en.days)) {
  const d = days.find((x) => x.day === Number(day));
  const { quranEn, quranSource, quranPartial, ...rest } = t;
  for (const m of JSON.stringify(rest).matchAll(/[﴿«]([^﴾»]*[\u0600-\u06FF][^﴾»]*)[﴾»]/g))
    if (!arBlob(d).includes(m[1])) errors.push(`en day ${day}: Arabic quotation not found in the Arabic day: ${m[1].slice(0, 60)}`);
}
for (const u of units) if (Object.keys(en.days).length && !en.units[u.number]) errors.push(`en: missing title for unit ${u.number}`);

if (errors.length) fail("validation failed:\n  - " + errors.join("\n  - "));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ days, units, en }, null, 0));

console.log(`✔ build-data: sheet "${sheetName}"`);
console.log(`  days: ${days.length}`);
console.log(`  units: ${units.length}`);
console.log(`  no Quran evidence: ${missing("q", (d) => d.quran).join(", ") || "—"}`);
console.log(`  no Sunnah evidence: ${missing("s", (d) => d.sunnah).join(", ") || "—"}`);
console.log(`  English: ${Object.keys(en.days).length} days translated; Quran EN on ${Object.values(en.days).filter((t) => t.quranEn).length}, Sunnah EN on ${Object.values(en.days).filter((t) => t.sunnahEn).length}`);
console.log(`  no misconception card: ${missing("m", (d) => d.misconception).join(", ") || "—"}`);
