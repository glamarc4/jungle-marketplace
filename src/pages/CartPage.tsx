
import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import {
    ChevronLeft,
    Minus,
    Plus,
    ShoppingBag,
    Trash2,
} from "lucide-react"

import { MonkeyArtwork } from "@/components/home/MonkeyArtwork"
import { RelatedNfts } from "@/components/nft/RelatedNfts"
import {
    formatMicroEth,
    type CartItem,
} from "@/features/cart/cart-store"
import {
    useCartQuery,
    useCartBusy,
    useUpdateCartItem,
    useRemoveCartItem,
    useCoupon,
} from "@/hooks/use-api"
import { RequestState } from "@/components/RequestState"

function CartProductRow({ item }: { item: CartItem }) {
    const update = useUpdateCartItem()
    const remove = useRemoveCartItem()
    const busy = useCartBusy()

    const lineTotal = item.unitPriceMicroEth * item.quantity

    return (
        <article className="relative rounded-[22px] border border-kurio-border-soft bg-kurio-card p-4 transition-colors hover:border-kurio-primary/40 sm:rounded-xl">
            {/* Layout mobile */}
            <div className="flex gap-3 sm:hidden">
                <Link
                    to="/nft/$nftId"
                    params={{ nftId: item.nftId }}
                    className="size-[100px] shrink-0 overflow-hidden rounded-[15px] bg-kurio-raised"
                >
                    <MonkeyArtwork variant={item.artwork} />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                        <Link
                            to="/nft/$nftId"
                            params={{ nftId: item.nftId }}
                            className="min-w-0"
                        >
                            <h2 className="line-clamp-2 text-[15px] font-bold leading-5 text-foreground">
                                {item.name}
                            </h2>
                        </Link>

                        <button
                            type="button"
                            onClick={() => remove.mutate(item.key)}
                            disabled={busy}
                            aria-label={`Remover ${item.name} do carrinho`}
                            className="shrink-0 p-1 text-[#C8A981] disabled:opacity-40"
                        >
                            <Trash2 size={17} aria-hidden="true" />
                        </button>
                    </div>

                    <p className="mt-1 text-[11px] text-[#B99870]">
                        Edição: {item.edition}
                    </p>

                    <p className="mt-1 text-[11px] text-[#B99870]">
                        Token: {item.tokenId}
                    </p>

                    <strong className="mt-auto pt-2 text-[16px] font-bold text-[#D28A4C]">
                        {formatMicroEth(lineTotal)}
                    </strong>
                </div>
            </div>

            {/* Quantidade mobile */}
            <div className="mt-4 flex items-center justify-between border-t border-[#4A291D] pt-3 sm:hidden">
                <span className="text-xs text-[#C8A981]">
                    Quantidade
                </span>

                <div
                    role="group"
                    aria-label={`Quantidade de ${item.name}`}
                    className="inline-flex items-center gap-3"
                >
                    <button
                        type="button"
                        disabled={busy || item.quantity <= 1}
                        onClick={() =>
                            update.mutate({
                                key: item.key,
                                quantity: item.quantity - 1,
                            })
                        }
                        aria-label={`Diminuir quantidade de ${item.name}`}
                        className="flex size-8 items-center justify-center rounded-full bg-[#D28A4C] text-[#241612] disabled:opacity-40"
                    >
                        <Minus size={16} aria-hidden="true" />
                    </button>

                    <output
                        aria-live="polite"
                        className="min-w-4 text-center text-sm font-bold text-foreground"
                    >
                        {item.quantity}
                    </output>

                    <button
                        type="button"
                        disabled={busy || item.quantity >= 99}
                        onClick={() =>
                            update.mutate({
                                key: item.key,
                                quantity: item.quantity + 1,
                            })
                        }
                        aria-label={`Aumentar quantidade de ${item.name}`}
                        className="flex size-8 items-center justify-center rounded-full bg-[#D28A4C] text-[#241612] disabled:opacity-40"
                    >
                        <Plus size={16} aria-hidden="true" />
                    </button>
                </div>
            </div>

            {/* Layout desktop preservado */}
            <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(90px,.65fr)_minmax(100px,.65fr)_minmax(90px,.75fr)_auto] items-center gap-4 sm:grid">
                <Link
                    to="/nft/$nftId"
                    params={{ nftId: item.nftId }}
                    className="group flex min-w-0 items-center gap-3"
                >
                    <div className="size-16 shrink-0 overflow-hidden rounded-lg border border-kurio-border-soft bg-kurio-raised">
                        <MonkeyArtwork variant={item.artwork} />
                    </div>

                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-bold text-foreground">
                            {item.name}
                        </h2>

                        <p className="mt-2 text-[11px] text-kurio-text-secondary">
                            ID do token:{" "}
                            <span className="text-kurio-primary">
                                {item.tokenId}
                            </span>
                        </p>

                        <p className="mt-1 text-[11px] text-kurio-text-secondary">
                            Edição:{" "}
                            <span className="text-kurio-primary">
                                {item.edition}
                            </span>
                        </p>
                    </div>
                </Link>

                <div className="text-xs font-bold text-kurio-primary">
                    {formatMicroEth(item.unitPriceMicroEth)}
                </div>

                <div
                    role="group"
                    aria-label={`Quantidade de ${item.name}`}
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-kurio-border-soft bg-background/40 p-1"
                >
                    <button
                        type="button"
                        disabled={busy || item.quantity <= 1}
                        onClick={() =>
                            update.mutate({
                                key: item.key,
                                quantity: item.quantity - 1,
                            })
                        }
                        aria-label={`Diminuir quantidade de ${item.name}`}
                        className="flex size-7 items-center justify-center rounded-full bg-kurio-primary text-kurio-ink disabled:opacity-40"
                    >
                        <Minus size={14} aria-hidden="true" />
                    </button>

                    <output
                        aria-live="polite"
                        className="min-w-4 text-center text-xs font-bold text-foreground"
                    >
                        {item.quantity}
                    </output>

                    <button
                        type="button"
                        disabled={busy || item.quantity >= 99}
                        onClick={() =>
                            update.mutate({
                                key: item.key,
                                quantity: item.quantity + 1,
                            })
                        }
                        aria-label={`Aumentar quantidade de ${item.name}`}
                        className="flex size-7 items-center justify-center rounded-full bg-kurio-primary text-kurio-ink disabled:opacity-40"
                    >
                        <Plus size={14} aria-hidden="true" />
                    </button>
                </div>

                <strong className="text-xs font-bold text-kurio-primary">
                    {formatMicroEth(lineTotal)}
                </strong>

                <button
                    type="button"
                    disabled={busy}
                    onClick={() => remove.mutate(item.key)}
                    aria-label={`Remover ${item.name} do carrinho`}
                    className="rounded-md p-2 text-kurio-secondary hover:text-red-400 disabled:opacity-40"
                >
                    <Trash2 size={16} aria-hidden="true" />
                </button>
            </div>

            {(update.error || remove.error) && (
                <div className="mt-3">
                    <RequestState
                        error={update.error ?? remove.error}
                    />
                </div>
            )}
        </article>
    )
}

