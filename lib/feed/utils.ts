import type { ReactionRow, ReplyRow } from "@/lib/feed/types";

export function formatFeedDate(dateString: string) {
  return new Date(dateString).toLocaleString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function groupRepliesByComment(replies: ReplyRow[]) {
  const repliesByCommentId: Record<number, ReplyRow[]> = {};

  for (const reply of replies) {
    if (!repliesByCommentId[reply.comment_id]) {
      repliesByCommentId[reply.comment_id] = [];
    }

    repliesByCommentId[reply.comment_id].push(reply);
  }

  return repliesByCommentId;
}

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

  return {
    reactionCountByKey,
    reactedByCurrentUser,
  };
}