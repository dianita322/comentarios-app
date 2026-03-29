import type { ProjectCategory } from "@/lib/projects/types";

export const projectCategoryOptions: Array<{
  value: ProjectCategory;
  label: string;
  description: string;
}> = [
  {
    value: "general",
    label: "General",
    description: "Proyecto variado o sin categoría específica.",
  },
  {
    value: "web",
    label: "Web",
    description: "Sitios, apps web e interfaces interactivas.",
  },
  {
    value: "automatizacion",
    label: "Automatización",
    description: "Flujos automáticos, bots o integraciones.",
  },
  {
    value: "academico",
    label: "Académico",
    description: "Trabajos, herramientas o demos de estudio.",
  },
  {
    value: "herramienta",
    label: "Herramienta",
    description: "Utilidades prácticas para resolver tareas concretas.",
  },
  {
    value: "experimento",
    label: "Experimento",
    description: "Pruebas, ideas o prototipos exploratorios.",
  },
];

export const projectCategoryValues: ProjectCategory[] = projectCategoryOptions.map(
  (option) => option.value,
);

export function isValidProjectCategory(value: string): value is ProjectCategory {
  return projectCategoryValues.includes(value as ProjectCategory);
}

export function getProjectCategoryLabel(
  value: ProjectCategory | string | null | undefined,
) {
  const found = projectCategoryOptions.find((option) => option.value === value);
  return found?.label ?? "General";
}