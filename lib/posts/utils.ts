export function formatPostDate(dateString: string | null) {
  if (!dateString) return "Sin fecha";

  return new Date(dateString).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getPostSummary(excerpt: string | null, content: string) {
  const cleanExcerpt = excerpt?.trim();

  if (cleanExcerpt) return cleanExcerpt;

  const cleanContent = content.replace(/\s+/g, " ").trim();

  if (cleanContent.length <= 180) return cleanContent;

  return `${cleanContent.slice(0, 180).trim()}...`;
}