# رحلة ما لا يسع المسلم جهله — 90-day reading journey

A static, Arabic/RTL single-page site (React 19 + TypeScript + Vite + Tailwind CSS v4) that turns the book «ما لا يسع المسلم جهله» into a 90-day interactive reading journey, with a "رفيق الرحلة" chat panel that talks to your RAG backend on Azure.

**All content comes from `data/90_day_journey.xlsx`.** No day, unit or quiz text is written in source code.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173 (regenerates the data first)
npm run build      # static site in dist/ (regenerates the data first, then type-checks)
npm run preview    # serve dist/ locally
```

Requires Node 18+ (tested with Node 22).

## How content works

1. Replace `data/90_day_journey.xlsx` with a new version (same sheet/columns).
2. Run `npm run data` (or just `npm run dev` / `npm run build`, which run it automatically).
3. Done — no code changes.

**Editing the chat's suggested questions:** they come from the `اسأل في الكتاب (أسئلة مقترحة)` column, one question per line (the first 3 are shown). The English versions are in `askTheBook` of the matching day in `data/translations/en/days_XX_YY.json`. Change both so the two languages stay in sync.

`scripts/build-data.mjs` reads sheet «خطة الـ90 يوم» (falls back to the first sheet), maps the used columns, strips page citations from the quiz evidence/quote for display, derives units from `الوحدة رقم` / `اسم الوحدة`, validates everything, and writes `src/data/journey.generated.json`. If validation fails, the build stops with a message listing the bad day numbers. On success it prints:

```
days: 90
units: 16
no Quran evidence: …
no Sunnah evidence: …
no misconception card: …
```

Columns **not** used (never displayed): `الفصل`, `صفحة الكتاب`, `الموضوع`, `بطاقة 5 - خريطة/إنفوجراف`, `مصادر الصفحات`, `تنبيهات`, `الحالة`, `ملاحظات المراجع`, and the sheets «دليل الاستخدام» / «التنبيهات».

---

## Live site and pages

The site is published on GitHub Pages: **https://kareem1099.github.io/alla-basera-website/**

It is a single page with a tiny hash router (`src/App.tsx`):

| URL | Page | Chat |
|---|---|---|
| `#/` | Home (`src/pages/Home.tsx`) | — |
| `#/journey` | The 90-day journey (`src/pages/Journey.tsx`): units bar, day card, quiz, action toggle | «رفيق الرحلة» panel next to the day, with up to 3 suggested questions from the day's `اسأل في الكتاب` cell |
| `#/prophet` | «من هو أشرف الخلق؟» tree (`src/pages/TreePage.tsx`) | floating companion button |
| `#/ten` | «العشرة المبشرون بالجنة» tree | floating companion button |

---

## The chat backend (current setup)

The chat talks to **MiniRAG**, a FastAPI service deployed on **Azure Container Apps** (repo: `kareem1099/rag-on-azure`, deployment guide in `mini-rag-app/infra/azure/README.md`).

```
browser (GitHub Pages) ── POST {text, limit} ──▶  minirag-api (Azure Container Apps)
                                                     │  Gemini (with Cohere fallback) + PostgreSQL/pgvector
```

### Endpoint and request format

The frontend is configured by two build-time variables (see `.env.example`):

```
VITE_RAG_ENDPOINT=https://minirag-api.lemonsand-58ae2c57.swedencentral.azurecontainerapps.io/api/v1/nlp/index/answer/1
VITE_RAG_REQUEST_FORMAT=minirag
```

- With `minirag`, `src/lib/ragClient.ts` sends `POST { "text": "<question>", "limit": 5 }` and shows only `answer` from the response (`{ signal, answer, grounding, ... }`); the retrieved documents are not displayed.
- The answer endpoint is **public** (no API key). Upload / process / push on the backend still require `X-API-Key`, which never goes in the frontend.
- Request timeout in the browser: 60 s.

### Books are separate projects

The number at the end of the URL is the backend **project id**; each book is indexed in its own project:

| Project | Book | Used by |
|---|---|---|
| `1` | «ما لا يسع المسلم جهله» | `#/journey` (and, today, the tree pages too — see note) |
| `2` | «صفة الصفوة» لابن الجوزي | — |

> **Note:** there is a single `VITE_RAG_ENDPOINT`, so the tree pages (`#/prophet`, `#/ten`), which are built from «صفة الصفوة», currently ask project `1`. Pointing them at project `2` needs a second endpoint variable and a small change in `ragClient.ts` / `TreePage.tsx`.

### CORS

