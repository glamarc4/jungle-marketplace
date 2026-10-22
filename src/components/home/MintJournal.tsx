
import { ArrowRight } from "lucide-react"

import {
  journalArticles,
  type JournalArticle,
} from "@/data/journal-articles"

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
})

const journalImages = [
  "/images/nfts/macaco-preto.png",
  "/images/nfts/macaco-bege.png",
  "/images/nfts/macaco-cinza.png",
  "/images/nfts/macaco-marrom.png",
]

function JournalCard({
  article,
  imageSrc,
}: {
  article: JournalArticle
  imageSrc: string
}) {
  const publishedDate = dateFormatter.format(
    new Date(`${article.publishedAt}T12:00:00Z`)
  )

  return (
    <article
      className={[
        "group flex h-full min-w-0 flex-col overflow-hidden",
        "rounded-[16px] border border-kurio-border",
        "bg-kurio-card",

        // Animação do CARD inteiro
        "transform-gpu translate-y-0",
        "transition-transform duration-200 ease-in-out",
        "hover:-translate-y-[3px]",

        // Borda e sombra
        "hover:border-kurio-primary/60",
        "hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)]",

        "motion-reduce:transform-none",
        "motion-reduce:transition-none",
      ].join(" ")}
    >
      {/* Imagem com zoom suave no hover */}
      <div className="aspect-[1.12/1] overflow-hidden bg-kurio-raised">
        <img
          src={imageSrc}
          alt={`Imagem do artigo: ${article.title}`}
          loading="lazy"
          decoding="async"
          draggable={false}
          className={[
            "h-full w-full object-cover object-center",
            "transition-transform duration-500 ease-out",
            "group-hover:scale-[1.045]",
            "motion-reduce:transition-none",
          ].join(" ")}
        />
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-4 font-mono">
        <p className="text-[10px] leading-[16px] tracking-[0.2px] text-kurio-text-secondary">
          <time dateTime={article.publishedAt}>
            {publishedDate}
          </time>

          <span aria-hidden="true" className="mx-2">
            |
          </span>

          Leitura de {article.readingMinutes} min
        </p>

        <h3
          className={[
            "mt-3 text-[14px] font-bold",
            "leading-[21px] tracking-[0.2px]",
            "text-foreground",
          ].join(" ")}
        >
          {article.title}
        </h3>

        <p
          className={[
            "mt-4 text-[12px] leading-[19px]",
            "tracking-[0.1px] text-kurio-text-secondary",
          ].join(" ")}
        >
          {article.description}
        </p>

        <a
          href={article.href}
          aria-label={`Ler mais sobre ${article.title}`}
          className={[
            "mt-auto inline-flex min-h-8 items-center gap-1.5",
            "self-start pt-3 font-mono text-[12px] font-bold",
            "text-kurio-primary transition-colors",
            "hover:text-kurio-primary-light",
            "focus-visible:outline-2 focus-visible:outline-offset-2",
            "focus-visible:outline-kurio-primary",
          ].join(" ")}
        >
          Ler mais

          <ArrowRight
            aria-hidden="true"
            className={[
              "size-3.5 transition-transform duration-300",
              "group-hover:translate-x-1.5",
              "motion-reduce:transition-none",
            ].join(" ")}
          />
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
      <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-8 lg:px-12 xl:px-[85px]">
        {/* Cabeçalho centralizado */}
        <div className="mb-10 flex flex-col items-center text-center font-mono">
          <h2
            id="journal-heading"
            className="text-2xl font-bold tracking-[0.4px] text-foreground sm:text-3xl"
          >
            Diário da Cunhagem
          </h2>

          <p className="mx-auto mt-3 max-w-3xl text-center text-xs leading-6 text-kurio-text-secondary sm:text-sm">
            Histórias, guias e insights para colecionadores
            sobre o universo da propriedade digital.
          </p>
        </div>

        {/* Quatro artigos */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {journalArticles.map((article, index) => (
            <JournalCard
              key={article.id}
              article={article}
              imageSrc={journalImages[index % journalImages.length]}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
