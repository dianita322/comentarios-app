"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isValidPostCategory } from "@/lib/posts/categories";
import { slugifyPostTitle } from "@/lib/posts/slug";
import { getPostCoverPathFromPublicUrl } from "@/lib/posts/storage";
import type { PostRow } from "@/lib/posts/types";
import { createClient } from "@/lib/supabase/server";

function buildErrorRedirect(postId: number, message: string) {
  return `/posts/manage/${postId}/edit?error=${encodeURIComponent(message)}`;
}

export async function updatePostAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error obteniendo el usuario autenticado:", userError);
    redirect("/auth/login");
  }

  if (!user) {
    redirect("/auth/login");
  }

  const postIdRaw = String(formData.get("post_id") ?? "").trim();
  const postId = Number(postIdRaw);

  if (!postIdRaw || Number.isNaN(postId)) {
    redirect("/posts/manage");
  }

  const { data: existingPostData, error: existingPostError } = await supabase
    .from("posts")
    .select(
      "id, author_id, title, slug, excerpt, content, cover_image_url, category, status, published_at, created_at, updated_at",
    )
    .eq("id", postId)
    .eq("author_id", user.id)
    .maybeSingle();

  if (existingPostError) {
    console.error("Error cargando publicación a editar:", existingPostError);
    redirect(buildErrorRedirect(postId, "No se pudo cargar la publicación."));
  }

  if (!existingPostData) {
    redirect("/posts/manage");
  }

  const existingPost = existingPostData as PostRow;

  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const coverImageUrlRaw = String(formData.get("cover_image_url") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "general").trim();
  const statusRaw = String(formData.get("status") ?? "draft").trim();

  const slug = slugifyPostTitle(rawSlug || title);
  const status = statusRaw === "published" ? "published" : "draft";
  const cover_image_url = coverImageUrlRaw || null;
  const category = isValidPostCategory(categoryRaw) ? categoryRaw : "general";

  if (title.length < 4) {
    redirect(buildErrorRedirect(postId, "El título debe tener al menos 4 caracteres."));
  }

  if (!slug) {
    redirect(buildErrorRedirect(postId, "No se pudo generar un slug válido. Revisa el título."));
  }

  if (content.length < 20) {
    redirect(buildErrorRedirect(postId, "El contenido debe tener al menos 20 caracteres."));
  }

  if (coverImageUrlRaw) {
    try {
      new URL(coverImageUrlRaw);
    } catch {
      redirect(buildErrorRedirect(postId, "La URL de la portada no es válida."));
    }
  }

  const { data: repeatedSlugPost, error: repeatedSlugError } = await supabase
    .from("posts")
    .select("id")
    .eq("slug", slug)
    .neq("id", postId)
    .maybeSingle();

  if (repeatedSlugError) {
    console.error("Error comprobando slug repetido:", repeatedSlugError);
    redirect(buildErrorRedirect(postId, "No se pudo validar el slug. Inténtalo de nuevo."));
  }

  if (repeatedSlugPost) {
    redirect(buildErrorRedirect(postId, "Ese slug ya existe. Usa uno diferente."));
  }

  const oldCoverPath = getPostCoverPathFromPublicUrl(
    existingPost.cover_image_url,
    user.id,
  );

  const newCoverPath = getPostCoverPathFromPublicUrl(cover_image_url, user.id);

  const published_at =
    status === "published"
      ? existingPost.published_at ?? new Date().toISOString()
      : null;

  const { error: updateError } = await supabase
    .from("posts")
    .update({
      title,
      slug,
      excerpt: excerpt || null,
      content,
      cover_image_url,
      category,
      status,
      published_at,
    })
    .eq("id", postId)
    .eq("author_id", user.id);

  if (updateError) {
    console.error("Error actualizando publicación:", updateError);
    redirect(
      buildErrorRedirect(
        postId,
        `Supabase devolvió este error: ${updateError.message}`,
      ),
    );
  }

  if (oldCoverPath && oldCoverPath !== newCoverPath) {
    const { error: deleteOldCoverError } = await supabase.storage
      .from("post-covers")
      .remove([oldCoverPath]);

    if (deleteOldCoverError) {
      console.error(
        "No se pudo eliminar la portada antigua tras actualizar:",
        deleteOldCoverError,
      );
    }
  }

  revalidatePath("/posts");
  revalidatePath("/posts/manage");
  revalidatePath(`/posts/${existingPost.slug}`);
  revalidatePath(`/posts/${slug}`);

  redirect("/posts/manage?success=updated");
}