export type ProjectStatus = "draft" | "published";

export type ProjectCategory =
  | "general"
  | "web"
  | "automatizacion"
  | "academico"
  | "herramienta"
  | "experimento";

export type ProjectRow = {
  id: number;
  author_id: string | null;
  title: string;
  slug: string;
  summary: string | null;
  description: string;
  cover_image_url: string | null;
  demo_url: string | null;
  repo_url: string | null;
  tech_stack: string | null;
  category: ProjectCategory;
  status: ProjectStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectAuthorProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
};