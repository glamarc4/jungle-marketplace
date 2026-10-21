
import { ArrowRight } from "lucide-react"

import { MonkeyArtwork } from "@/components/home/MonkeyArtwork"
import {
  journalArticles,
  type JournalArticle,
} from "@/data/journal-articles"

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
})

function JournalCard({
  article,
}: {
  article: JournalArticle
}) {
  const publishedDate = dateFormatter.format(
    new Date(`${article.publishedAt}T12:00:00Z`)
  )

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-md bg-kurio-card">
      <div className="aspect-square overflow-hidden bg-kurio-raised">
        <div className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.035] motion-reduce:transition-none">
          <MonkeyArtwork variant={article.artwork} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 py-4 font-mono">
        <p className="text-[11px] leading-5 text-kurio-text-secondary">
          <time dateTime={article.publishedAt}>
            {publishedDate}
          </time>
          <span aria-hidden="true" className="mx-2">
            |
          </span>
          Leitura de {article.readingMinutes} min
        </p>

        <h3 className="mt-2 text-sm font-bold leading-5 text-foreground sm:text-base">
          {article.title}
        </h3>

        <p className="mt-2 text-xs leading-5 text-kurio-text-secondary">
          {article.description}
        </p>

        <a
          href={article.href}
          aria-label={`Ler mais sobre ${article.title}`}
          className="mt-auto inline-flex min-h-9 items-center gap-1 self-start pt-3 text-xs font-bold text-kurio-primary transition-colors hover:text-kurio-primary-light"
        >
          Ler mais
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </a>
      </div>
    </article>
  )
}

export function MintJournal() {
  return (
    <section
      id="diario"
      aria-labelledby="journal-heading"
      className="scroll-mt-20 pb-20 pt-8 sm:pb-24 sm:pt-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center font-mono">
          <h2
            id="journal-heading"
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            Diário da Cunhagem
          </h2>

          <p className="mx-auto mt-3 max-w-3xl text-xs leading-6 text-kurio-text-secondary sm:text-sm">
            Histórias, guias e insights para colecionadores
            sobre o universo da propriedade digital.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {journalArticles.map((article) => (
            <JournalCard
              key={article.id}
              article={article}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
