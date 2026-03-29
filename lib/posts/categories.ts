import type { PostCategory } from "@/lib/posts/types";

export const postCategoryOptions: Array<{
  value: PostCategory;
  label: string;
  description: string;
}> = [
  {
    value: "general",
    label: "General",
    description: "Contenido variado o introductorio.",
  },
  {
    value: "tutorial",
    label: "Tutorial",
    description: "Guías paso a paso y explicaciones.",
  },
  {
    value: "proyecto",
    label: "Proyecto",
    description: "Demos, herramientas y avances de proyectos.",
  },
  {
    value: "actualizacion",
    label: "Actualización",
    description: "Novedades, mejoras y cambios recientes.",
  },
  {
    value: "opinion",
    label: "Opinión",
    description: "Reflexiones, ideas o análisis personales.",
  },
];

export const postCategoryValues: PostCategory[] = postCategoryOptions.map(
  (option) => option.value,
);

export function isValidPostCategory(value: string): value is PostCategory {
  return postCategoryValues.includes(value as PostCategory);
}

export function getPostCategoryLabel(
  value: PostCategory | string | null | undefined,
) {
  const found = postCategoryOptions.find((option) => option.value === value);
  return found?.label ?? "General";
}