// Vercel Function — POST /api/chat → your Azure RAG backend.
// Copy the `api/` folder to the project root before deploying to Vercel.
// Set Project → Settings → Environment Variables: RAG_URL, RAG_AUTH_HEADER, RAG_AUTH_VALUE.
// Frontend: VITE_RAG_ENDPOINT=/api/chat
export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const url = process.env.RAG_URL;
  if (!url) return new Response("RAG_URL not set", { status: 500 });
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const h = process.env.RAG_AUTH_HEADER;
  const v = process.env.RAG_AUTH_VALUE;
  if (h && v) headers[h] = v;
  const upstream = await fetch(url, { method: "POST", headers, body: await req.text() });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });
}
