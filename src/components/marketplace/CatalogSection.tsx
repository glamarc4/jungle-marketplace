
import { useState } from "react"
import {
  useNavigate,
  useSearch,
  useLocation,
} from "@tanstack/react-router"
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { CatalogSkeleton } from "./CatalogSkeleton"
import { resolveCatalogSearch } from "@/router/catalog"
import { PAGE_SIZE } from "@/data/mock-nfts"
import {
  defaultFilters,
  type CatalogFilterValues,
} from "@/domain/catalog"
import { CatalogFilters } from "./CatalogFilters"
import { useNfts } from "@/hooks/use-api"
import { RequestState } from "@/components/RequestState"
import { NftCard } from "./NftCard"

type CatalogTab = "all" | "new" | "trending"
type SortOption = "recent" | "price-asc" | "price-desc" | "name"

type CatalogSectionProps = {
  mode?: "mobile-toolbar" | "catalog"
}

const tabs: { id: CatalogTab; label: string }[] = [
  { id: "all", label: "Todos os NFTs" },
  { id: "new", label: "Novos lançamentos" },
  { id: "trending", label: "Em alta" },
]

export function CatalogSection({
  mode = "catalog",
}: CatalogSectionProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const filters = resolveCatalogSearch(
    useSearch({ strict: false })
  )

  const {
    search,
    sort,
    page,
    tab: activeTab,
    ...appliedFilters
  } = filters

  const source = location.href

  const [draft, setDraft] = useState<{
    source: string
    values: CatalogFilterValues
  } | null>(null)

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false)

  const draftFilters =
    draft?.source === source
      ? draft.values
      : appliedFilters

  const query = useNfts({
    ...filters,
    pageSize: PAGE_SIZE,
  })

  const totalPages = query.data?.totalPages ?? 1
  const currentPage = page
  const visibleNfts = query.data?.items ?? []

  function updateUrl(next: Partial<typeof filters>) {
    void navigate({
      to:
        location.pathname === "/mercado"
          ? "/mercado"
          : "/",
      search: {
        ...filters,
        ...next,
      },
      resetScroll: false,
    })
  }

  function updateFilters(next: CatalogFilterValues) {
    setDraft({
      source,
      values: next,
    })

    if (
      next.collection !== appliedFilters.collection ||
      next.network !== appliedFilters.network
    ) {
      updateUrl({
        collection: next.collection,
        network: next.network,
        page: 1,
      })
    }
  }

  function applyFilters() {
    updateUrl({
      ...draftFilters,
      page: 1,
    })
  }

  function clearFilters() {
    setDraft(null)

    updateUrl({
      ...defaultFilters,
      page: 1,
    })
  }

  function changeTab(tab: CatalogTab) {
    updateUrl({
      tab,
      page: 1,
    })
  }

  function changeSort(sort: SortOption) {
    updateUrl({
      sort,
      page: 1,
    })
  }

  function changePage(nextPage: number) {
    if (
      nextPage >= 1 &&
      nextPage <= totalPages
    ) {
      updateUrl({
        page: nextPage,
      })
    }
  }

  // Barra mobile separada do catálogo.
  // Na Home, esta instância aparece antes do Hero.
  if (mode === "mobile-toolbar") {
    return (
      <div className="w-full lg:hidden">
        <div className="mx-auto w-full max-w-[1920px] px-5 pt-5 sm:px-8">
          {/* Busca e botão de filtros */}
          <div className="mb-6 flex items-center gap-2.5">
            <div className="flex h-[58px] min-w-0 flex-1 items-center gap-3 rounded-[16px] bg-[#281813] px-4">
              <Search
                aria-hidden="true"
                className="size-6 shrink-0 text-[#B9956C]"
                strokeWidth={2}
              />

              <input
                type="search"
                aria-label="Explorar coleções"
                placeholder="Explorar coleções"
                value={search}
                onChange={(event) =>
                  updateUrl({
                    search: event.target.value,
                    page: 1,
                  })
                }
                className="min-w-0 w-full bg-transparent font-mono text-[13px] text-[#F2E6D6] placeholder:text-[#B9956C] outline-none"
              />
            </div>

            <button
              type="button"
              aria-label={
                mobileFiltersOpen
                  ? "Fechar filtros do catálogo"
                  : "Abrir filtros do catálogo"
              }
              aria-expanded={mobileFiltersOpen}
              aria-controls="mobile-catalog-filters"
              onClick={() =>
                setMobileFiltersOpen((open) => !open)
              }
              className="flex size-[58px] shrink-0 items-center justify-center rounded-[16px] text-[#241612] transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kurio-primary"
              style={{
                background:
                  "linear-gradient(137.05deg, rgba(210, 138, 76, 0.45) -24.6%, #D28A4C 100%)",
              }}
            >
              {mobileFiltersOpen ? (
                <X
                  className="size-6"
                  strokeWidth={2}
                />
              ) : (
                <SlidersHorizontal
                  className="size-6"
                  strokeWidth={2}
                />
              )}
            </button>
          </div>

          {/* Painel mobile */}
          {mobileFiltersOpen && (
            <div
              id="mobile-catalog-filters"
              className="mb-6"
            >
              <CatalogFilters
                value={draftFilters}
                onChange={updateFilters}
                onApply={() => {
                  applyFilters()
                  setMobileFiltersOpen(false)
                }}
                onClear={clearFilters}
                facets={query.data?.facets}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Catálogo normal, abaixo do Hero na Home.
  return (
    <section
      id="mercado"
      aria-label="Catálogo de NFTs"
      className="scroll-mt-20 pb-16 pt-6 sm:pt-10"
    >
      <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-8 lg:px-12 xl:px-[85px]">
        <div className="grid items-start gap-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-8">
          {/* Sidebar desktop */}
          <div className="hidden lg:block">
            <CatalogFilters
              value={draftFilters}
              onChange={updateFilters}
              onApply={applyFilters}
              onClear={clearFilters}
              facets={query.data?.facets}
            />
          </div>

          {/* Área principal */}
          <div className="min-w-0">
            {/* Abas e ordenação */}
            <div className="mb-8 flex flex-col gap-4 border-b border-white/15 sm:flex-row sm:items-center sm:justify-between">
              <div
                role="group"
                aria-label="Visualização do catálogo"
                className="flex flex-wrap items-center gap-x-5 gap-y-2"
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={activeTab === tab.id}
                    onClick={() => changeTab(tab.id)}
                    className={[
                      "relative min-h-10 whitespace-nowrap font-mono text-xs transition-colors",
                      activeTab === tab.id
                        ? "font-bold text-kurio-primary"
                        : "text-foreground hover:text-kurio-primary",
                    ].join(" ")}
                  >
                    {tab.label}

                    {activeTab === tab.id && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-kurio-primary"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pb-3 sm:pb-0">
                <label
                  htmlFor="catalog-sort"
                  className="shrink-0 font-mono text-[11px] text-foreground"
                >
                  Ordenar por:
                </label>

                <select
                  id="catalog-sort"
                  value={sort}
                  onChange={(event) =>
                    changeSort(
                      event.target.value as SortOption
                    )
                  }
                  className="min-w-0 max-w-full rounded-sm border border-transparent bg-background px-2 py-2 font-mono text-xs text-foreground outline-none transition-colors hover:border-kurio-border-soft focus-visible:border-kurio-primary"
                >
                  <option value="recent">
                    Listados recentemente
                  </option>

                  <option value="price-asc">
                    Menor preço
                  </option>

                  <option value="price-desc">
                    Maior preço
                  </option>

                  <option value="name">
                    Nome (A–Z)
                  </option>
                </select>
              </div>
            </div>

            {/* Busca desktop preservada */}
            <input
              type="search"
              aria-label="Buscar no catálogo"
              placeholder="Buscar NFT"
              value={search}
              onChange={(event) =>
                updateUrl({
                  search: event.target.value,
                  page: 1,
                })
              }
              className="mb-6 hidden w-full rounded-sm border border-kurio-border bg-background px-3 py-2 font-mono text-xs text-foreground focus-visible:border-kurio-primary lg:block"
            />

            {/* Estado da consulta */}
            {query.isPending ? (
              <CatalogSkeleton />
            ) : (
              <RequestState
                error={query.error}
                retry={() => void query.refetch()}
              />
            )}

            {/* Grid de NFTs */}
            {!query.isPending &&
              !query.isError &&
              (visibleNfts.length > 0 ? (
                <div
                  aria-label="Resultados do catálogo"
                  className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 xl:grid-cols-3"
                >
                  {visibleNfts.map((nft) => (
                    <NftCard
                      key={nft.id}
                      nft={nft}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-72 flex-col items-center justify-center gap-4 bg-kurio-card px-6 text-center">
                  <h3 className="font-mono text-lg font-bold text-foreground">
                    Nenhum NFT encontrado
                  </h3>

                  <p className="max-w-sm font-mono text-xs leading-6 text-kurio-text-secondary">
                    Não encontramos NFTs com esses
                    critérios. Tente outra coleção,
                    rede ou faixa de preço.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded bg-kurio-primary px-5 py-2.5 font-mono text-xs font-bold text-kurio-ink hover:bg-kurio-primary-light"
                  >
                    Limpar filtros
                  </button>
                </div>
              ))}

            {/* Paginação */}
            {totalPages > 1 && (
              <nav
                aria-label="Paginação do catálogo"
                className="mt-12 flex justify-center gap-1.5 sm:justify-end"
              >
                <button
                  type="button"
                  aria-label="Página anterior"
                  disabled={currentPage === 1}
                  onClick={() =>
                    changePage(currentPage - 1)
                  }
                  className="flex size-9 items-center justify-center rounded-sm border border-kurio-border text-foreground transition-colors hover:border-kurio-primary disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="size-4" />
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    aria-label={`Ir para página ${pageNumber}`}
                    aria-current={
                      currentPage === pageNumber
                        ? "page"
                        : undefined
                    }
                    onClick={() =>
                      changePage(pageNumber)
                    }
                    className={[
                      "flex size-9 items-center justify-center rounded-sm border font-mono text-xs transition-colors",
                      currentPage === pageNumber
                        ? "border-kurio-primary bg-kurio-primary font-bold text-kurio-ink"
                        : "border-kurio-border text-foreground hover:border-kurio-primary",
                    ].join(" ")}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  aria-label="Próxima página"
                  disabled={
                    currentPage === totalPages
                  }
                  onClick={() =>
                    changePage(currentPage + 1)
                  }
                  className="flex size-9 items-center justify-center rounded-sm border border-kurio-border text-foreground transition-colors hover:border-kurio-primary disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight className="size-4" />
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
