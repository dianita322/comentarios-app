export type ToolCategory = "herramienta";

export type ToolItem = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: ToolCategory;
  coverImageUrl?: string | null;
  launchPath: string;
  isEmbedded: boolean;
};
