
import { Link } from "@tanstack/react-router"
import { ArrowLeft, Construction } from "lucide-react"

type RoutePlaceholderPageProps = {
  title: string
  description: string
}

export function RoutePlaceholderPage({
  title,
  description,
}: RoutePlaceholderPageProps) {
  return (
    <section className="mx-auto flex min-h-[65vh] max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-kurio-border bg-kurio-card text-kurio-primary">
        <Construction className="size-7" aria-hidden="true" />
      </div>

      <span className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-kurio-primary">
        Em desenvolvimento
      </span>

      <h1 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
        {title}
      </h1>

      <p className="max-w-lg text-sm leading-7 text-kurio-text-secondary">
        {description}
      </p>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-kurio-primary px-5 py-3 font-mono text-sm font-semibold text-kurio-ink transition-opacity hover:opacity-90"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para o início
      </Link>
    </section>
  )
}
