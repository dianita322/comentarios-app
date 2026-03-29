"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugifyPostTitle } from "@/lib/posts/slug";
import { createClient } from "@/lib/supabase/client";

type PostEditorFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  userId: string;
};

function SubmitButton({ isUploading }: { isUploading: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full md:w-auto"
      disabled={pending || isUploading}
    >
      {pending
        ? "Guardando..."
        : isUploading
          ? "Subiendo imagen..."
          : "Guardar publicación"}
    </Button>
  );
}

export default function PostEditorForm({
  action,
  userId,
}: PostEditorFormProps) {
  const [title, setTitle] = useState("");
  const [manualSlug, setManualSlug] = useState(false);
  const [slug, setSlug] = useState("");

  const [manualCoverUrl, setManualCoverUrl] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const autoSlug = useMemo(() => slugifyPostTitle(title), [title]);
  const finalSlug = manualSlug ? slug : autoSlug;
  const finalCoverImageUrl = uploadedImageUrl || manualCoverUrl.trim();

  async function handleCoverFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadError(null);

    if (!file.type.startsWith("image/")) {
      setUploadError("El archivo seleccionado no es una imagen válida.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("La imagen no debe superar los 5 MB.");
      return;
    }

    const supabase = createClient();
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const baseName =
      slugifyPostTitle(file.name.replace(/\.[^/.]+$/, "")) || "portada";
    const filePath = `${userId}/${Date.now()}-${baseName}.${fileExtension}`;

    setIsUploading(true);

    try {
      const { error } = await supabase.storage
        .from("post-covers")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage
        .from("post-covers")
        .getPublicUrl(filePath);

      setUploadedImageUrl(data.publicUrl);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo subir la imagen de portada.";

      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  }

  function removeSelectedImage() {
    setUploadedImageUrl("");
    setManualCoverUrl("");
    setUploadError(null);
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="cover_image_url" value={finalCoverImageUrl} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            name="title"
            placeholder="Escribe el título de tu publicación"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={4}
            required
          />
          <p className="text-xs text-white/50">
            Usa un título claro. Más adelante esto también ayudará al SEO.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug o URL amigable</Label>
          <Input
            id="slug"
            name="slug"
            placeholder="mi-publicacion"
            value={finalSlug}
            onChange={(e) => {
              setManualSlug(true);
              setSlug(slugifyPostTitle(e.target.value));
            }}
            required
          />
          <p className="text-xs text-white/50">
            Se genera automáticamente desde el título, pero puedes editarlo.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Resumen corto</Label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          placeholder="Escribe un resumen corto para la tarjeta de la publicación"
          className="flex min-h-[96px] w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus-visible:ring-2 focus-visible:ring-white/20"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Contenido</Label>
        <textarea
          id="content"
          name="content"
          rows={14}
          minLength={20}
          placeholder="Escribe aquí el contenido completo de la publicación"
          className="flex min-h-[280px] w-full rounded-md border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none placeholder:text-white/35 focus-visible:ring-2 focus-visible:ring-white/20"
          required
        />
        <p className="text-xs text-white/50">
          Por ahora el contenido será texto plano. Luego lo mejoraremos.
        </p>
      </div>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div>
          <h3 className="text-sm font-semibold">Portada de la publicación</h3>
          <p className="mt-1 text-xs text-white/50">
            Desde hoy puedes subir una imagen desde tu PC al bucket de Supabase.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cover_file">Subir imagen desde tu PC</Label>
            <Input
              id="cover_file"
              type="file"
              accept="image/*"
              onChange={handleCoverFileChange}
              disabled={isUploading}
            />
            <p className="text-xs text-white/50">
              Formatos recomendados: JPG, PNG o WEBP. Máximo 5 MB.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual_cover_url">O usar una URL directa</Label>
            <Input
              id="manual_cover_url"
              type="url"
              placeholder="https://..."
              value={manualCoverUrl}
              onChange={(e) => setManualCoverUrl(e.target.value)}
              disabled={Boolean(uploadedImageUrl)}
            />
            <p className="text-xs text-white/50">
              Si ya subiste una imagen, este campo queda desactivado para evitar conflictos.
            </p>
          </div>
        </div>

        {uploadError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {uploadError}
          </div>
        ) : null}

        {finalCoverImageUrl ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Vista previa de portada</p>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              <Image
                src={finalCoverImageUrl}
                alt="Vista previa de portada"
                width={1200}
                height={630}
                unoptimized
                className="h-auto max-h-[320px] w-full object-cover"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={removeSelectedImage}
              >
                Quitar portada
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        <select
          id="status"
          name="status"
          defaultValue="draft"
          className="flex h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        >
          <option value="draft">Borrador</option>
          <option value="published">Publicada</option>
        </select>
        <p className="text-xs text-white/50">
          Borrador no será visible públicamente. Publicada sí aparecerá en /posts.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-medium">Vista previa rápida de URL</p>
        <p className="mt-2 break-all text-sm text-white/60">
          /posts/{finalSlug || "tu-slug-aparecera-aqui"}
        </p>
      </div>

      <SubmitButton isUploading={isUploading} />
    </form>
  );
}