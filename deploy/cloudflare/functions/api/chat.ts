// Cloudflare Pages Function — POST /api/chat → your Azure RAG backend.
// Copy the `functions/` folder to the project root (next to package.json) before deploying to Cloudflare Pages.
// Set these as Pages → Settings → Environment variables (encrypted): RAG_URL, RAG_AUTH_HEADER, RAG_AUTH_VALUE.
// Frontend: VITE_RAG_ENDPOINT=/api/chat
interface Env {
  RAG_URL: string;
  RAG_AUTH_HEADER?: string; // e.g. "x-functions-key" or "api-key"
  RAG_AUTH_VALUE?: string;
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }): Promise<Response> => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (env.RAG_AUTH_HEADER && env.RAG_AUTH_VALUE) headers[env.RAG_AUTH_HEADER] = env.RAG_AUTH_VALUE;
  const upstream = await fetch(env.RAG_URL, { method: "POST", headers, body: await request.text() });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });
};
