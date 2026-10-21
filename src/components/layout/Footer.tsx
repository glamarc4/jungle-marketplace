
import { useState, type FormEvent } from "react"
import {
  BriefcaseBusiness,
  Camera,
  Play,
  UsersRound,
} from "lucide-react"

import {
  footerBenefits,
  footerContact,
  footerLinkGroups,
  supportedWallets,
} from "@/data/footer-content"

const socialLinks = [
  {
    label: "Facebook",
    Icon: UsersRound,
  },
  {
    label: "Instagram",
    Icon: Camera,
  },
  {
    label: "LinkedIn",
    Icon: BriefcaseBusiness,
  },
  {
    label: "YouTube",
    Icon: Play,
  },
] as const

function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      setMessage("Informe seu e-mail.")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setMessage("Informe um e-mail válido.")
      return
    }

    setMessage(
      "E-mail válido! A inscrição estará disponível em breve."
    )
  }

  return (
    <div className="min-w-0 font-mono">
      <h3 className="mb-4 max-w-[240px] text-sm font-bold leading-5 text-foreground">
        Antecipe-se ao próximo lançamento
      </h3>

      <form onSubmit={handleSubmit} noValidate>
        <label
          htmlFor="footer-newsletter"
          className="sr-only"
        >
          Seu endereço de e-mail
        </label>

        <div className="flex min-w-0 overflow-hidden rounded-md border border-kurio-border-soft bg-kurio-surface-dark">
          <input
            id="footer-newsletter"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="digite seu e-mail..."
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setMessage("")
            }}
            aria-describedby="footer-newsletter-message"
            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-xs text-foreground outline-none placeholder:text-kurio-secondary focus-visible:bg-kurio-raised"
          />

          <button
            type="submit"
            className="shrink-0 bg-kurio-primary px-4 text-xs font-bold text-kurio-ink transition-colors hover:bg-kurio-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            Enviar
          </button>
        </div>

        <p
          id="footer-newsletter-message"
          role="status"
          className="mt-2 min-h-5 text-[11px] leading-5 text-kurio-text-secondary"
        >
          {message}
        </p>
      </form>

      <p className="mt-2 text-xs leading-5 text-kurio-text-secondary">
        Receba lançamentos selecionados, histórias de
        criadores e novidades do mercado.
      </p>
    </div>
  )
}

function FooterBenefits() {
  return (
    <div className="bg-kurio-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:px-8">
        {footerBenefits.map((benefit) => (
          <div
            key={benefit.id}
            className="min-w-0 font-mono lg:border-r lg:border-kurio-primary/60 lg:px-6 lg:first:pl-0"
          >
            <div
              aria-hidden="true"
              className="mb-4 flex size-16 items-center justify-center rounded-full bg-kurio-primary text-2xl font-bold text-kurio-ink"
            >
              {benefit.iconLetter}
            </div>

            <h3 className="text-sm font-bold leading-5 text-foreground">
              {benefit.title}
            </h3>

            <p className="mt-2 max-w-[260px] text-xs leading-6 text-kurio-text-secondary">
              {benefit.description}
            </p>
          </div>
        ))}

        <div className="min-w-0 font-mono lg:pl-6">
          <NewsletterForm />
        </div>
      </div>
    </div>
  )
}

function FooterIdentity() {
  return (
    <div className="bg-kurio-surface-dark">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 font-mono text-xs text-foreground sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:items-center lg:gap-8 lg:px-8">
        <a
          href="#inicio"
          aria-label="Kurio — voltar ao início"
          className="w-fit font-bold tracking-[0.1em] hover:text-kurio-primary"
        >
          KURIO
        </a>

        <p className="max-w-[230px] leading-5">
          Feito para colecionadores, criadores e cultura
        </p>

        <a
          href={`mailto:${footerContact.email}`}
          className="w-fit break-all hover:text-kurio-primary"
        >
          {footerContact.email}
        </a>

        <a
          href={`tel:${footerContact.phoneHref}`}
          className="w-fit hover:text-kurio-primary"
        >
          {footerContact.phoneDisplay}
        </a>
      </div>
    </div>
  )
}

function FooterNavigation() {
  return (
    <div className="bg-kurio-card">
      <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-10 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {footerLinkGroups.map((group) => (
          <nav
            key={group.title}
            aria-label={group.title}
            className="min-w-0 font-mono"
          >
            <h3 className="mb-4 text-sm font-bold text-foreground">
              {group.title}
            </h3>

            <ul className="space-y-3">
              {group.links.map((link) => (
                <li key={link.label}>
                  <span
                    title="Página em desenvolvimento"
                    className="cursor-default text-xs text-foreground/75"
                  >
                    {link.label}
                  </span>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="min-w-0 font-mono">
          <h3 className="mb-4 text-sm font-bold text-foreground">
            Redes sociais
          </h3>

          <div className="flex flex-wrap gap-2">
            {socialLinks.map(({ label, Icon }) => (
              <span
                key={label}
                title={`${label} — link em desenvolvimento`}
                aria-label={`${label} — indisponível`}
                className="flex size-8 items-center justify-center rounded border border-kurio-primary text-kurio-primary"
              >
                <Icon
                  aria-hidden="true"
                  className="size-4"
                />
              </span>
            ))}
          </div>

          <h3 className="mb-3 mt-8 text-sm font-bold text-foreground">
            Carteiras compatíveis
          </h3>

          <div className="inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-kurio-border-soft bg-kurio-surface-dark px-3 py-2">
            {supportedWallets.map((wallet, index) => (
              <span
                key={wallet}
                className="text-[9px] font-bold text-kurio-primary"
              >
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="mr-2 text-kurio-secondary"
                  >
                    ·
                  </span>
                )}
                {wallet}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Footer() {
  return (
    <footer
      aria-label="Rodapé da Kurio"
      className="w-full"
    >
      <FooterBenefits />
      <FooterIdentity />
      <FooterNavigation />

      <div className="bg-background px-4 py-5 text-center font-mono text-[11px] text-foreground/75 sm:px-6">
        © 2026 Kurio. Propriedade digital para todos.
      </div>
    </footer>
  )
}
