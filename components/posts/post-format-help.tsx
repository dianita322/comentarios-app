export default function PostFormatHelp() {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h3 className="text-sm font-semibold">Guía rápida de formato</h3>
      <p className="mt-2 text-xs text-white/55">
        Desde hoy el contenido del post admite un formato sencillo tipo Markdown.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs font-medium text-white/70">Títulos</p>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-white/55">
{`# Título grande
## Subtítulo
### Título pequeño`}
          </pre>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs font-medium text-white/70">Énfasis</p>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-white/55">
{`**texto en negrita**
*texto en cursiva*
\`texto en código\``}
          </pre>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs font-medium text-white/70">Listas</p>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-white/55">
{`- punto uno
- punto dos

1. paso uno
2. paso dos`}
          </pre>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs font-medium text-white/70">Citas y enlaces</p>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-white/55">
{`> Esta es una cita

[OpenAI](https://openai.com)`}
          </pre>
        </div>
      </div>
    </section>
  );
}