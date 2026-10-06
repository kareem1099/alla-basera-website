/**
 * RAG client — the only network code in the app.
 *
 * Configuration (Vite env, see .env.example):
 *   VITE_RAG_ENDPOINT        URL of the Azure RAG backend, or "/api/chat" when using a proxy from deploy/.
 *   VITE_RAG_REQUEST_FORMAT  "custom" (default), "azure-chat" or "minirag".
 *
 * REQUEST (custom):
 *   POST { question, history: [{ role: "user"|"assistant", content }], context: { day, title, unit, lesson, principle, lang } }
 * REQUEST (azure-chat):
 *   POST { messages: [ { role: "system", content: <day context> }, ...history, { role: "user", content: question } ] }
 *
 * REQUEST (minirag):
 *   POST { text: question, limit }   →  e.g. <base>/api/v1/nlp/index/answer/1
 *
 * ACCEPTED RESPONSE SHAPES (normalized to { answer, sources? }):
 *   1. { answer: string, sources?: Array<string | { label|title|name|filepath, type? }> }
 *   2. { response | reply | message | output | result: string }
 *   3. Azure OpenAI chat-completions: { choices: [{ message: { content, context?: { citations: [{ title, filepath }] } } }] }
 *   4. minirag: { answer, grounding } — only the answer is shown; the retrieved documents are not.
 *   5. Plain-text body → used as the answer.
 *
 * To adapt to a different backend, edit only `buildRequestBody` and `normalizeResponse` below.
 */

export type ChatRole = "user" | "assistant";
export interface ChatMessage {
  role: ChatRole;
  content: string;
}
export interface Source {
  label: string;
  type: "book" | "external";
}
export interface RagAnswer {
  answer: string;
  sources?: Source[];
}
export interface DayContext {
  day: number;
  title: string;
  unit: string;
  lesson: string;
  principle: string;
  /** UI language; the backend should answer in it. */
  lang?: "ar" | "en";
}

const ENDPOINT = (import.meta.env.VITE_RAG_ENDPOINT as string | undefined)?.trim() || "";
const FORMAT = ((import.meta.env.VITE_RAG_REQUEST_FORMAT as string | undefined)?.trim() || "custom") as "custom" | "azure-chat" | "minirag";
const TIMEOUT_MS = 60_000;
const MINIRAG_LIMIT = 5;

export const isRagConfigured = (): boolean => ENDPOINT.length > 0;

export const RAG_ERROR_MESSAGE = "تعذّر الوصول إلى رفيق الرحلة الآن. تأكد من الاتصال ثم حاول مرة أخرى.";

export function buildRequestBody(question: string, history: ChatMessage[], context: DayContext, format = FORMAT): unknown {
  if (format === "azure-chat") {
    const system =
      `أنت رفيق لقراءة كتاب «ما لا يسع المسلم جهله». أجب من الكتاب فقط.\n` +
      `اليوم ${context.day}: ${context.title}\nالوحدة: ${context.unit}\nالمبدأ: ${context.principle}\nالدرس: ${context.lesson}` +
      (context.lang === "en" ? "\nAnswer in English." : "");
    return { messages: [{ role: "system", content: system }, ...history, { role: "user", content: question }] };
  }
  if (format === "minirag") return { text: question, limit: MINIRAG_LIMIT };
  return { question, history, context };
}

const asString = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v : null);

const toSource = (s: unknown): Source | null => {
  if (typeof s === "string") return { label: s, type: "book" };
  if (s && typeof s === "object") {
    const o = s as Record<string, unknown>;
    const label = asString(o.label) ?? asString(o.title) ?? asString(o.name) ?? asString(o.filepath) ?? asString(o.url);
    if (!label) return null;
    const t = asString(o.type)?.toLowerCase();
    return { label, type: t === "external" || t === "web" || t === "outside" ? "external" : "book" };
  }
  return null;
};

export function normalizeResponse(body: unknown): RagAnswer {
  if (typeof body === "string") return { answer: body.trim() };
  if (!body || typeof body !== "object") return { answer: "" };
  const o = body as Record<string, unknown>;

  const choices = o.choices as Array<{ message?: { content?: unknown; context?: { citations?: unknown[] } } }> | undefined;
  if (Array.isArray(choices) && choices[0]?.message) {
    const msg = choices[0].message;
    const citations = Array.isArray(msg.context?.citations) ? msg.context!.citations! : [];
    const sources = citations
      .map((c) => {
        const cc = c as Record<string, unknown>;
        const label = asString(cc.title) ?? asString(cc.filepath);
        return label ? ({ label, type: "book" } as Source) : null;
      })
      .filter((x): x is Source => !!x);
    return { answer: asString(msg.content) ?? "", sources: sources.length ? sources : undefined };
  }

  const answer = asString(o.answer) ?? asString(o.response) ?? asString(o.reply) ?? asString(o.message) ?? asString(o.output) ?? asString(o.result) ?? "";
  const rawSources = Array.isArray(o.sources) ? o.sources : [];
  const sources = rawSources.map(toSource).filter((x): x is Source => !!x);
  return { answer, sources: sources.length ? sources : undefined };
}

export async function askRag(question: string, history: ChatMessage[], context: DayContext, signal?: AbortSignal): Promise<RagAnswer> {
  if (!ENDPOINT) throw new Error("RAG endpoint not configured");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  signal?.addEventListener("abort", () => ctrl.abort());
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildRequestBody(question, history, context)),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      /* plain-text body */
    }
    const out = normalizeResponse(parsed);
    if (!out.answer.trim()) throw new Error("Empty answer");
    return out;
  } finally {
    clearTimeout(timer);
  }
}
