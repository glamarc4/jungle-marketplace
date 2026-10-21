
import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"

import { MonkeyArtwork } from "@/components/home/MonkeyArtwork"
import { RelatedNfts } from "@/components/nft/RelatedNfts"
import {
    formatMicroEth,
    type CartItem,
} from "@/features/cart/cart-store"

import { useCartQuery, useCartBusy, useUpdateCartItem, useRemoveCartItem, useCoupon } from "@/hooks/use-api"
import { RequestState } from "@/components/RequestState"

function CartProductRow({ item }: { item: CartItem }) {
    const update = useUpdateCartItem()
    const remove = useRemoveCartItem()
    const busy = useCartBusy()
    const lineTotal = item.unitPriceMicroEth * item.quantity

    return (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-sm bg-kurio-card p-3 sm:grid-cols-[minmax(0,1.6fr)_minmax(90px,.65fr)_minmax(100px,.65fr)_minmax(90px,.75fr)_auto] sm:items-center sm:gap-4">
            <Link
                to="/nft/$nftId"
                params={{ nftId: item.nftId }}
                className="flex min-w-0 items-center gap-3"
            >
                <div className="size-14 shrink-0 overflow-hidden rounded-md sm:size-16">
                    <MonkeyArtwork variant={item.artwork} />
                </div>

                <div className="min-w-0">
                    <h2 className="truncate text-xs font-bold text-foreground sm:text-sm">
                        {item.name}
                    </h2>
                    <p className="mt-1 text-[11px] text-kurio-secondary">
                        ID do token: {item.tokenId}
                    </p>
                    <p className="mt-1 text-[10px] text-kurio-secondary">
                        Edição: {item.edition}
                    </p>
                </div>
            </Link>

            <div className="text-right text-xs font-bold text-kurio-primary sm:text-left">
                {formatMicroEth(item.unitPriceMicroEth)}
            </div>

            <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:justify-start">
                <span className="text-xs text-kurio-secondary sm:hidden">
                    Quantidade
                </span>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        aria-label={`Diminuir quantidade de ${item.name}`}
                        disabled={busy || item.quantity <= 1}
                        onClick={() =>
                            update.mutate({ key: item.key, quantity: item.quantity - 1 })
                        }
                        className="flex size-6 items-center justify-center rounded-full bg-kurio-primary text-kurio-ink disabled:opacity-40"
                    >
                        <Minus className="size-3" />
                    </button>

                    <output
                        aria-live="polite"
                        className="min-w-4 text-center text-xs text-foreground"
                    >
                        {item.quantity}
                    </output>

                    <button
                        type="button"
                        aria-label={`Aumentar quantidade de ${item.name}`}
                        disabled={busy || item.quantity >= 99}
                        onClick={() =>
                            update.mutate({ key: item.key, quantity: item.quantity + 1 })
                        }
                        className="flex size-6 items-center justify-center rounded-full bg-kurio-primary text-kurio-ink disabled:opacity-40"
                    >
                        <Plus className="size-3" />
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-start">
                <span className="text-xs text-kurio-secondary sm:hidden">
                    Total
                </span>
                <strong className="text-xs text-kurio-primary">
                    {formatMicroEth(lineTotal)}
                </strong>
            </div>

            <button
                type="button"
                disabled={busy}
                onClick={() => remove.mutate(item.key)}
                aria-label={`Remover ${item.name} do carrinho`}
                className="justify-self-end text-kurio-secondary transition-colors hover:text-red-400"
            >
                <Trash2 className="size-4" />
            </button>
            <RequestState error={update.error ?? remove.error} />
        </div>
    )
}

