import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm uppercase tracking-[0.25em] text-white/50">
              Fase 2 · Mejora de interfaz
            </p>

            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              Tu plataforma de comentarios ya es una app real.
            </h1>

            <p className="mt-6 text-base text-white/70 md:text-lg">
              Publica comentarios, responde, reacciona, sube imágenes y navega
              fácilmente entre las secciones principales de la aplicación.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/feed"
                className="rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:bg-white/90"
              >
                Ir al feed
              </Link>

              <Link
                href="/account"
                className="rounded-xl border border-white/20 px-6 py-3 font-medium text-white transition hover:bg-white/10"
              >
                Ir a mi cuenta
              </Link>

              <Link
                href="/auth/sign-up"
                className="rounded-xl border border-white/20 px-6 py-3 font-medium text-white transition hover:bg-white/10"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Comentarios</h2>
            <p className="mt-3 text-white/70">
              Publica comentarios normales o anónimos, edítalos y elimínalos
              cuando quieras.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Interacción</h2>
            <p className="mt-3 text-white/70">
              Responde comentarios, deja reacciones y participa en conversaciones
              dentro del feed.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Perfil</h2>
            <p className="mt-3 text-white/70">
              Mantén tu nombre visible y tu username actualizados desde la página
              de cuenta.
            </p>
          </article>
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-2xl font-bold">Rutas principales</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Link
              href="/feed"
              className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:bg-white/10"
            >
              <p className="text-lg font-semibold">/feed</p>
              <p className="mt-2 text-white/60">
                Ver comentarios, respuestas, reacciones e imágenes.
              </p>
            </Link>

            <Link
              href="/account"
              className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:bg-white/10"
            >
              <p className="text-lg font-semibold">/account</p>
              <p className="mt-2 text-white/60">
                Editar nombre visible, username y revisar tu perfil.
              </p>
            </Link>

            <Link
              href="/auth/login"
              className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:bg-white/10"
            >
              <p className="text-lg font-semibold">/auth/login</p>
              <p className="mt-2 text-white/60">
                Iniciar sesión con una cuenta existente.
              </p>
            </Link>

            <Link
              href="/auth/sign-up"
              className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:bg-white/10"
            >
              <p className="text-lg font-semibold">/auth/sign-up</p>
              <p className="mt-2 text-white/60">
                Crear una nueva cuenta en la plataforma.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}