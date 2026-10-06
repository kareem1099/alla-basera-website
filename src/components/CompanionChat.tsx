import { BookOpen, RotateCcw, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLang } from "../lib/i18n";
import { askRag, isRagConfigured, type ChatMessage, type DayContext, type Source } from "../lib/ragClient";

interface Props {
  context: DayContext;
  suggestions?: string[];
  /** Subtitle, greeting and input placeholder; default to the daily-lesson wording. */
  sub?: string;
  hello?: string;
  placeholder?: string;
  /** "page" is the dark card beside a day; "panel" is the light floating chat of the tree pages and fills its box. */
  variant?: "page" | "panel";
}

interface UiMessage extends ChatMessage {
  sources?: Source[];
}

/** Parent remounts this component with a key per day/topic, so the conversation clears when it changes. */
export default function CompanionChat({ context, suggestions = [], sub, hello, placeholder, variant = "page" }: Props) {
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
        { ...context, lang },
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

  const panel = variant === "panel";
  // The journey page keeps its dark card; the tree pages use the page's own cream, leaf and saffron.
  const c = panel
    ? {
        root: "h-full bg-card p-5 text-ink",
        avatar: "bg-leaf text-white",
        sub: "text-ink/50",
        badge: "bg-leaf/10 text-leaf-deep",
        chip: "bg-cream ring-1 ring-ink/10 hover:ring-saffron/60",
        hello: "text-ink/60",
        setup: "text-ink/45",
        user: "bg-leaf text-white",
        bot: "bg-paper text-ink",
        dot: "bg-ink/40",
        error: "bg-destructive/10 text-ink",
        retry: "text-leaf-deep",
        input: "bg-cream text-ink ring-1 ring-ink/10 placeholder:text-ink/40 focus-visible:ring-leaf",
        send: "bg-leaf text-white",
      }
    : {
        root: "min-h-[620px] rounded-3xl bg-ink p-6 text-cream sm:p-7 lg:sticky lg:top-4",
        avatar: "bg-saffron text-ink",
        sub: "text-cream/50",
        badge: "bg-saffron/15 text-saffron",
        chip: "bg-cream/10 hover:bg-cream/15",
        hello: "text-cream/60",
        setup: "text-cream/45",
        user: "bg-saffron text-ink",
        bot: "bg-cream/10",
        dot: "bg-cream/60",
        error: "bg-destructive/20",
        retry: "text-saffron",
        input: "bg-cream/10 text-cream placeholder:text-cream/40 focus-visible:ring-saffron",
        send: "bg-saffron text-ink",
      };

  return (
    <aside
      className={`flex flex-col ${c.root}`}
      aria-label={t.chatName}
    >
      <div className="flex items-center gap-3">
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-bold ${c.avatar}`} aria-hidden="true">
          م
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold">{t.chatName}</h2>
          <p className={`text-sm ${c.sub}`}>{sub ?? t.chatSub}</p>
        </div>
        <span className={`ms-auto shrink-0 rounded-full px-3 py-1 text-xs font-bold ${c.badge}`}>{configured ? t.connected : t.waiting}</span>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              disabled={!configured || loading}
              onClick={() => send(s)}
              className={`rounded-full px-3 py-1.5 text-start text-sm leading-snug transition disabled:cursor-not-allowed disabled:opacity-60 ${c.chip}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div ref={scrollRef} className={`my-5 flex min-h-[220px] flex-1 flex-col gap-3 overflow-y-auto pe-1 ${panel ? "" : "max-h-[440px]"}`} aria-live="polite">
        {messages.length === 0 && !loading && !error && (
          <div className={`m-auto max-w-[30ch] text-center ${c.hello}`}>
            <BookOpen className="mx-auto mb-3 size-8 text-saffron" aria-hidden="true" />
            <p className="leading-relaxed">{hello ?? t.chatHello}</p>
            {!configured && (
              <p className={`mt-3 text-xs leading-relaxed ${c.setup}`}>{t.chatSetup}</p>
            )}
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className={`max-w-[85%] self-start rounded-2xl rounded-ss-sm px-4 py-2.5 leading-relaxed whitespace-pre-line ${c.user}`}>
              {m.content}
            </div>
          ) : (
            <div key={i} className="max-w-[90%] self-end">
              <div className={`rounded-2xl rounded-se-sm px-4 py-3 leading-[1.9] whitespace-pre-line ${c.bot}`}>{m.content}</div>
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
          <div className={`flex items-center gap-1.5 self-end rounded-2xl px-4 py-3 ${c.bot}`} aria-label={t.typing}>
            {[0, 1, 2].map((i) => (
              <span key={i} className={`size-2 animate-bounce rounded-full ${c.dot}`} style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        )}
        {error && (
          <div className={`self-stretch rounded-2xl px-4 py-3 text-sm ${c.error}`} role="alert">
            <p>{error}</p>
            <button type="button" onClick={retry} className={`mt-2 inline-flex items-center gap-1.5 font-bold hover:underline ${c.retry}`}>
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
          placeholder={configured ? (placeholder ?? t.placeholder) : t.placeholderOff}
          aria-label={t.yourQ}
          className={`max-h-32 min-h-11 flex-1 resize-none rounded-xl px-4 py-2.5 focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${c.input}`}
        />
        <button
          type="submit"
          disabled={!configured || loading || !input.trim()}
          aria-label={t.send}
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${c.send}`}
        >
          <Send className="size-5 rtl:-scale-x-100" aria-hidden="true" />
        </button>
      </form>
    </aside>
  );
}
