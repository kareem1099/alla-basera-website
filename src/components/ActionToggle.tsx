import { Check } from "lucide-react";
import { useLang } from "../lib/i18n";

interface Props {
  text: string;
  checked: boolean;
  onToggle: () => void;
}

export default function ActionToggle({ text, checked, onToggle }: Props) {
  const { t } = useLang();
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      data-section="عمل النهارده"
      className={`flex w-full items-start gap-3 rounded-2xl p-4 text-start ring-1 transition-colors sm:p-5 ${
        checked ? "bg-leaf/10 ring-leaf/30" : "bg-saffron/15 ring-saffron/30"
      }`}
    >
      <span
        className={`mt-1 flex size-6 shrink-0 items-center justify-center rounded-full ring-2 ${checked ? "bg-leaf text-white ring-leaf" : "ring-ink/30"}`}
        aria-hidden="true"
      >
        {checked && <Check className="size-4" />}
      </span>
      <span className="min-w-0">
        <span className="mb-1 block text-[15px] font-bold text-leaf-deep">{t.action}</span>
        <span className="block leading-relaxed whitespace-pre-line">{text}</span>
      </span>
    </button>
  );
}
