export const siteConfig = {
  name: "Comentarios App",
  description:
    "Plataforma web creada con Next.js y Supabase para comentarios, publicaciones y proyectos.",
  nav: [
    { href: "/", label: "Inicio" },
    { href: "/feed", label: "Feed" },
    { href: "/posts", label: "Publicaciones" },
    { href: "/projects", label: "Proyectos" },
  ],
} as const;