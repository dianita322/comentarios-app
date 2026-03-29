export type PostCommentRow = {
  id: number;
  post_id: number | null;
  user_id: string;
  content: string;
  image_url: string | null;
  is_anonymous: boolean;
  created_at: string;
};

export type ReactionRow = {
  id: number;
  user_id: string;
  target_type: "post" | "comment";
  target_id: number;
  reaction_type: string;
};

export function buildReactionState(
  reactions: ReactionRow[],
  currentUserId: string | null,
) {
  const reactionCountByKey: Record<string, number> = {};
  const reactedByCurrentUser = new Set<string>();

  for (const reaction of reactions) {
    const key = `${reaction.target_type}:${reaction.target_id}`;
    reactionCountByKey[key] = (reactionCountByKey[key] ?? 0) + 1;

    if (currentUserId && reaction.user_id === currentUserId) {
      reactedByCurrentUser.add(key);
    }
  }

  return { reactionCountByKey, reactedByCurrentUser };
}
