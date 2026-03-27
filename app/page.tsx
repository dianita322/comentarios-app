import Link from "next/link";

import AppContainer from "@/components/layout/app-container";
import AppPageHeader from "@/components/layout/app-page-header";

const sections = [
  {
    title: "Feed",
    description:
      "La parte que ya tienes funcionando: comentarios, respuestas, reacciones e imágenes.",
    href: "/feed",
    cta: "Abrir feed",
  },
  {
    title: "Publicaciones",
    description:
      "Nueva sección preparada para que luego publiques contenido tipo blog con mejor estructura.",
    href: "/posts",
    cta: "Ver publicaciones",
  },
  {
    title: "Proyectos",
    description:
      "Sección creada para más adelante mostrar tus herramientas, demos y proyectos en HTML.",
    href: "/projects",
    cta: "Ver proyectos",
  },
  {
    title: "Cuenta",
    description:
      "Área del usuario autenticado para editar perfil y controlar su acceso dentro de la web.",
    href: "/account",
    cta: "Ir a mi cuenta",
  },
] as const;

export default function HomePage() {
  return (
    <AppContainer className="space-y-8">
      <AppPageHeader
        eyebrow="Día 3 · Estructura preparada para escalar"
        title="Tu proyecto ahora ya tiene base para crecer por secciones."
        description="Hoy dejamos la aplicación lista para evolucionar desde una app de comentarios hacia una plataforma con publicaciones, proyectos y nuevas páginas reutilizando componentes compartidos."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/feed"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Ir al feed
            </Link>

            <Link
              href="/posts"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Ir a publicaciones
            </Link>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sections.map((section) => (
          <article
            key={section.href}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="mt-2 text-sm text-white/70">{section.description}</p>
            <div className="mt-4">
              <Link
                href={section.href}
                className="inline-flex rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                {section.cta}
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">Qué organizamos hoy</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="font-semibold">Componentes compartidos</p>
            <p className="mt-2 text-sm text-white/70">
              Ahora la app usa piezas reutilizables para contenedor, cabeceras
              y estados vacíos.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="font-semibold">Navegación preparada</p>
            <p className="mt-2 text-sm text-white/70">
              El menú ya contempla las futuras secciones principales del sitio.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="font-semibold">Feed más ordenado</p>
            <p className="mt-2 text-sm text-white/70">
              Parte de la lógica del feed sale del archivo principal para que no
              siga creciendo de forma desordenada.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="font-semibold">Rutas nuevas</p>
            <p className="mt-2 text-sm text-white/70">
              Ya existen páginas base para Publicaciones y Proyectos, listas
              para completarse en las siguientes fases.
            </p>
          </div>
        </div>
      </section>
    </AppContainer>
  );
}