import AppContainer from "@/components/layout/app-container";
import AppPageHeader from "@/components/layout/app-page-header";
import EmptyState from "@/components/shared/empty-state";
import ToolCard from "@/components/tools/tool-card";
import { tools } from "@/lib/tools/data";

export default function ToolsPage() {
  return (
    <AppContainer className="space-y-8">
      <AppPageHeader
        eyebrow="Utilidades"
        title="Herramientas"
        description="Aquí vivirán las herramientas que tú publiques para que el público pueda usarlas. La primera será tu generador de horarios."
      />

      {tools.length === 0 ? (
        <EmptyState
          title="Todavía no hay herramientas"
          description="Cuando agregues la primera herramienta, aparecerá aquí."
        />
      ) : (
        <section className="grid gap-6 md:grid-cols-2">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </section>
      )}
    </AppContainer>
  );
}
