// Local mock of the RAG backend for development/testing.
//   node scripts/mock-rag.mjs            → port 8787, custom {answer, sources} shape
//   MOCK_SHAPE=azure node scripts/mock-rag.mjs   → Azure chat-completions shape
//   MOCK_SHAPE=fail  node scripts/mock-rag.mjs   → always HTTP 500 (error/retry UI)
// Then run the site with VITE_RAG_ENDPOINT=http://localhost:8787/chat
import { createServer } from "node:http";

const PORT = Number(process.env.PORT || 8787);
const SHAPE = process.env.MOCK_SHAPE || "custom";
export const received = [];

const server = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.writeHead(204).end();
  if (req.method === "GET" && req.url === "/last") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(received.at(-1) ?? null));
  }
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    let payload = {};
    try { payload = JSON.parse(body); } catch { /* ignore */ }
    received.push(payload);
    console.log("← request:", JSON.stringify(payload).slice(0, 300));
    setTimeout(() => {
      if (SHAPE === "fail") return res.writeHead(500).end("error");
      const q = payload.question ?? payload.messages?.at(-1)?.content ?? "";
      const day = payload.context?.day ?? "؟";
      const answer = `إجابة تجريبية عن سؤالك:\n«${q}»\n(سياق اليوم ${day})`;
      res.writeHead(200, { "Content-Type": "application/json" });
      if (SHAPE === "azure") {
        return res.end(JSON.stringify({ choices: [{ message: { role: "assistant", content: answer, context: { citations: [{ title: "ما لا يسع المسلم جهله", filepath: "book.md" }] } } }] }));
      }
      res.end(JSON.stringify({ answer, sources: [{ label: "ما لا يسع المسلم جهله", type: "book" }, { label: "مصدر خارجي", type: "external" }] }));
    }, 600);
  });
});
server.listen(PORT, () => console.log(`mock RAG (${SHAPE}) on http://localhost:${PORT}/chat`));
