"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { projectCategoryOptions } from "@/lib/projects/categories";
import { createClient } from "@/lib/supabase/client";
import { slugifyPostTitle } from "@/lib/posts/slug";
import type { ProjectCategory, ProjectStatus } from "@/lib/projects/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProjectEditorInitialData = {
  id?: number;
  title?: string;
  slug?: string;
  summary?: string | null;
  description?: string;
  coverImageUrl?: string | null;
  demoUrl?: string | null;
  repoUrl?: string | null;
  techStack?: string | null;
  category?: ProjectCategory;
  status?: ProjectStatus;
};

type ProjectEditorFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  userId: string;
  initialData?: ProjectEditorInitialData;
  submitLabel?: string;
  pendingLabel?: string;
};

function SubmitButton({
  isUploading,
  submitLabel,
  pendingLabel,
}: {
  isUploading: boolean;
  submitLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full md:w-auto" disabled={pending || isUploading}>
      {pending ? pendingLabel : isUploading ? "Subiendo imagen..." : submitLabel}
    </Button>
  );
}

export default function ProjectEditorForm({
  action,
  userId,
  initialData,
  submitLabel = "Guardar proyecto",
  pendingLabel = "Guardando...",
}: ProjectEditorFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [manualSlug, setManualSlug] = useState(Boolean(initialData?.slug));
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [summary, setSummary] = useState(initialData?.summary ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [manualCoverUrl, setManualCoverUrl] = useState(
    initialData?.coverImageUrl ?? "",
  );
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [demoUrl, setDemoUrl] = useState(initialData?.demoUrl ?? "");
  const [repoUrl, setRepoUrl] = useState(initialData?.repoUrl ?? "");
  const [techStack, setTechStack] = useState(initialData?.techStack ?? "");
  const [category, setCategory] = useState<ProjectCategory>(
    initialData?.category ?? "general",
  );
  const [status, setStatus] = useState<ProjectStatus>(
    initialData?.status ?? "draft",
  );

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
        .from("project-covers")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage
        .from("project-covers")
        .getPublicUrl(filePath);

      setUploadedImageUrl(data.publicUrl);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo subir la imagen de portada del proyecto.";

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
      {initialData?.id ? (
        <input type="hidden" name="project_id" value={initialData.id} />
      ) : null}

      <input type="hidden" name="cover_image_url" value={finalCoverImageUrl} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Título del proyecto</Label>
          <Input
            id="title"
            name="title"
            placeholder="Generador de horarios UNI"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug o URL amigable</Label>
          <Input
            id="slug"
            name="slug"
            placeholder="generador-de-horarios-uni"
            value={finalSlug}
            onChange={(e) => {
              setManualSlug(true);
              setSlug(slugifyPostTitle(e.target.value));
            }}
            required
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-2">
          <Label htmlFor="summary">Resumen corto</Label>
          <textarea
            id="summary"
            name="summary"
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Describe el proyecto en pocas líneas"
            className="flex min-h-[96px] w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus-visible:ring-2 focus-visible:ring-white/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ProjectCategory)}
            className="flex h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          >
            {projectCategoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-white/50">
            Esto ayudará a organizar y filtrar mejor tus proyectos.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción completa</Label>
        <textarea
          id="description"
          name="description"
          rows={12}
          minLength={20}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explica qué hace el proyecto, por qué lo hiciste y cómo se usa"
          className="flex min-h-[260px] w-full rounded-md border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none placeholder:text-white/35 focus-visible:ring-2 focus-visible:ring-white/20"
          required
        />
      </div>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div>
          <h3 className="text-sm font-semibold">Portada del proyecto</h3>
          <p className="mt-1 text-xs text-white/50">
            Puedes subir una imagen desde tu PC o usar una URL directa.
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
              Formatos recomendados: JPG, PNG, WEBP o GIF. Máximo 5 MB.
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
              Si subes una imagen nueva, este campo se desactiva para evitar conflictos.
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
                alt="Vista previa de portada del proyecto"
                width={1200}
                height={630}
                unoptimized
                className="h-auto max-h-[320px] w-full object-cover"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={removeSelectedImage}>
                Quitar portada
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="demo_url">Enlace de demo</Label>
          <Input
            id="demo_url"
            name="demo_url"
            type="url"
            placeholder="https://..."
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="repo_url">Enlace del repositorio</Label>
          <Input
            id="repo_url"
            name="repo_url"
            type="url"
            placeholder="https://github.com/..."
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tech_stack">Tecnologías usadas</Label>
        <Input
          id="tech_stack"
          name="tech_stack"
          placeholder="HTML, CSS, JavaScript, Supabase"
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
        />
        <p className="text-xs text-white/50">Escríbelas separadas por comas.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        <select
          id="status"
          name="status"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value === "published" ? "published" : "draft")
          }
          className="flex h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        >
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
        </select>
        <p className="text-xs text-white/50">
          Borrador no será visible públicamente. Publicado sí aparecerá en /projects.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-medium">Vista previa rápida de URL</p>
        <p className="mt-2 break-all text-sm text-white/60">
          /projects/{finalSlug || "tu-slug-aparecera-aqui"}
        </p>
      </div>

      <SubmitButton
        isUploading={isUploading}
        submitLabel={submitLabel}
        pendingLabel={pendingLabel}
      />
    </form>
  );
}