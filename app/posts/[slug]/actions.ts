"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

function redirectToPost(slug: string, error?: string) {
  if (error) {
    redirect(`/posts/${slug}?error=${encodeURIComponent(error)}`);
  }

  revalidatePath(`/posts/${slug}`);
}

export async function createPostCommentAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const slug = String(formData.get("slug") ?? "").trim();
  const postId = Number(String(formData.get("post_id") ?? "").trim());
  const content = String(formData.get("content") ?? "").trim();
  const isAnonymous = String(formData.get("is_anonymous") ?? "") === "true";

  if (!slug || Number.isNaN(postId)) {
    redirect("/posts");
  }

  if (content.length < 2) {
    redirectToPost(slug, "El comentario debe tener al menos 2 caracteres.");
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    content,
    image_url: null,
    is_anonymous: isAnonymous,
  });

  if (error) {
    console.error("Error creando comentario:", error);
    redirectToPost(slug, `No se pudo comentar: ${error.message}`);
  }

  revalidatePath(`/posts/${slug}`);
}

export async function deletePostCommentAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const slug = String(formData.get("slug") ?? "").trim();
  const commentId = Number(String(formData.get("comment_id") ?? "").trim());

  if (!slug || Number.isNaN(commentId)) {
    redirect("/posts");
  }

  const { data: comment, error: readError } = await supabase
    .from("comments")
    .select("id, user_id")
    .eq("id", commentId)
    .maybeSingle();

  if (readError || !comment) {
    redirectToPost(slug, "No se encontró el comentario.");
  }

  const isAdmin = isAdminEmail(user.email);
  const isOwner = comment.user_id === user.id;

  if (!isOwner && !isAdmin) {
    redirectToPost(slug, "No tienes permiso para eliminar este comentario.");
  }

  const { error: deleteError } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (deleteError) {
    console.error("Error eliminando comentario:", deleteError);
    redirectToPost(slug, `No se pudo eliminar: ${deleteError.message}`);
  }

  revalidatePath(`/posts/${slug}`);
}

async function toggleReaction(
  formData: FormData,
  targetType: "post" | "comment",
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const slug = String(formData.get("slug") ?? "").trim();
  const rawId =
    targetType === "post"
      ? String(formData.get("post_id") ?? "").trim()
      : String(formData.get("comment_id") ?? "").trim();

  const targetId = Number(rawId);

  if (!slug || Number.isNaN(targetId)) {
    redirect("/posts");
  }

  const { data: existingReaction, error: existingReactionError } = await supabase
    .from("reactions")
    .select("id")
    .eq("user_id", user.id)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();

  if (existingReactionError) {
    console.error("Error comprobando reacción:", existingReactionError);
    redirectToPost(slug, "No se pudo comprobar la reacción.");
  }

  if (existingReaction) {
    const { error: deleteError } = await supabase
      .from("reactions")
      .delete()
      .eq("id", existingReaction.id);

    if (deleteError) {
      console.error("Error eliminando reacción:", deleteError);
      redirectToPost(slug, "No se pudo quitar la reacción.");
    }
  } else {
    const { error: insertError } = await supabase.from("reactions").insert({
      user_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reaction_type: "like",
    });

    if (insertError) {
      console.error("Error creando reacción:", insertError);
      redirectToPost(slug, "No se pudo registrar la reacción.");
    }
  }

  revalidatePath(`/posts/${slug}`);
}

export async function togglePostReactionAction(formData: FormData) {
  return toggleReaction(formData, "post");
}

export async function toggleCommentReactionAction(formData: FormData) {
  return toggleReaction(formData, "comment");
}
