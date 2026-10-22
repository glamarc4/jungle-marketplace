import type { ChangeEvent } from "react"

import type { CollectorFormValues } from "@/domain/collector"

type CollectorFormProps = {
  values: CollectorFormValues
  onChange: (values: CollectorFormValues) => void
  onSubmit: () => void
}

const inputClass =
  "h-11 w-full min-w-0 rounded-md border border-[#493025] bg-[#241612] px-3 text-xs text-foreground outline-none placeholder:text-kurio-secondary transition-colors focus:border-kurio-primary"

const labelClass = "mb-2 block text-xs text-foreground"

export function CollectorForm({
  values,
  onChange,
  onSubmit,
}: CollectorFormProps) {
  function update(
    field: keyof CollectorFormValues,
    value: string | boolean,
  ) {
    onChange({ ...values, [field]: value })
  }

  function handleTextChange(
    field: keyof CollectorFormValues,
  ) {
    return (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => update(field, event.target.value)
  }

  return (
    <section className="min-w-0 font-mono">
      <h1 className="!mb-6 !text-base !font-bold !leading-6 !tracking-normal text-foreground">
        Perfil do colecionador
      </h1>

      <form
        id="kurio-checkout-form"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
        className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2"
      >
        <div>
          <label htmlFor="collector-display" className={labelClass}>
            Nome de exibição <span className="text-kurio-primary">*</span>
          </label>
          <input
            id="collector-display"
            className={inputClass}
            value={values.displayName}
            onChange={handleTextChange("displayName")}
            autoComplete="nickname"
            required
            maxLength={80}
          />
        </div>

        <div>
          <label htmlFor="collector-username" className={labelClass}>
            Nome de usuário <span className="text-kurio-primary">*</span>
          </label>
          <input
            id="collector-username"
            className={inputClass}
            value={values.username}
            onChange={handleTextChange("username")}
            required
            minLength={3}
            maxLength={30}
            pattern="[A-Za-z0-9_-]+"
            title="Use letras, números, hífen ou underline."
          />
        </div>

        <div>
          <label htmlFor="collector-network" className={labelClass}>
            Rede <span className="text-kurio-primary">*</span>
          </label>
          <select
            id="collector-network"
            className={inputClass}
            value={values.network}
            onChange={(event) =>
              update("network", event.target.value)
            }
            required
          >
            <option value="" disabled>
              Selecione uma rede
            </option>
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
            <option value="solana">Solana</option>
          </select>
        </div>

        <div>
          <label htmlFor="collector-profile" className={labelClass}>
            Nome do perfil <span className="text-kurio-primary">*</span>
          </label>
          <input
            id="collector-profile"
            className={inputClass}
            value={values.profileName}
            onChange={handleTextChange("profileName")}
            required
            maxLength={80}
          />
        </div>

        <div>
          <label htmlFor="collector-wallet" className={labelClass}>
            Endereço da carteira <span className="text-kurio-primary">*</span>
          </label>
          <input
            id="collector-wallet"
            className={inputClass}
            value={values.walletAddress}
            onChange={handleTextChange("walletAddress")}
            placeholder={
              values.network === "solana"
                ? "Endereço Solana (base58)"
                : "Endereço 0x da carteira"
            }
            pattern={
              values.network === "solana"
                ? "[1-9A-HJ-NP-Za-km-z]{32,44}"
                : "0x[a-fA-F0-9]{40}"
            }
            title="Informe um endereço válido para a rede selecionada."
            required
            spellCheck={false}
          />
        </div>

        <div>
          <label htmlFor="collector-secondary" className={labelClass}>
            Carteira secundária (opcional)
          </label>
          <input
            id="collector-secondary"
            className={inputClass}
            value={values.secondaryWallet}
            onChange={handleTextChange("secondaryWallet")}
            placeholder="Outro endereço da mesma rede"
            pattern={
              values.network === "solana"
                ? "[1-9A-HJ-NP-Za-km-z]{32,44}"
                : "0x[a-fA-F0-9]{40}"
            }
            title="Informe um endereço válido para a rede selecionada."
            spellCheck={false}
          />
        </div>

        <div>
          <label htmlFor="collector-wallet-type" className={labelClass}>
            Tipo de carteira <span className="text-kurio-primary">*</span>
          </label>
          <select
            id="collector-wallet-type"
            className={inputClass}
            value={values.walletType}
            onChange={(event) =>
              update("walletType", event.target.value)
            }
            required
          >
            <option value="" disabled>
              Selecione uma carteira
            </option>
            <option value="metamask">MetaMask</option>
            <option value="coinbase">Coinbase Wallet</option>
            <option value="walletconnect">WalletConnect</option>
          </select>
        </div>

        <div>
          <label htmlFor="collector-referral" className={labelClass}>
            Código de indicação <span className="text-kurio-primary">*</span>
          </label>
          <input
            id="collector-referral"
            className={inputClass}
            value={values.referralCode}
            onChange={handleTextChange("referralCode")}
            required
            maxLength={40}
          />
        </div>

        <div>
          <label htmlFor="collector-email" className={labelClass}>
            E-mail <span className="text-kurio-primary">*</span>
          </label>
          <input
            id="collector-email"
            type="email"
            className={inputClass}
            value={values.email}
            onChange={handleTextChange("email")}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label htmlFor="collector-ens" className={labelClass}>
            Nome ENS (opcional)
          </label>
          <div className="flex gap-2">
            <input
              id="collector-ens"
              className={inputClass}
              value={values.ensName}
              onChange={handleTextChange("ensName")}
              placeholder="meunome"
              pattern="[A-Za-z0-9-]*"
            />
            <select
              aria-label="Extensão ENS"
              className={`${inputClass} !w-20 shrink-0`}
              value={values.ensExtension}
              onChange={(event) =>
                update("ensExtension", event.target.value)
              }
            >
              <option value=".eth">.eth</option>
            </select>
          </div>
        </div>

        <label className="col-span-full flex cursor-pointer items-center gap-2 text-xs text-foreground">
          <input
            type="checkbox"
            checked={values.useAnotherWallet}
            onChange={(event) =>
              update("useAnotherWallet", event.target.checked)
            }
            className="size-4 accent-[#D28A4C]"
          />
          Usar outra carteira?
        </label>

        <div className="col-span-full sm:col-span-1">
          <label htmlFor="collector-notes" className={labelClass}>
            Observação do colecionador (opcional)
          </label>
          <textarea
            id="collector-notes"
            value={values.notes}
            onChange={handleTextChange("notes")}
            rows={6}
            maxLength={500}
            className="w-full resize-y rounded-md border border-[#493025] bg-[#241612] p-3 text-xs text-foreground outline-none transition-colors focus:border-kurio-primary"
          />
        </div>
      </form>
    </section>
  )
}