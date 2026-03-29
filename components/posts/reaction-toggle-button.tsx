"use client";

import { useFormStatus } from "react-dom";

type ReactionToggleButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: Record<string, string | number>;
  count: number;
  active: boolean;
};

function InnerButton({
  count,
  active,
}: {
  count: number;
  active: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        active
          ? "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white px-3 py-1.5 text-sm font-semibold text-black"
          : "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/10"
      }
    >
      <span>{pending ? "..." : "❤️"}</span>
      <span>{count}</span>
    </button>
  );
}

export default function ReactionToggleButton({
  action,
  hiddenFields,
  count,
  active,
}: ReactionToggleButtonProps) {
  return (
    <form action={action}>
      {Object.entries(hiddenFields).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={String(value)} />
      ))}

      <InnerButton count={count} active={active} />
    </form>
  );
}
