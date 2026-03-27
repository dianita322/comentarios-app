export type PostStatus = "draft" | "published";

export type PostRow = {
  id: number;
  author_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PostAuthorProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
};