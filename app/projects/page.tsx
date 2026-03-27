import AppContainer from "@/components/layout/app-container";
import AppPageHeader from "@/components/layout/app-page-header";
import EmptyState from "@/components/shared/empty-state";

export default function ProjectsPage() {
  return (
    <AppContainer className="space-y-8">
      <AppPageHeader
        eyebrow="Nueva sección"
        title="Proyectos"
        description="Esta página servirá para mostrar tus herramientas, demos y proyectos personales, como tu generador de horarios y otros HTML."
      />

      <EmptyState
        title="Todavía no hay proyectos publicados"
        description="La ruta ya está creada. Más adelante agregaremos tarjetas, enlaces, vistas previas y una mejor presentación para cada proyecto."
      />
    </AppContainer>
  );
}