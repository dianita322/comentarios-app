export default function FeedLoading() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse">
          <div className="mb-3 h-8 w-64 rounded bg-white/10" />
          <div className="h-4 w-96 rounded bg-white/10" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse">
          <div className="h-24 w-full rounded bg-white/10" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse">
          <div className="mb-3 h-5 w-40 rounded bg-white/10" />
          <div className="mb-2 h-4 w-full rounded bg-white/10" />
          <div className="mb-2 h-4 w-5/6 rounded bg-white/10" />
          <div className="h-4 w-2/3 rounded bg-white/10" />
        </div>
      </div>
    </main>
  )
}