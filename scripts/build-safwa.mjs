/**
 * Builds src/data/safwa.generated.json from Ibn al-Jawzi's «صفة الصفوة» (OpenITI mARkdown).
 * Usage: node scripts/build-safwa.mjs <path-to-book.mARkdown>
 * The tree shape (branches, English labels) lives in scripts/safwa-tree.mjs; the text is taken
 * verbatim from the book, only cleaned of page/milestone markers and footnote numbers.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SUMMARIES_EN } from "./safwa-summaries-en.mjs";
import { PROPHET, TEN, RANGE, SKIP } from "./safwa-tree.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = process.argv[2];
if (!src) {
  console.error("usage: node scripts/build-safwa.mjs <book.mARkdown>");
  process.exit(1);
}
const lines = readFileSync(src, "utf8").split(/\r?\n/);

/** Removes page/milestone markers and footnote digits (keeps digits inside [سورة: آية]). */
const clean = (s) =>
  s
    .replace(/PageV\d+P\d+/g, "")
    .replace(/ms\d+/g, "")
    .split(/(\[[^\]]*\])/)
    .map((part) => (part.startsWith("[") ? part : part.replace(/\s?\d+/g, "")))
    .join("")
    .replace(/(رسول الله|النبي)\.\s*(صلى)/g, "$1 $2")
    .replace(/\s+([.،,:؛])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*%~%\s*/g, "\t") // poetry: the two hemistichs of a verse are split by a tab
    .trim();

const cleanTitle = (s) =>
  clean(s.replace(/^\d+-\s*/, ""))
    .replace(/[:.]+$/, "")
    .trim();

// Parse headings (### |, ###||, ###|||) and their paragraphs within the requested line range.
const sections = [];
let cur = null;
for (let i = RANGE.from - 1; i < RANGE.to; i++) {
  const line = lines[i];
  const h = line.match(/^### (\|+) (.*)$/);
  if (h) {
    cur = { line: i + 1, level: h[1].length, raw: h[2], title: cleanTitle(h[2]), paras: [] };
    sections.push(cur);
    continue;
  }
  if (!cur) continue;
  if (line.startsWith("~~")) {
    const prev = cur.paras.length - 1;
    if (prev >= 0) cur.paras[prev] += " " + line.slice(2);
    else cur.title = cleanTitle(cur.raw + " " + line.slice(2)); // heading wrapped onto a second line
  } else if (line.startsWith("# ")) {
    // A page break (PageV…) in the middle of a sentence splits it into two "# " paragraphs: join them back.
    const prev = cur.paras[cur.paras.length - 1];
    const brokenByPage = prev && /PageV\d+P\d+\s*$/.test(prev) && !/[.:؟!»"]\s*PageV\d+P\d+\s*$/.test(prev);
    if (brokenByPage) cur.paras[cur.paras.length - 1] += " " + line.slice(2);
    else cur.paras.push(line.slice(2));
  }
  else if (line.trim() && cur.paras.length) cur.paras[cur.paras.length - 1] += " " + line;
}
for (const s of sections) s.paras = s.paras.map(clean).filter((p) => p.length > 1);

if (process.argv.includes("--list")) {
  sections.forEach((s, i) => console.log(i, s.line, "|".repeat(s.level), s.title, `(${s.paras.length})`));
  process.exit(0);
}

const byLine = new Map(sections.map((s) => [s.line, s]));
const take = (line) => {
  const s = byLine.get(line);
  if (!s) throw new Error(`no heading at line ${line}`);
  return s;
};
const leaf = ([line, ar, en, from = 0, to]) => {
  const s = take(line);
  const paras = s.paras.slice(from, to).filter((p) => !p.startsWith("آخر المتعلق"));
  const id = `l${line}${from ? `-${from}` : ""}`;
  return { id, line, ar: ar ?? s.title, en, bookAr: s.title, paras, summaryEn: SUMMARIES_EN[id] ?? [] };
};
const build = (tree) => ({
  root: tree.root,
  branches: tree.branches.map((b, i) => ({
    id: b.id ?? `b${i + 1}`,
    ar: b.ar,
    en: b.en,
    blurbAr: b.blurbAr,
    blurbEn: b.blurbEn,
    leaves: b.leaves.map(leaf),
  })),
});

const out = { source: { ar: "صفة الصفوة لابن الجوزي (ت ٥٩٧هـ)", en: "Sifat al-Safwa by Ibn al-Jawzi (d. 597 AH)" }, prophet: build(PROPHET), ten: build(TEN) };
const used = new Set([...out.prophet.branches, ...out.ten.branches].flatMap((b) => b.leaves.map((l) => l.line)));
const missing = sections.filter((s) => s.paras.length && !used.has(s.line) && !SKIP.includes(s.line));
if (missing.length) console.warn("sections with text not placed in a tree:", missing.map((s) => `${s.line} ${s.title}`));
const leaves = [...out.prophet.branches, ...out.ten.branches].flatMap((b) => b.leaves);
const noSummary = leaves.filter((l) => !l.summaryEn.length).map((l) => l.id);
const unknown = Object.keys(SUMMARIES_EN).filter((k) => !leaves.some((l) => l.id === k));
if (noSummary.length) console.warn("leaves without an English summary:", noSummary);
if (unknown.length) console.warn("summaries for unknown leaves:", unknown);
writeFileSync(resolve(root, "src/data/safwa.generated.json"), JSON.stringify(out));
console.log("wrote src/data/safwa.generated.json:", used.size, "book sections");
