"use client";

import { useFormStatus } from "react-dom";

type DeleteCommentButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  commentId: number;
  slug: string;
};

function InnerButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs text-red-300 transition hover:text-red-200 disabled:opacity-60"
    >
      {pending ? "Eliminando..." : "Eliminar"}
    </button>
  );
}

export default function DeleteCommentButton({
  action,
  commentId,
  slug,
}: DeleteCommentButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("¿Seguro que quieres eliminar este comentario?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="comment_id" value={commentId} />
      <input type="hidden" name="slug" value={slug} />
      <InnerButton />
    </form>
  );
}
