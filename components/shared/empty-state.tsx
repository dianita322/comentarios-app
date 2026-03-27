import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export default function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-white/70">{description}</p>

      {ctaLabel && ctaHref ? (
        <div className="mt-4">
          <Link
            href={ctaHref}
            className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
          >
            {ctaLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}