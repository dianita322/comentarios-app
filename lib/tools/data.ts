import type { ToolItem } from "@/lib/tools/types";

export const tools: ToolItem[] = [
  {
    slug: "generador-horarios",
    title: "Generador de horarios UNI",
    summary:
      "Primera herramienta integrada en tu web. Se carga como una herramienta pública para que cualquiera pueda usarla.",
    description:
      "Esta herramienta se sirve desde un archivo HTML estático dentro de la propia web. Es la forma más rápida y estable de integrar un HTML ya hecho sin tener que reescribirlo todavía en React.",
    category: "herramienta",
    coverImageUrl: null,
    launchPath: "/tools-static/generador-horarios/index.html",
    isEmbedded: true,
  },
];

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug) ?? null;
}
