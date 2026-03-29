"use client";

import { useFormStatus } from "react-dom";

type PostCommentFormProps = {
  postId: number;
  slug: string;
  action: (formData: FormData) => void | Promise<void>;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Publicando..." : "Comentar"}
    </button>
  );
}

export default function PostCommentForm({
  postId,
  slug,
  action,
}: PostCommentFormProps) {
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="post_id" value={postId} />
      <input type="hidden" name="slug" value={slug} />

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium text-white/85">
          Tu comentario
        </label>
        <textarea
          id="content"
          name="content"
          rows={4}
          minLength={2}
          required
          placeholder="Escribe tu comentario aquí"
          className="flex min-h-[120px] w-full rounded-md border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none placeholder:text-white/35 focus-visible:ring-2 focus-visible:ring-white/20"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-white/70">
        <input type="checkbox" name="is_anonymous" value="true" />
        Publicar como anónimo
      </label>

      <SubmitButton />
    </form>
  );
}
