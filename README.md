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

## Connecting your Azure RAG

The chat is isolated in `src/lib/ragClient.ts`. Until `VITE_RAG_ENDPOINT` is set, the chat shows «بانتظار الربط» and its input is disabled.

### Path 1 — Direct (backend needs no secret key)

1. Copy `.env.example` to `.env` and set:
   ```
   VITE_RAG_ENDPOINT=https://YOUR-APP.azurewebsites.net/api/chat
   ```
2. Enable CORS on the Azure resource: **Azure Portal → your Function App / App Service → API → CORS** → add your site origin (e.g. `https://your-site.pages.dev`) and `http://localhost:5173` for development → **Save**.
3. Rebuild (`npm run build`) or restart `npm run dev`. On your host, set the same variable in the host's environment settings before building.

### Path 2 — With a key (recommended if the endpoint needs a key)

Never put keys in the frontend. Use one of the tiny proxies in `deploy/`:

| Host | Copy this | To project root as |
|---|---|---|
| Cloudflare Pages | `deploy/cloudflare/functions/` | `functions/` |
| Netlify | `deploy/netlify/functions/chat.ts` (+ redirect in its header comment) | `netlify/functions/chat.ts` |
| Vercel | `deploy/vercel/api/` | `api/` |

1. Set these **secret** environment variables on the host:
   - `RAG_URL` = your Azure endpoint, e.g. `https://YOUR-APP.azurewebsites.net/api/chat`
   - `RAG_AUTH_HEADER` = the header name your backend expects: `x-functions-key` (Azure Functions) or `api-key` (Azure OpenAI / AI Search)
   - `RAG_AUTH_VALUE` = the key
2. Set the frontend variable `VITE_RAG_ENDPOINT=/api/chat`.
3. Redeploy. No CORS setup is needed (same origin).

### Request / response contract

Default request (`VITE_RAG_REQUEST_FORMAT=custom`):

```json
POST <VITE_RAG_ENDPOINT>
{
  "question": "يعني إيه توحيد الربوبية؟",
  "history": [{ "role": "user", "content": "..." }, { "role": "assistant", "content": "..." }],
  "context": { "day": 5, "title": "...", "unit": "...", "lesson": "...", "principle": "..." }
}
```

With `VITE_RAG_REQUEST_FORMAT=azure-chat` the body is chat-completions style; the day context goes in a system message:

```json
{ "messages": [ { "role": "system", "content": "…day context…" }, …history, { "role": "user", "content": "question" } ] }
```

Accepted responses (any of these, normalized to `{ answer, sources? }`):

1. `{ "answer": "...", "sources": [{ "label": "...", "type": "book" | "external" }] }` (sources may also be plain strings or objects with `title`/`name`/`filepath`)
2. `{ "response" | "reply" | "message" | "output" | "result": "..." }`
3. Azure OpenAI chat-completions: `{ "choices": [{ "message": { "content": "...", "context": { "citations": [{ "title": "...", "filepath": "..." }] } } }] }`
4. A plain-text body (used as the answer).

To adapt to another shape, edit only `buildRequestBody` / `normalizeResponse` in `src/lib/ragClient.ts`. Timeout: 60 s.

### Test with curl

```bash
curl -X POST "$VITE_RAG_ENDPOINT" -H "Content-Type: application/json" \
  -d '{"question":"ما معنى الإيمان؟","history":[],"context":{"day":3,"title":"","unit":"","lesson":"","principle":""}}'
# through a proxy:
curl -X POST https://your-site.pages.dev/api/chat -H "Content-Type: application/json" -d '{"question":"test","history":[],"context":{"day":1}}'
```

Local mock backend: `npm run mock-rag` (port 8787; `MOCK_SHAPE=azure` or `MOCK_SHAPE=fail` for other shapes), then `VITE_RAG_ENDPOINT=http://localhost:8787/chat npm run dev`.

### Troubleshooting

- **CORS error in the browser console** → add your exact site origin in Azure CORS (Path 1), or use a proxy (Path 2).
- **401 / 403** → wrong key or wrong header name: Azure Functions use `x-functions-key`, Azure OpenAI uses `api-key`.
- **Timeout** → the backend took >60 s; check Azure logs / cold start (Consumption plan).
- **Empty answer / error bubble** → the response shape isn't one of the accepted ones; check it with curl and adjust `normalizeResponse`.
- **Still «بانتظار الربط»** → `VITE_*` variables are baked in at build time; rebuild after changing them.

---

## Free deployment

The build output `dist/` is a plain static site (single route, no rewrites needed).

### Recommended: Cloudflare Pages (free, unlimited bandwidth)

1. Push this folder to a GitHub repo.
2. Go to **dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git** and pick the repo.
3. Framework preset: **None** (or Vite). **Build command:** `npm run build`. **Build output directory:** `dist`. If the site lives in a subfolder of the repo, set **Root directory** to it (e.g. `website`).
4. **Environment variables:** add `VITE_RAG_ENDPOINT` (and, if using the proxy, `RAG_URL`, `RAG_AUTH_HEADER`, `RAG_AUTH_VALUE` as encrypted). Add `NODE_VERSION=22`.
5. **Save and Deploy.** Your site is at `https://<project>.pages.dev`.

No Git? Run `npm run build` locally, then **Create → Pages → Upload assets** and drag the `dist` folder (the proxy option requires Git deploy or Wrangler).

### Alternatives

- **Netlify** (free tier): New site → import repo → build `npm run build`, publish `dist`, env vars in Site settings.
- **Vercel** (free hobby tier): Import project → framework Vite → build `npm run build`, output `dist`.
- **Azure Static Web Apps** (Free plan): fits well since your backend is on Azure. Create Static Web App → GitHub → app location `/` (or `website`), output `dist`. You can link your Function App as the API.

---

## Verification scripts

- `npm run data` — regenerates and validates the content.
- `npm run build && npm run preview` then `node scripts/check-all-days.mjs` — headless Chromium walks day 1 → 90 with the next-day button and checks every day (sections present only when their cell has content, each with a title row, no page citations / chapter / topic text, quiz works, day 90 completion, units menu, mobile overflow). Set `CHECK_CHAT=1` with a mock-configured build to test the chat.

## Project structure

```
data/90_day_journey.xlsx          content source (only source of truth)
scripts/build-data.mjs            Excel → src/data/journey.generated.json (+ validation)
scripts/mock-rag.mjs              local mock RAG backend
scripts/check-all-days.mjs        end-to-end check of all 90 days
src/App.tsx                       page: header, units bar, day card, chat
src/components/                   Header, UnitsBar, DayCard, SectionCard, EvidenceCards, Quiz, ActionToggle, CompanionChat
src/data/journey.ts               typed loader (no content)
src/lib/ragClient.ts              RAG request/response mapping
src/lib/arabic.ts                 Arabic numerals + day-count grammar
src/index.css                     Tailwind v4 theme (colors, fonts, fade-up)
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