export function CartPage() {
    const query = useCartQuery()
    const busy = useCartBusy()
    const coupon = useCoupon()
    const items = query.data?.items ?? []
    const navigate = useNavigate()
    const [couponInput, setCouponInput] = useState("")
    const subtotal = query.data?.subtotalMicroEth ?? 0
    const discount = query.data?.discountMicroEth ?? 0
    const networkFee = query.data?.networkFeeMicroEth ?? 0
    const total = query.data?.totalMicroEth ?? 0
    const needsReview = (query.data?.unavailableItems?.length ?? 0) > 0
    const couponMessage = query.data?.coupon ? "Cupom KURIO10 aplicado: 10% de desconto." : ""
    function applyCoupon() { coupon.mutate(couponInput.trim() ? couponInput : null) }

    if (query.isPending || query.isError) return <RequestState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />

    return (
        <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 font-mono sm:px-6 lg:px-8">
            <nav
                aria-label="Caminho de navegação"
                className="mb-3 text-xs font-bold text-foreground"
            >
                <Link to="/" className="hover:text-kurio-primary">
                    Início
                </Link>
                <span className="mx-2 text-kurio-secondary">/</span>
                <Link to="/mercado" className="hover:text-kurio-primary">
                    Mercado
                </Link>
                <span className="mx-2 text-kurio-secondary">/</span>
                <span>Carrinho</span>
            </nav>

            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.9fr)_minmax(280px,.8fr)] lg:gap-14">
                <section aria-label="Itens do carrinho" className="min-w-0">
                    {needsReview && <p role="alert" className="mb-3 text-xs text-red-400">Há edições indisponíveis. Revise os itens: {items.filter(item => query.data?.unavailableItems?.includes(item.key)).map(item => `${item.name} (${item.edition})`).join(", ")}.</p>}
                    <div className="mb-2 hidden grid-cols-[minmax(0,1.6fr)_minmax(90px,.65fr)_minmax(100px,.65fr)_minmax(90px,.75fr)_auto] gap-4 border-b border-kurio-border pb-2 text-xs font-bold text-foreground sm:grid">
                        <span>NFTs</span>
                        <span>Preço</span>
                        <span>Edições</span>
                        <span>Total</span>
                        <span className="w-4" />
                    </div>

                    {items.length > 0 ? (
                        <div className="space-y-2">
                            {items.map((item) => (
                                <CartProductRow key={item.key} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-60 flex-col items-center justify-center gap-4 rounded-md border border-kurio-border p-6 text-center">
                            <ShoppingBag className="size-10 text-kurio-primary" />
                            <h1 className="text-lg font-bold text-foreground">
                                Seu carrinho está vazio
                            </h1>
                            <p className="text-xs text-kurio-secondary">
                                Explore a coleção e encontre seu próximo NFT.
                            </p>
                            <Link
                                to="/mercado"
                                className="rounded bg-kurio-primary px-5 py-2 text-xs font-bold text-kurio-ink"
                            >
                                Explorar NFTs
                            </Link>
                        </div>
                    )}
                </section>

                <aside aria-labelledby="cart-summary-title">
                    <h2
                        id="cart-summary-title"
                        className="border-b border-kurio-border pb-2 text-sm font-bold text-foreground"
                    >
                        Resumo da carteira
                    </h2>

                    <div className="mt-5">
                        <label
                            htmlFor="cart-coupon"
                            className="mb-2 block text-xs font-bold text-foreground"
                        >
                            Código promocional
                        </label>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault()
                                applyCoupon()
                            }}
                            className="flex"
                        >
                            <input
                                id="cart-coupon"
                                type="text"
                                value={couponInput}
                                onChange={(event) =>
                                    setCouponInput(event.target.value)
                                }
                                placeholder="Digite o código promocional..."
                                className="min-w-0 flex-1 rounded-l-sm border border-kurio-border bg-transparent px-3 py-2 text-xs text-foreground outline-none placeholder:text-kurio-secondary focus:border-kurio-primary"
                            />

                            <button
                                type="submit"
                                disabled={busy}
                                className="rounded-r-sm bg-kurio-primary px-4 py-2 text-xs font-bold text-kurio-ink"
                            >
                                Aplicar
                            </button>
                        </form>

                        <RequestState error={coupon.error} />
                        {couponMessage && (
                            <p
                                role="status"
                                className="mt-2 text-[11px] text-kurio-primary"
                            >
                                {couponMessage}
                            </p>
                        )}
                    </div>

                    <dl className="mt-6 space-y-3 text-xs text-foreground">
                        <div className="flex justify-between gap-3">
                            <dt>Subtotal</dt>
                            <dd>{formatMicroEth(subtotal)}</dd>
                        </div>

                        <div className="flex justify-between gap-3">
                            <dt>Desconto do lançamento</dt>
                            <dd>
                                {discount > 0
                                    ? `(-) ${formatMicroEth(discount)}`
                                    : "(-) 0.00 ETH"}
                            </dd>
                        </div>

                        <div className="flex justify-between gap-3">
                            <dt>Taxa de rede</dt>
                            <dd>{formatMicroEth(networkFee, 3)}</dd>
                        </div>
                    </dl>

                    <p className="mt-2 text-right text-[10px] text-kurio-primary">
                        Taxa estimada
                    </p>

                    <div className="mt-5 flex justify-between gap-3 border-t border-kurio-border pt-4 text-sm font-bold">
                        <span className="text-foreground">Total</span>
                        <strong className="text-kurio-primary">
                            {formatMicroEth(total, 3)}
                        </strong>
                    </div>

                    <button
                        type="button"
                        disabled={busy || needsReview || items.length === 0}
                        onClick={() => {
                            void navigate({ to: "/checkout" })
                        }}
                        className="mt-5 w-full rounded-sm bg-kurio-primary px-4 py-3 text-xs font-bold text-kurio-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Conectar e finalizar
                    </button>

                    <Link
                        to="/mercado"
                        className="mt-3 block text-center text-xs text-kurio-primary hover:underline"
                    >
                        Continuar explorando
                    </Link>

                    <p className="mt-3 text-center text-[10px] leading-5 text-kurio-secondary">
                        Compra de demonstração. Nenhuma transação blockchain será realizada.
                    </p>
                </aside>
            </div>

            <div className="mt-20 sm:mt-24">
                <RelatedNfts
                    currentNftId=""
                    title="Colecionadores também viram"
                />
            </div>
        </div>
    )
}