export function CartPage() {
    const query = useCartQuery()
    const busy = useCartBusy()
    const coupon = useCoupon()
    const navigate = useNavigate()

    const [couponInput, setCouponInput] = useState("")

    const items = query.data?.items ?? []

    const subtotal = query.data?.subtotalMicroEth ?? 0
    const discount = query.data?.discountMicroEth ?? 0
    const networkFee = query.data?.networkFeeMicroEth ?? 0
    const total = query.data?.totalMicroEth ?? 0

    const needsReview =
        (query.data?.unavailableItems?.length ?? 0) > 0

    const couponMessage = query.data?.coupon
        ? "Cupom KURIO10 aplicado: 10% de desconto."
        : ""

    const canCheckout =
        !busy && !needsReview && items.length > 0

    function applyCoupon() {
        coupon.mutate(
            couponInput.trim() ? couponInput.trim() : null,
        )
    }

    function handleCheckout() {
        if (!canCheckout) return
        void navigate({ to: "/checkout" })
    }

    if (query.isPending || query.isError) {
        return (
            <RequestState
                pending={query.isPending}
                error={query.error}
                retry={() => void query.refetch()}
            />
        )
    }

    return (
        <div className="mx-auto w-full max-w-7xl px-5 pb-[450px] pt-5 font-mono sm:px-6 sm:pb-20 sm:pt-6 lg:px-8">
            {/* Cabeçalho mobile */}
            <div className="mb-7 flex items-center gap-4 md:hidden">
                <button
                    type="button"
                    aria-label="Voltar"
                    onClick={() => {
                        if (window.history.length > 1) {
                            window.history.back()
                        } else {
                            void navigate({ to: "/mercado" })
                        }
                    }}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#4A291D] bg-[#301C16] text-[#C8A981]"
                >
                    <ChevronLeft size={23} aria-hidden="true" />
                </button>

                <h1 className="text-[20px] font-bold text-foreground">
                    Carrinho de NFTs
                </h1>
            </div>

            {/* Breadcrumb desktop */}
            <nav
                aria-label="Caminho de navegação"
                className="mb-6 hidden flex-wrap items-center gap-2 text-xs font-bold md:flex"
            >
                <Link
                    to="/"
                    className="text-foreground hover:text-kurio-primary"
                >
                    Início
                </Link>

                <span
                    aria-hidden="true"
                    className="text-kurio-text-secondary"
                >
                    /
                </span>

                <Link
                    to="/mercado"
                    className="text-foreground hover:text-kurio-primary"
                >
                    Mercado
                </Link>

                <span
                    aria-hidden="true"
                    className="text-kurio-text-secondary"
                >
                    /
                </span>

                <span
                    aria-current="page"
                    className="text-kurio-text-secondary"
                >
                    Carrinho
                </span>
            </nav>

            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.9fr)_minmax(280px,.8fr)] lg:gap-12">
                {/* Lista de NFTs */}
                <section
                    aria-label="Itens do carrinho"
                    className="min-w-0"
                >
                    {needsReview && (
                        <p
                            role="alert"
                            className="mb-4 text-xs leading-5 text-red-400"
                        >
                            Há edições indisponíveis. Revise os itens:{" "}
                            {items
                                .filter((item) =>
                                    query.data?.unavailableItems?.includes(
                                        item.key,
                                    ),
                                )
                                .map(
                                    (item) =>
                                        `${item.name} (${item.edition})`,
                                )
                                .join(", ")}
                            .
                        </p>
                    )}

                    <div className="mb-3 hidden grid-cols-[minmax(0,1.6fr)_minmax(90px,.65fr)_minmax(100px,.65fr)_minmax(90px,.75fr)_auto] gap-4 border-b border-kurio-border-soft pb-3 text-xs font-bold text-foreground sm:grid">
                        <span>NFTs</span>
                        <span>Preço</span>
                        <span>Edições</span>
                        <span>Total</span>
                        <span className="w-4" />
                    </div>

                    {items.length > 0 ? (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <CartProductRow
                                    key={item.key}
                                    item={item}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-60 flex-col items-center justify-center gap-4 rounded-xl border border-kurio-border-soft bg-kurio-card p-6 text-center">
                            <ShoppingBag
                                className="size-10 text-kurio-primary"
                                aria-hidden="true"
                            />

                            <h2 className="text-lg font-bold text-foreground">
                                Seu carrinho está vazio
                            </h2>

                            <p className="text-xs leading-5 text-kurio-text-secondary">
                                Explore a coleção e encontre seu próximo NFT.
                            </p>

                            <Link
                                to="/mercado"
                                className="rounded-md bg-kurio-primary px-5 py-2.5 text-xs font-bold text-kurio-ink"
                            >
                                Explorar NFTs
                            </Link>
                        </div>
                    )}
                </section>

                {/* Resumo desktop */}
                <aside
                    aria-labelledby="cart-summary-title"
                    className="hidden min-w-0 rounded-xl p-5 sm:p-6 md:block"
                >
                    <h2
                        id="cart-summary-title"
                        className="m-0 border-b border-kurio-border-soft pb-4 text-lg font-bold tracking-tight text-foreground"
                    >
                        Resumo da carteira
                    </h2>

                    <div className="mt-6">
                        <label
                            htmlFor="cart-coupon"
                            className="mb-3 block text-xs font-bold text-foreground"
                        >
                            Código promocional
                        </label>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault()
                                applyCoupon()
                            }}
                            className="flex min-w-0 overflow-hidden rounded-lg border border-kurio-border-soft bg-background/50 focus-within:border-kurio-primary"
                        >
                            <input
                                id="cart-coupon"
                                type="text"
                                value={couponInput}
                                onChange={(event) =>
                                    setCouponInput(event.target.value)
                                }
                                placeholder="Digite o código promocional..."
                                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-xs text-foreground outline-none placeholder:text-kurio-secondary"
                            />

                            <button
                                type="submit"
                                disabled={busy}
                                className="shrink-0 bg-kurio-primary px-4 py-3 text-xs font-bold text-kurio-ink disabled:opacity-40"
                            >
                                Aplicar
                            </button>
                        </form>

                        <RequestState error={coupon.error} />

                        {couponMessage && (
                            <p
                                role="status"
                                className="mt-3 text-[11px] leading-5 text-kurio-primary"
                            >
                                {couponMessage}
                            </p>
                        )}
                    </div>

                    <dl className="mt-7 space-y-4 text-xs">
                        <div className="flex items-center justify-between gap-4">
                            <dt className="text-kurio-text-secondary">
                                Subtotal
                            </dt>
                            <dd className="font-medium tabular-nums text-foreground">
                                {formatMicroEth(subtotal)}
                            </dd>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <dt className="text-kurio-text-secondary">
                                Desconto do lançamento
                            </dt>
                            <dd className="font-medium tabular-nums text-foreground">
                                {discount > 0
                                    ? `(-) ${formatMicroEth(discount)}`
                                    : "(-) 0.00 ETH"}
                            </dd>
                        </div>

                        <div className="flex items-start justify-between gap-4">
                            <dt className="text-kurio-text-secondary">
                                Taxa de rede
                            </dt>
                            <dd className="text-right">
                                <span className="block font-medium tabular-nums text-foreground">
                                    {formatMicroEth(networkFee, 3)}
                                </span>
                                <span className="mt-1 block text-[10px] text-kurio-secondary">
                                    Taxa estimada
                                </span>
                            </dd>
                        </div>
                    </dl>

                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-kurio-border-soft pt-5">
                        <span className="text-sm font-bold text-foreground">
                            Total
                        </span>
                        <strong className="text-base font-bold tabular-nums text-kurio-primary">
                            {formatMicroEth(total, 3)}
                        </strong>
                    </div>

                    <button
                        type="button"
                        disabled={!canCheckout}
                        onClick={handleCheckout}
                        className="mt-6 w-full rounded-lg bg-kurio-primary px-4 py-3.5 text-xs font-bold text-kurio-ink disabled:opacity-40"
                    >
                        Conectar e finalizar
                    </button>

                    <Link
                        to="/mercado"
                        className="mt-4 block text-center text-xs font-bold text-kurio-primary"
                    >
                        Continuar explorando
                    </Link>

                    <p className="mt-4 text-center text-[10px] leading-5 text-kurio-text-secondary">
                        Compra de demonstração. Nenhuma transação blockchain
                        será realizada.
                    </p>
                </aside>
            </div>

            {/* Bottom sheet mobile */}
            <aside
                aria-label="Resumo do carrinho"
                className="fixed inset-x-0 bottom-0 z-50 rounded-t-[36px] bg-[#241612] px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-6 shadow-[0_-10px_30px_#0A060473] md:hidden"
            >
                <div className="mx-auto max-w-[480px]">
                    {/* Cupom */}
                    <form
                        onSubmit={(event) => {
                            event.preventDefault()
                            applyCoupon()
                        }}
                        className="flex h-[52px] min-w-0 overflow-hidden rounded-full border border-[#3F2319] bg-[#301C16] shadow-[0px_6px_20px_0px_#0A060473]"
                    >
                        <input
                            type="text"
                            aria-label="Código promocional"
                            value={couponInput}
                            onChange={(event) =>
                                setCouponInput(event.target.value)
                            }
                            placeholder="Digite o código promocional..."
                            className="min-w-0 flex-1 bg-transparent px-4 text-[12px] text-foreground outline-none placeholder:text-[#B99870]"
                        />

                        <button
                            type="submit"
                            disabled={busy}
                            className="shrink-0 rounded-full bg-[linear-gradient(93.11deg,rgba(210,138,76,0.54)_-0.94%,#D28A4C_105.02%)] px-5 text-[14px] font-bold text-white disabled:opacity-40"

                        >
                            Aplicar
                        </button>
                    </form>

                    {coupon.error && (
                        <div className="mt-2">
                            <RequestState error={coupon.error} />
                        </div>
                    )}

                    {couponMessage && (
                        <p
                            role="status"
                            className="mt-2 text-[11px] text-[#D28A4C]"
                        >
                            {couponMessage}
                        </p>
                    )}

                    {/* Valores */}
                    <dl className="mt-5 space-y-4 text-[13px] text-foreground">
                        <div className="flex items-center justify-between gap-3">
                            <dt>Subtotal</dt>
                            <dd className="font-medium tabular-nums">
                                {formatMicroEth(subtotal)}
                            </dd>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <dt>Desconto do lançamento</dt>
                            <dd className="font-medium tabular-nums">
                                {discount > 0
                                    ? `(-) ${formatMicroEth(discount)}`
                                    : "(-) 0.00 ETH"}
                            </dd>
                        </div>

                        <div className="flex items-start justify-between gap-3">
                            <dt>Taxa de rede</dt>
                            <dd className="text-right">
                                <span className="block font-medium tabular-nums">
                                    {formatMicroEth(networkFee, 3)}
                                </span>
                                <span className="mt-1 block text-[11px] text-[#D28A4C]">
                                    Taxa estimada
                                </span>
                            </dd>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                            <dt className="text-[16px] font-bold">
                                Total
                            </dt>
                            <dd className="text-[20px] font-bold tabular-nums text-[#D28A4C]">
                                {formatMicroEth(total, 3)}
                            </dd>
                        </div>
                    </dl>

                    {/* Checkout */}
                    <button
                        type="button"
                        disabled={!canCheckout}
                        onClick={handleCheckout}
                        className="mt-7 flex h-[60px] w-full items-center justify-center rounded-full bg-[linear-gradient(93.21deg,#D28A4C_-3.96%,rgba(210,138,76,0.8)_121.97%)] px-4 text-[15px] font-bold text-[#241612] disabled:cursor-not-allowed disabled:opacity-40"

                    >
                        Conectar e finalizar
                    </button>
                </div>
            </aside>

            {/* Recomendações */}
            <div className="mt-20 hidden sm:mt-24 md:block">
                <RelatedNfts
                    currentNftId=""
                    title="Colecionadores também viram"
                />
            </div>
        </div>
    )
}
