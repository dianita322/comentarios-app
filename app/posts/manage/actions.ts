"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getPostCoverPathFromPublicUrl } from "@/lib/posts/storage";
import type { PostRow } from "@/lib/posts/types";
import { createClient } from "@/lib/supabase/server";

function redirectDeleteError(message: string) {
  redirect(`/posts/manage?error=${encodeURIComponent(message)}`);
}

export async function deletePostAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const postIdRaw = String(formData.get("post_id") ?? "").trim();
  const postId = Number(postIdRaw);

  if (!postIdRaw || Number.isNaN(postId)) {
    redirectDeleteError("No se recibió un identificador válido para eliminar la publicación.");
  }

  const { data: postData, error: postError } = await supabase
    .from("posts")
    .select(
      "id, author_id, title, slug, excerpt, content, cover_image_url, status, published_at, created_at, updated_at",
    )
    .eq("id", postId)
    .eq("author_id", user.id)
    .maybeSingle();

  if (postError) {
    console.error("Error cargando publicación para eliminar:", postError);
    redirectDeleteError("No se pudo cargar la publicación que quieres eliminar.");
  }

  if (!postData) {
    redirectDeleteError("No encontramos esa publicación o no te pertenece.");
  }

  const post = postData as PostRow;
  const oldCoverPath = getPostCoverPathFromPublicUrl(post.cover_image_url, user.id);

  const { error: deleteRowError } = await supabase
    .from("posts")
    .delete()
    .eq("id", post.id)
    .eq("author_id", user.id);

  if (deleteRowError) {
    console.error("Error eliminando publicación:", deleteRowError);
    redirectDeleteError(`Supabase devolvió este error: ${deleteRowError.message}`);
  }

  if (oldCoverPath) {
    const { error: deleteCoverError } = await supabase.storage
      .from("post-covers")
      .remove([oldCoverPath]);

    if (deleteCoverError) {
      console.error("No se pudo eliminar la portada antigua:", deleteCoverError);
    }
  }

  revalidatePath("/posts");
  revalidatePath("/posts/manage");
  revalidatePath(`/posts/${post.slug}`);

  redirect("/posts/manage?success=deleted");
}