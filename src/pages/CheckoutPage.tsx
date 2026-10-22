import { useState, useRef } from "react"
import { Link, Navigate, useNavigate } from "@tanstack/react-router"

import { CollectorForm } from "@/components/checkout/CollectorForm"

import {
  CheckoutSummary,
  type CheckoutWallet,
} from "@/components/checkout/CheckoutSummary"

import {
  useCartQuery,
  useCreateOrder,
  useProfile,
  useWallets,
  useSession,
} from "@/hooks/use-api"

import {
  initialCollectorValues,
  type CollectorFormValues,
} from "@/domain/collector"

import { cartSignature } from "@/domain/api"
import { errorMessage, isUnauthorized } from "@/api/client"
import { RequestState } from "@/components/RequestState"

export function CheckoutPage() {
  const navigate = useNavigate()
  const query = useCartQuery()
  const profile = useProfile()
  const wallets = useWallets()
  const session = useSession()
  const create = useCreateOrder()

  const [draft, setDraft] = useState<CollectorFormValues | null>(null)

  const primary = wallets.data?.find((wallet) => wallet.primary)

  const collector: CollectorFormValues = draft ?? {
    ...initialCollectorValues,
    displayName: profile.data?.displayName ?? "",
    username: profile.data?.username ?? "",
    email: profile.data?.email ?? session.data?.email ?? "",
    profileName: primary?.profileName ?? "",
    network: primary?.network ?? "",
    walletAddress: primary?.address ?? "",
    secondaryWallet:
      primary?.secondaryAddress ||
      wallets.data?.find(
        (wallet) =>
          !wallet.primary && wallet.network === primary?.network,
      )?.address ||
      "",
    walletType: primary?.walletType ?? "coinbase",
    referralCode: primary?.referralCode ?? "",
  }

  const [walletOverride, setWalletOverride] =
    useState<CheckoutWallet | null>(null)

  const selectedWallet =
    walletOverride ?? (collector.walletType as CheckoutWallet)

  const [error, setError] = useState("")

  const submission = useRef<{
    fingerprint: string
    key: string
  } | null>(null)

  const inFlight = useRef(false)

  function handleCollectorChange(values: CollectorFormValues) {
    setDraft(values)
    setError("")
  }

  async function handleSubmit() {
    if (inFlight.current || !query.data) return

    setError("")

    const input = {
      collector,
      selectedWallet,
      cartSignature: cartSignature(query.data),
    }

    const fingerprint = JSON.stringify(input)

    // Mantém a mesma chave em tentativas repetidas após erros.
    if (submission.current?.fingerprint !== fingerprint) {
      submission.current = {
        fingerprint,
        key: crypto.randomUUID(),
      }
    }

    inFlight.current = true

    try {
      const order = await create.mutateAsync({
        ...input,
        key: submission.current.key,
      })

      await navigate({
        to: "/pedido/confirmacao",
        search: { orderId: order.orderId },
        replace: true,
      })
    } catch (caughtError) {
      if (isUnauthorized(caughtError)) {
        await navigate({
          to: "/entrar",
          search: { redirect: "/checkout" },
          replace: true,
        })
      } else {
        setError(errorMessage(caughtError))
      }
    } finally {
      inFlight.current = false
    }
  }

  function requestConfirmation() {
    setError("")

    const form = document.getElementById("kurio-checkout-form")

    if (form instanceof HTMLFormElement) {
      form.requestSubmit()
    }
  }

  if (session.isSuccess && !session.data) {
    return (
      <Navigate
        to="/entrar"
        search={{ redirect: "/checkout" }}
        replace
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-6 font-mono sm:px-6 lg:px-8">
      <nav
        aria-label="Caminho de navegação"
        className="mb-8 flex flex-wrap items-center gap-2 text-xs font-bold"
      >
        <Link
          to="/"
          className="text-foreground transition-colors hover:text-kurio-primary"
        >
          Início
        </Link>

        <span
          aria-hidden="true"
          className="text-kurio-secondary"
        >
          /
        </span>

        <Link
          to="/mercado"
          className="text-foreground transition-colors hover:text-kurio-primary"
        >
          Mercado
        </Link>

        <span
          aria-hidden="true"
          className="text-kurio-secondary"
        >
          /
        </span>

        <span
          aria-current="page"
          className="text-kurio-text-secondary"
        >
          Pagamento
        </span>
      </nav>

      <RequestState
        error={profile.error ?? wallets.error ?? session.error}
        retry={() => {
          void profile.refetch()
          void wallets.refetch()
          void session.refetch()
        }}
      />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-10">
        <div className="min-w-0">
          {!!wallets.data?.length && (
            <label className="mb-5 block text-xs text-foreground">
              Usar carteira cadastrada

              <select
                aria-label="Usar carteira cadastrada"
                value={
                  wallets.data.find(
                    (wallet) =>
                      wallet.address === collector.walletAddress,
                  )?.id ?? ""
                }
                onChange={(event) => {
                  const wallet = wallets.data?.find(
                    (item) => item.id === event.target.value,
                  )

                  if (!wallet) {
                    setDraft({
                      ...collector,
                      walletAddress: "",
                      secondaryWallet: "",
                      useAnotherWallet: false,
                    })
                    return
                  }

                  setDraft({
                    ...collector,
                    walletAddress: wallet.address,
                    network: wallet.network,
                    walletType: wallet.walletType,
                    profileName: wallet.profileName,
                    referralCode: wallet.referralCode,
                    secondaryWallet: wallet.secondaryAddress,
                    useAnotherWallet: false,
                  })

                  setWalletOverride(
                    wallet.walletType as CheckoutWallet,
                  )
                }}
                className="mt-2 block w-full rounded-md border border-kurio-border bg-[#241612] px-3 py-3 text-sm text-foreground outline-none transition-colors focus:border-kurio-primary"
              >
                <option value="">Endereço manual</option>

                {wallets.data.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.nickname} ({wallet.network})
                  </option>
                ))}
              </select>
            </label>
          )}

          <CollectorForm
            values={collector}
            onChange={handleCollectorChange}
            onSubmit={() => void handleSubmit()}
          />
        </div>

        <div className="min-w-0">
          <CheckoutSummary
            selectedWallet={selectedWallet}
            onWalletChange={(wallet) => {
              setWalletOverride(wallet)
              setError("")
            }}
            onConfirm={requestConfirmation}
            error={error}
            pending={create.isPending}
          />
        </div>
      </div>
    </div>
  )
}