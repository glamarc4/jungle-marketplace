
import { useEffect, useRef } from "react"
import { X } from "lucide-react"

import { MonkeyArtwork } from "@/components/home/MonkeyArtwork"
import {
  formatMicroEth,
} from "@/features/cart/cart-store"

import type { Order } from "@/domain/api"

type OrderConfirmationModalProps = {
  order: Order
  onClose: () => void
}

export function OrderConfirmationModal({
  order,
  onClose,
}: OrderConfirmationModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previouslyFocused = document.activeElement

    document.body.style.overflow = "hidden"
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus()
      }
    }
  }, [onClose])

  const subtotal = order.subtotalMicroEth

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto overscroll-contain bg-black/80 px-3 py-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-confirmation-title"
        aria-describedby="order-confirmation-description"
        className="relative mx-auto flex max-h-[calc(100dvh-32px)] w-full max-w-[578px] flex-col overflow-y-auto overscroll-contain rounded-md border border-kurio-border bg-kurio-card font-mono text-foreground shadow-2xl"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar confirmação"
          className="absolute right-4 top-4 z-10 text-kurio-primary transition-opacity hover:opacity-70"
        >
          <X className="size-7" />
        </button>

        <div className="flex flex-col items-center px-5 pb-4 pt-6 text-center sm:px-8">
          <div className="flex size-20 flex-col items-center justify-center rounded-lg border-[3px] border-kurio-primary text-kurio-primary">
            <span className="text-2xl font-black leading-none">
              THANK
            </span>
            <span className="text-2xl font-black leading-none">
              YOU
            </span>
          </div>

          <h2
            id="order-confirmation-title"
            className="mt-4 text-lg font-bold text-kurio-text-secondary sm:text-xl"
          >
            Seus NFTs foram registrados no pedido
          </h2>

          <p
            id="order-confirmation-description"
            className="mt-3 text-xs leading-5 text-kurio-secondary"
          >
            Pedido de demonstração confirmado. Nenhuma transação
            blockchain foi realizada.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-y-5 border-y border-kurio-primary bg-kurio-raised px-5 py-6 sm:grid-cols-4 sm:px-8">
          <div className="border-r border-kurio-primary/50 pr-3">
            <p className="text-xs font-bold sm:text-sm">
              ID do pedido
            </p>
            <p className="mt-1 break-all text-xs text-kurio-text-secondary">
              {order.orderId}
            </p>
          </div>

          <div className="pl-3 sm:border-r sm:border-kurio-primary/50">
            <p className="text-xs font-bold sm:text-sm">
              Data
            </p>
            <p className="mt-1 text-xs text-kurio-text-secondary">
              {order.date}
            </p>
          </div>

          <div className="border-r border-kurio-primary/50 pr-3 sm:pl-3">
            <p className="text-xs font-bold sm:text-sm">
              Total
            </p>
            <p className="mt-1 text-xs text-kurio-text-secondary">
              {formatMicroEth(order.totalMicroEth, 3)}
            </p>
          </div>

          <div className="pl-3">
            <p className="text-xs font-bold sm:text-sm">
              Carteira
            </p>
            <p className="mt-1 text-xs text-kurio-text-secondary">
              {order.wallet}
              <span className="mt-1 block break-all text-[10px]">{order.walletAddress} ({order.network})</span>
            </p>
          </div>
        </div>

        <div className="px-5 pb-10 pt-7 sm:px-10">
          <h3 className="text-lg font-bold sm:text-xl">
            Detalhes do pedido
          </h3>

          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_60px_100px] gap-3 border-b border-kurio-border pb-3 text-xs font-bold sm:grid-cols-[minmax(0,1fr)_90px_150px] sm:text-sm">
            <span>NFTs</span>
            <span>Edições</span>
            <span className="text-right">Subtotal</span>
          </div>

          <div className="mt-4 space-y-4">
            {order.items.map((item) => (
              <div
                key={item.key}
                className="grid grid-cols-[minmax(0,1fr)_60px_100px] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_90px_150px]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="size-14 shrink-0 overflow-hidden rounded-md sm:size-20">
                    <MonkeyArtwork variant={item.artwork} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold sm:text-sm">
                      {item.name}
                    </p>
                    <p className="mt-1 truncate text-[10px] text-kurio-secondary sm:text-xs">
                      ID do token: {item.tokenId}
                    </p>
                  </div>
                </div>

                <span className="text-center text-xs text-kurio-text-secondary">
                  (x {item.quantity})
                </span>

                <strong className="text-right text-xs text-kurio-primary sm:text-base">
                  {formatMicroEth(
                    item.unitPriceMicroEth * item.quantity,
                  )}
                </strong>
              </div>
            ))}
          </div>

          <div className="ml-auto mt-6 max-w-sm space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-kurio-text-secondary">
                Subtotal
              </span>
              <span>{formatMicroEth(subtotal)}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-kurio-text-secondary">
                Taxa de rede
              </span>
              <span>
                {formatMicroEth(
                  order.networkFeeMicroEth,
                  3,
                )}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span>Desconto</span><span>(-) {formatMicroEth(order.discountMicroEth)}</span>
            </div>
            <div className="flex justify-between gap-4 text-base font-bold">
              <span>Total</span>
              <span className="text-kurio-primary">
                {formatMicroEth(order.totalMicroEth, 3)}
              </span>
            </div>
          </div>

          <div className="mt-7 border-t border-kurio-border pt-6 text-center">
            <p className="mx-auto max-w-2xl text-xs leading-6 text-kurio-text-secondary sm:text-sm">
              Este pedido é uma demonstração do fluxo da Kurio.
              Os NFTs ainda não foram transferidos para uma
              carteira e não existe transação registrada na rede.
            </p>

              <button
                type="button"
                disabled
                title="Disponível após uma transação real"
                className="mt-6 rounded-md bg-kurio-primary px-6 py-3 text-sm font-bold text-kurio-ink opacity-50"
              >
                Ver no Etherscan
              </button>
          </div>
        </div>
      </div>
    </div>
  )
}
