export function formatProjectDate(dateString: string | null) {
  if (!dateString) return "Sin fecha";

  return new Date(dateString).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getProjectSummary(summary: string | null, description: string) {
  const cleanSummary = summary?.trim();

  if (cleanSummary) return cleanSummary;

  const cleanDescription = description.replace(/\s+/g, " ").trim();

  if (cleanDescription.length <= 180) return cleanDescription;

  return `${cleanDescription.slice(0, 180).trim()}...`;
}

export function parseProjectTechStack(techStack: string | null | undefined) {
  if (!techStack) return [];

  return techStack
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}