The backend allows browser calls from `https://kareem1099.github.io` through its `CORS_ALLOWED_ORIGINS` setting (comma-separated, no trailing slash or path). Nothing is needed on the website side. If the site moves to another domain (or for local dev on `http://localhost:5173`), add that origin to `CORS_ALLOWED_ORIGINS` in the backend's `.env.app` and redeploy the backend.

### Cold start

The backend scales to zero when idle, so the first question after a quiet period can take ~10–30 s while it wakes up; later questions are fast.

### Test the backend with curl

```bash
# health
curl https://minirag-api.lemonsand-58ae2c57.swedencentral.azurecontainerapps.io/api/v1/healthy

# ask project 1 (exactly what the site sends)
curl -X POST "https://minirag-api.lemonsand-58ae2c57.swedencentral.azurecontainerapps.io/api/v1/nlp/index/answer/1" \
  -H "Content-Type: application/json" -d '{"text":"ما معنى الإيمان؟","limit":5}'

# check that CORS allows the site (expect 200 and access-control-allow-origin)
curl -i -X OPTIONS "https://minirag-api.lemonsand-58ae2c57.swedencentral.azurecontainerapps.io/api/v1/nlp/index/answer/1" \
  -H "Origin: https://kareem1099.github.io" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type"
```

A reply of `{"signal":"rag_answer_error"}` means the backend is up but found nothing in that project (wrong project id, or the book was not indexed yet).

### Troubleshooting the chat

Open DevTools (**F12 → Console / Network**) and look at the request to `.../answer/1`.

- **`blocked by CORS policy`** → the site's origin is missing from the backend's `CORS_ALLOWED_ORIGINS`.
- **Request pending for a long time, then works** → cold start (see above).
- **Timeout after 60 s** → backend slow or Gemini/Cohere retrying; check the backend logs (Log Analytics, see the backend README).
- **`rag_answer_error`** → nothing indexed for that project id.
- **Chat says «بانتظار الربط»** → `VITE_RAG_ENDPOINT` was empty at build time. `VITE_*` values are baked in when building; rebuild after changing them.

---

## Deployment (GitHub Pages)

Deployment is automatic: `.github/workflows/deploy.yml` runs on every push to `main` (and can be started by hand).

1. `npm ci`
2. `npm run build` (regenerates the data from the Excel file, type-checks, builds `dist/`)
3. uploads `dist/` and publishes it to GitHub Pages

The chat settings for the published site are set **in the workflow**, not in `.env` (which is git-ignored):

```yaml
env:
  VITE_RAG_ENDPOINT: https://minirag-api.lemonsand-58ae2c57.swedencentral.azurecontainerapps.io/api/v1/nlp/index/answer/1
  VITE_RAG_REQUEST_FORMAT: minirag
```

Change them there if the backend URL or project changes, then push.

**Update the site**

```bash
git pull origin main
# edit data/90_day_journey.xlsx, translations, code ...
npm run build          # optional local check
git add -A && git commit -m "..."
git push origin main   # triggers the deploy
```

Follow progress under **GitHub → Actions → Deploy to GitHub Pages**; when it is green, reload the site with **Ctrl+F5**.

**Redeploy without a code change:** Actions → *Deploy to GitHub Pages* → **Run workflow**.

**One-time setup** (already done for this repo): Settings → Pages → *Build and deployment* → Source: **GitHub Actions**.

`vite.config.ts` uses `base: "./"`, so the build works under the `/alla-basera-website/` sub-path without extra config.

---

## Other backends and hosts (optional)

The chat is isolated in `src/lib/ragClient.ts`, so another backend only needs different variables:

- `VITE_RAG_REQUEST_FORMAT=custom` (default) sends `{ question, history, context: { day, title, unit, lesson, principle } }`.
- `VITE_RAG_REQUEST_FORMAT=azure-chat` sends chat-completions style `{ messages: [...] }` with the day context as a system message.
- Accepted responses: `{ answer, sources? }`, `{ response | reply | message | output | result }`, Azure OpenAI chat-completions, MiniRAG `{ answer, grounding }`, or plain text. To support another shape edit only `buildRequestBody` / `normalizeResponse`.
- If a backend needs a secret key, never put it in the frontend: use one of the proxies in `deploy/` (Cloudflare Pages `functions/`, Netlify `netlify/functions/chat.ts`, Vercel `api/`) with host secrets `RAG_URL`, `RAG_AUTH_HEADER`, `RAG_AUTH_VALUE`, and set `VITE_RAG_ENDPOINT=/api/chat`.
- The site is a plain static `dist/` folder, so Cloudflare Pages, Netlify, Vercel or Azure Static Web Apps also work (build `npm run build`, output `dist`, `NODE_VERSION=22`).

