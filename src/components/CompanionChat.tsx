import { BookOpen, RotateCcw, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Day } from "../data/journey";
import { useLang } from "../lib/i18n";
import { askRag, isRagConfigured, type ChatMessage, type Source } from "../lib/ragClient";

interface Props {
  day: Day;
}

interface UiMessage extends ChatMessage {
  sources?: Source[];
}

/** Parent remounts this component with key = day, so the conversation always clears when the day changes. */
export default function CompanionChat({ day }: Props) {
  const { t, lang } = useLang();
  const configured = isRagConfigured();
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, error]);

  const send = async (question: string, history: UiMessage[] = messages) => {
    const q = question.trim();
    if (!q || loading || !configured) return;
    setError(null);
    setInput("");
    setLastQuestion(q);
    const nextHistory = [...history, { role: "user" as const, content: q }];
    setMessages(nextHistory);
    setLoading(true);
    abortRef.current = new AbortController();
    try {
      const res = await askRag(
        q,
        history.map(({ role, content }) => ({ role, content })),
        { day: day.day, title: day.title, unit: day.unitTitle, lesson: day.lesson.join("\n"), principle: day.principle, lang },
        abortRef.current.signal,
      );
      setMessages([...nextHistory, { role: "assistant", content: res.answer, sources: res.sources }]);
    } catch {
      if (!abortRef.current.signal.aborted) setError(t.ragError);
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    if (!lastQuestion) return;
    const history = messages.slice(0, -1); // drop the unanswered user message
    send(lastQuestion, history);
  };

  const suggestions = day.askTheBook.slice(0, 3);

  return (
    <aside className="flex min-h-[620px] flex-col rounded-3xl bg-ink p-6 text-cream sm:p-7 lg:sticky lg:top-4" aria-label={t.chatName}>
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-saffron font-display text-2xl font-bold text-ink" aria-hidden="true">
          م
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold">{t.chatName}</h2>
          <p className="text-sm text-cream/50">{t.chatSub}</p>
        </div>
        <span className="ms-auto shrink-0 rounded-full bg-saffron/15 px-3 py-1 text-xs font-bold text-saffron">{configured ? t.connected : t.waiting}</span>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              disabled={!configured || loading}
              onClick={() => send(s)}
              className="rounded-full bg-cream/10 px-3 py-1.5 text-start text-sm leading-snug transition-colors hover:bg-cream/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div ref={scrollRef} className="my-5 flex max-h-[440px] min-h-[220px] flex-1 flex-col gap-3 overflow-y-auto pe-1" aria-live="polite">
        {messages.length === 0 && !loading && !error && (
          <div className="m-auto max-w-[30ch] text-center text-cream/60">
            <BookOpen className="mx-auto mb-3 size-8 text-saffron" aria-hidden="true" />
            <p className="leading-relaxed">{t.chatHello}</p>
            {!configured && (
              <p className="mt-3 text-xs leading-relaxed text-cream/45">{t.chatSetup}</p>
            )}
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="max-w-[85%] self-start rounded-2xl rounded-ss-sm bg-saffron px-4 py-2.5 leading-relaxed whitespace-pre-line text-ink">
              {m.content}
            </div>
          ) : (
            <div key={i} className="max-w-[90%] self-end">
              <div className="rounded-2xl rounded-se-sm bg-cream/10 px-4 py-3 leading-[1.9] whitespace-pre-line">{m.content}</div>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.sources.map((s, j) => (
                    <span key={j} className="inline-flex items-center gap-1.5 rounded-full bg-cream/10 px-2.5 py-1 text-xs text-cream/75" title={s.label}>
                      <span className={`size-2 rounded-full ${s.type === "book" ? "bg-leaf" : "bg-sky"}`} aria-hidden="true" />
                      <span className="max-w-[18ch] truncate">{s.label}</span>
                      <span className="text-cream/45">· {s.type === "book" ? t.fromBook : t.external}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ),
        )}
        {loading && (
          <div className="flex items-center gap-1.5 self-end rounded-2xl bg-cream/10 px-4 py-3" aria-label={t.typing}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-2 animate-bounce rounded-full bg-cream/60" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        )}
        {error && (
          <div className="self-stretch rounded-2xl bg-destructive/20 px-4 py-3 text-sm" role="alert">
            <p>{error}</p>
            <button type="button" onClick={retry} className="mt-2 inline-flex items-center gap-1.5 font-bold text-saffron hover:underline">
              <RotateCcw className="size-4" aria-hidden="true" />
              {t.retryChat}
            </button>
          </div>
        )}
      </div>

      <form
        className="mt-auto flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          disabled={!configured || loading}
          rows={1}
          placeholder={configured ? t.placeholder : t.placeholderOff}
          aria-label={t.yourQ}
          className="max-h-32 min-h-11 flex-1 resize-none rounded-xl bg-cream/10 px-4 py-2.5 text-cream placeholder:text-cream/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!configured || loading || !input.trim()}
          aria-label={t.send}
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-saffron text-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="size-5 rtl:-scale-x-100" aria-hidden="true" />
        </button>
      </form>
    </aside>
  );
}
