"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugifyPostTitle } from "@/lib/posts/slug";

type PostEditorFormProps = {
  action: (formData: FormData) => void;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full md:w-auto" disabled={pending}>
      {pending ? "Guardando..." : "Guardar publicación"}
    </Button>
  );
}

export default function PostEditorForm({ action }: PostEditorFormProps) {
  const [title, setTitle] = useState("");
  const [manualSlug, setManualSlug] = useState(false);
  const [slug, setSlug] = useState("");

  const autoSlug = useMemo(() => slugifyPostTitle(title), [title]);
  const finalSlug = manualSlug ? slug : autoSlug;

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            name="title"
            placeholder="Escribe el título de tu publicación"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
          placeholder="Escribe aquí el contenido completo de la publicación"
          className="flex min-h-[280px] w-full rounded-md border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none placeholder:text-white/35 focus-visible:ring-2 focus-visible:ring-white/20"
          required
        />
        <p className="text-xs text-white/50">
          Por ahora el contenido será texto plano. Luego lo mejoraremos.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cover_image_url">URL de imagen de portada</Label>
          <Input
            id="cover_image_url"
            name="cover_image_url"
            type="url"
            placeholder="https://..."
          />
          <p className="text-xs text-white/50">
            Hoy usaremos una URL directa. Más adelante subiremos imágenes desde
            la misma web.
          </p>
        </div>

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
            Borrador no será visible públicamente. Publicada sí aparecerá en
            /posts.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-medium">Vista previa rápida de URL</p>
        <p className="mt-2 break-all text-sm text-white/60">
          /posts/{finalSlug || "tu-slug-aparecera-aqui"}
        </p>
      </div>

      <SubmitButton />
    </form>
  );
}