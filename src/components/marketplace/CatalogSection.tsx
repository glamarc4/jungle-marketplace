
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { PAGE_SIZE } from "@/data/mock-nfts"
import { defaultFilters, type CatalogFilterValues } from "@/domain/catalog"
import { CatalogFilters } from "./CatalogFilters"
import { useNfts } from "@/hooks/use-api"
import { RequestState } from "@/components/RequestState"
import { NftCard } from "./NftCard"

type CatalogTab = "all" | "new" | "trending"
type SortOption = "recent" | "price-asc" | "price-desc" | "name"

const tabs: { id: CatalogTab; label: string }[] = [
    { id: "all", label: "Todos os NFTs" },
    { id: "new", label: "Novos lançamentos" },
    { id: "trending", label: "Em alta" },
]

export function CatalogSection() {
    const [draftFilters, setDraftFilters] =
        useState<CatalogFilterValues>({ ...defaultFilters })

    const [appliedFilters, setAppliedFilters] =
        useState<CatalogFilterValues>({ ...defaultFilters })

    const [activeTab, setActiveTab] =
        useState<CatalogTab>("all")

    const [sort, setSort] =
        useState<SortOption>("recent")

    const [page, setPage] = useState(1)

    const [search, setSearch] = useState("")
    const query = useNfts({ ...appliedFilters, tab: activeTab, sort, page, pageSize: PAGE_SIZE, search })
    const totalPages = query.data?.totalPages ?? 1
    const currentPage = page
    const visibleNfts = query.data?.items ?? []
    const total = query.data?.total ?? 0

    function updateFilters(next: CatalogFilterValues) {
        setDraftFilters(next)

        const collectionChanged =
            next.collection !== draftFilters.collection

        const networkChanged =
            next.network !== draftFilters.network

        if (collectionChanged || networkChanged) {
            setAppliedFilters((current) => ({
                ...current,
                collection: next.collection,
                network: next.network,
            }))

            setPage(1)
        }
    }

    function applyFilters() {
        setAppliedFilters({ ...draftFilters })
        setPage(1)
    }

    function clearFilters() {
        const cleared = { ...defaultFilters }

        setDraftFilters(cleared)
        setAppliedFilters(cleared)
        setPage(1)
    }

    function changeTab(nextTab: CatalogTab) {
        setActiveTab(nextTab)
        setPage(1)
    }

    function changeSort(nextSort: SortOption) {
        setSort(nextSort)
        setPage(1)
    }

    function changePage(nextPage: number) {
        if (nextPage < 1 || nextPage > totalPages) {
            return
        }

        setPage(nextPage)
    }

    return (
        <section
            id="mercado"
            aria-label="Catálogo de NFTs"
            className="scroll-mt-20 pb-16 pt-6 sm:pt-10"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-start gap-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-8">
                    {/* Sidebar */}
                    <CatalogFilters
                        value={draftFilters}
                        onChange={updateFilters}
                        onApply={applyFilters}
                        onClear={clearFilters}
                        facets={query.data?.facets}
                    />

                    {/* Área principal */}
                    <div className="min-w-0">
                        <div className="mb-5 flex flex-col gap-4 border-b border-kurio-border sm:flex-row sm:items-center sm:justify-between">
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

                        <input aria-label="Buscar no catálogo" type="search" value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder="Buscar NFTs..." className="mb-4 w-full rounded-sm border border-kurio-border bg-transparent px-3 py-2 font-mono text-xs" />
                        <RequestState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
                        {/* Quantidade de resultados */}
                        <p
                            className="mb-4 font-mono text-xs text-kurio-text-secondary"
                            aria-live="polite"
                        >
                            {total}{" "}
                            {total === 1
                                ? "NFT encontrado"
                                : "NFTs encontrados"}
                        </p>

                        {/* Grid */}
                        {!query.isPending && !query.isError && (visibleNfts.length > 0 ? (
                            <div
                                aria-label="Resultados do catálogo"
                                className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10 xl:grid-cols-3"
                            >
                                {visibleNfts.map((nft) => (
                                    <NftCard key={nft.id} nft={nft} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex min-h-72 flex-col items-center justify-center gap-4 bg-kurio-card px-6 text-center">
                                <h3 className="font-mono text-lg font-bold text-foreground">
                                    Nenhum NFT encontrado
                                </h3>

                                <p className="max-w-sm font-mono text-xs leading-6 text-kurio-text-secondary">
                                    Não encontramos NFTs com esses critérios.
                                    Tente outra coleção, rede ou faixa de preço.
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
                                                : "border-kurio-border text-foreground hover:border-kurio-primary hover:text-kurio-primary",
                                        ].join(" ")}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    aria-label="Próxima página"
                                    disabled={currentPage === totalPages}
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
