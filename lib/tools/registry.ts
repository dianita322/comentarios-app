export type ToolItem = {
  slug: string;
  title: string;
  description: string;
  category: string;
  status: "published";
  embedPath: string;
};

export const toolsRegistry: ToolItem[] = [
  {
    slug: "generador-horarios-uni",
    title: "Generador de Horarios UNI",
    description:
      "Herramienta web para generar y analizar horarios académicos a partir de carga curricular, con soporte visual y flujo completo en navegador.",
    category: "Herramienta",
    status: "published",
    embedPath: "/tool-assets/generador-horarios/index.html",
  },
];

export function getToolBySlug(slug: string) {
  return toolsRegistry.find((tool) => tool.slug === slug) ?? null;
}