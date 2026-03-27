import { cn } from "@/lib/utils";

type AppPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  actions?: React.ReactNode;
};

export default function AppPageHeader({
  eyebrow,
  title,
  description,
  className,
  actions,
}: AppPageHeaderProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/10 bg-black/30 p-6 shadow-lg",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.25em] text-white/60">
          {eyebrow}
        </p>
      ) : null}

      <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {title}
          </h1>

          {description ? (
            <p className="mt-3 text-sm text-white/70 md:text-base">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </section>
  );
}