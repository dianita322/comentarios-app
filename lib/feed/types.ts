export type CommentRow = {
  id: number;
  user_id: string;
  content: string;
  image_url: string | null;
  is_anonymous: boolean;
  created_at: string;
};

export type ReplyRow = {
  id: number;
  comment_id: number;
  user_id: string;
  content: string;
  image_url: string | null;
  is_anonymous: boolean;
  created_at: string;
};

export type ReactionRow = {
  id: number;
  user_id: string;
  target_type: "comment" | "reply";
  target_id: number;
  reaction_type: "like";
};

export type ProfileRow = {
  id: string;
  display_name: string | null;
  username: string | null;
};