Local mock backend: `npm run mock-rag` (port 8787; `MOCK_SHAPE=azure` or `MOCK_SHAPE=fail`), then `VITE_RAG_ENDPOINT=http://localhost:8787/chat npm run dev`.

---

## Verification scripts

- `npm run data` — regenerates and validates the content.
- `npm run build && npm run preview` then `node scripts/check-all-days.mjs` — headless Chromium walks day 1 → 90 with the next-day button and checks every day (sections present only when their cell has content, each with a title row, no page citations / chapter / topic text, quiz works, day 90 completion, units menu, mobile overflow). Set `CHECK_CHAT=1` with a mock-configured build to test the chat.

## Project structure

```
data/90_day_journey.xlsx          journey content (only source of truth for the 90 days)
data/translations/en/*.json       English content, one file per 10 days
scripts/build-data.mjs            Excel + translations → src/data/journey.generated.json (+ validation)
scripts/build-safwa.mjs           «صفة الصفوة» → src/data/safwa.generated.json (npm run safwa)
scripts/safwa-tree.mjs            tree branches and English labels for the two trees
scripts/mock-rag.mjs              local mock RAG backend
scripts/check-all-days.mjs        end-to-end check of all 90 days
src/App.tsx                       hash router: home, journey, prophet, ten
src/pages/                        Home, Journey, TreePage
src/components/                   Header, UnitsBar, DayCard, SectionCard, EvidenceCards, Quiz, ActionToggle,
                                  CompanionChat, CompanionLauncher, BookTree, LeafReader, Logo, Ornament
src/data/journey.ts, safwa.ts     typed loaders (no content)
src/lib/ragClient.ts              RAG request/response mapping (custom, azure-chat, minirag)
src/lib/i18n.tsx                  Arabic / English strings and language toggle
src/lib/arabic.ts                 Arabic numerals + day-count grammar
src/index.css                     Tailwind v4 theme (colors, fonts, fade-up)
.github/workflows/deploy.yml      build + publish to GitHub Pages
deploy/                           optional serverless proxies (not part of the app build)
```

## Assumptions

- The quiz explanation shown after answering is the `الدليل من الكتاب` cell with trailing page markers like `(ص11)` removed; the same page-marker cleanup is applied to the quote cell because the sheet appends `(صN)` there too and page numbers must not be shown.
- `الدرس المكتوب` is split on line breaks; the current file has one paragraph per day.
- Up to 3 suggested chat questions per day are taken from `اسأل في الكتاب`.
- The «تصحيح مفهوم» cell is split on «الناس بتقول:» / «الصح هو:»; if a cell lacks those markers the whole text is shown as «الصح هو».
- The action checkbox and quiz state are in memory only (reset on reload), as specified.
- Google Fonts is loaded from fonts.googleapis.com; offline the site falls back to system fonts.

## Arabic / English

The site has a language toggle (stored per browser). Arabic content comes from the Excel file; English content comes from `data/translations/en/*.json` (one file per 10 days, same field order as the sheet; quiz options in the same order as the Arabic).

- **Quran:** English meanings come only from *The Noble Qur'an* (Hilali & Khan, King Fahd Complex), fetched from Quranpedia.net (book 13603, "Muhsin Khan") by `journey/output/tools/fetch_quran_en.py` into `data/translations/en/quran_en.json`. The source is shown under each translation. When the book quotes only part of a verse, the full verse's meaning is shown and labelled.
- **Hadith:** none of the approved references (dorar.net, shamela.ws) provides an English translation, so hadith text stays in Arabic with a note. To add one later, put `sunnahEn` + `sunnahSource` on that day.
- Any ayah/hadith quoted inside English text stays in Arabic between ﴿﴾ or «»; `npm run data` fails if such a quotation is not found verbatim in the Arabic day.

## «من هو أشرف الخلق؟» و«العشرة المبشرون بالجنة»

The two trees at `#/prophet` and `#/ten` are built from Ibn al-Jawzi's «صفة الصفوة» (OpenITI file `0597IbnJawzi.SifatSafwa.Shamela0012031-ara1.mARkdown`).
The branches and English labels live in `scripts/safwa-tree.mjs`. The text of each topic is taken verbatim from the book. To regenerate `src/data/safwa.generated.json`:

```
npm run safwa -- path/to/0597IbnJawzi.SifatSafwa.Shamela0012031-ara1.mARkdown
```
