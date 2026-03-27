import Link from "next/link";

import { formatPostDate, getPostSummary } from "@/lib/posts/utils";
import type { PostRow } from "@/lib/posts/types";

type PostCardProps = {
  post: PostRow;
  authorName?: string;
};

export default function PostCard({ post, authorName }: PostCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      {post.cover_image_url ? (
        <div className="aspect-[16/8] w-full overflow-hidden bg-black/30">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
          <span>{formatPostDate(post.published_at ?? post.created_at)}</span>
          {authorName ? <span>• Por {authorName}</span> : null}
        </div>

        <h2 className="mt-3 text-xl font-semibold leading-tight">
          <Link href={`/posts/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h2>

        <p className="mt-3 text-sm text-white/70">
          {getPostSummary(post.excerpt, post.content)}
        </p>

        <div className="mt-4">
          <Link
            href={`/posts/${post.slug}`}
            className="inline-flex rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Leer publicación
          </Link>
        </div>
      </div>
    </article>
  );
}