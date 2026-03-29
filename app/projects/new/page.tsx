import Link from "next/link";
import { redirect } from "next/navigation";

import { createProjectAction } from "@/app/projects/new/actions";
import ProjectEditorForm from "@/components/projects/project-editor-form";
import AppContainer from "@/components/layout/app-container";
import AppPageHeader from "@/components/layout/app-page-header";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

type NewProjectPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewProjectPage({
  searchParams,
}: NewProjectPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/projects");
  }

  const errorMessage = params?.error ? decodeURIComponent(params.error) : null;

  return (
    <AppContainer className="space-y-8">
      <AppPageHeader
        eyebrow="Panel de proyectos"
        title="Nuevo proyecto"
        description="Solo el administrador puede registrar proyectos desde aquí."
        actions={
          <Link
            href="/projects/manage"
            className="inline-flex rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Ver mis proyectos
          </Link>
        }
      />

      {errorMessage ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <ProjectEditorForm
          action={createProjectAction}
          userId={user.id}
          submitLabel="Crear proyecto"
          pendingLabel="Creando..."
        />
      </section>
    </AppContainer>
  );
}