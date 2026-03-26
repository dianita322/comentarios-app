import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-6xl flex-col gap-10 px-6 py-12">
      <section className="rounded-2xl border border-white/10 bg-black/30 p-8 shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-white/60">
          Día 2 · Base limpia y lista para crecer
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
          Tu plataforma ya no será solo de comentarios.
        </h1>

        <p className="mt-4 max-w-3xl text-base text-white/70 md:text-lg">
          Esta base te servirá para publicar contenido, mostrar proyectos,
          compartir imágenes, videos y seguir ampliando la web sin desordenar
          lo que ya funciona.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/feed"
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
          >
            Ir al feed
          </Link>

          <Link
            href="/account"
            className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Ir a mi cuenta
          </Link>

          <Link
            href="/auth/sign-up"
            className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Crear cuenta
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold">Comentarios</h2>
          <p className="mt-2 text-sm text-white/70">
            Publica comentarios, responde a otros usuarios y sigue construyendo
            interacción dentro del feed.
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold">Publicaciones</h2>
          <p className="mt-2 text-sm text-white/70">
            En las siguientes fases convertiremos esta base en una web tipo blog
            con textos, portadas, imágenes y mejor presentación.
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold">Proyectos</h2>
          <p className="mt-2 text-sm text-white/70">
            Más adelante agregarás una sección para mostrar tus proyectos en
            HTML, como tu generador de horarios y otras herramientas.
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold">Cuenta</h2>
          <p className="mt-2 text-sm text-white/70">
            Tu perfil seguirá siendo el punto de control para gestionar nombre,
            username y acceso del usuario autenticado.
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">Rutas importantes hoy</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="font-mono text-sm text-cyan-300">/feed</p>
            <p className="mt-2 text-sm text-white/70">
              Ver comentarios, reacciones, respuestas e imágenes.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="font-mono text-sm text-cyan-300">/account</p>
            <p className="mt-2 text-sm text-white/70">
              Editar tu perfil y tus datos visibles.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="font-mono text-sm text-cyan-300">/auth/login</p>
            <p className="mt-2 text-sm text-white/70">
              Iniciar sesión con una cuenta existente.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="font-mono text-sm text-cyan-300">/auth/sign-up</p>
            <p className="mt-2 text-sm text-white/70">
              Crear una nueva cuenta y confirmar el correo.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}