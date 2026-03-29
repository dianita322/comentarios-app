"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type DeletePostButtonProps = {
  postId: number;
  action: (formData: FormData) => void | Promise<void>;
};

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="destructive"
      className="w-full md:w-auto"
      disabled={pending}
    >
      {pending ? "Eliminando..." : "Eliminar"}
    </Button>
  );
}

export default function DeletePostButton({
  postId,
  action,
}: DeletePostButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "¿Seguro que quieres eliminar esta publicación? Esta acción no se puede deshacer.",
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="post_id" value={postId} />
      <DeleteSubmitButton />
    </form>
  );
}