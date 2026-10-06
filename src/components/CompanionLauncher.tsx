import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import type { DayContext } from "../lib/ragClient";
import { useLang } from "../lib/i18n";
import CompanionChat from "./CompanionChat";

interface Props {
  context: DayContext;
}

/**
 * «رفيق الرحلة» on the tree pages: a floating button that opens the chat in a panel of its own, outside the topic
 * reader. It sits above the reader (z-60 over its z-50), on the opposite side, so both stay usable together, and the
 * conversation survives moving between topics.
 */
export default function CompanionLauncher({ context }: Props) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(false); // mount the chat on first open, then keep it

  const toggle = () => {
    setOpen((o) => !o);
    setOpened(true);
  };

  return (
    <div className="fixed start-4 bottom-4 z-[60] flex flex-col items-start gap-3 sm:start-6 sm:bottom-6">
      {opened && (
        <div
          className={`h-[min(38rem,calc(100dvh-6.5rem))] w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-3xl shadow-[0_30px_70px_-20px_oklch(0.28_0.02_86/0.45)] ring-1 ring-saffron/30 ${
            open ? "animate-fade-up" : "hidden"
          }`}
        >
          <CompanionChat
            key={lang}
            variant="panel"
            context={{ ...context, lang }}
            sub={t.topicChatSub}
            hello={t.topicChatHello}
            placeholder={t.topicPlaceholder}
          />
        </div>
      )}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? t.close : t.chatName}
        className="inline-flex items-center gap-2.5 rounded-full bg-leaf py-3 ps-3.5 pe-5 font-bold text-white shadow-lg shadow-leaf/30 ring-2 ring-saffron/40 transition hover:-translate-y-0.5 hover:bg-leaf-deep"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-saffron text-ink">
          {open ? <X className="size-4" aria-hidden="true" /> : <MessageCircle className="size-4" aria-hidden="true" />}
        </span>
        {t.chatName}
      </button>
    </div>
  );
}
