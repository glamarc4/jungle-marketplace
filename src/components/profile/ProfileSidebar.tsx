
import { Link, useNavigate } from "@tanstack/react-router"
import {
  CircleHelp,
  Download,
  Heart,
  LogOut,
  MapPin,
  ShoppingCart,
  Tag,
  UserRound,
} from "lucide-react"

import { useAuth } from "@/hooks/use-api"
import { RequestState } from "@/components/RequestState"

type ProfileSection = "profile" | "wallets"

type ProfileSidebarProps = {
  active: ProfileSection
}

const items = [
  {
    label: "Dados do perfil",
    to: "/perfil",
    icon: UserRound,
    section: "profile",
  },
  {
    label: "Carteiras",
    to: "/carteiras",
    icon: MapPin,
    section: "wallets",
  },
] as const

export function ProfileSidebar({
  active,
}: ProfileSidebarProps) {
  const navigate = useNavigate()
  const logout = useAuth("logout")

  function handleLogout() {
    logout.mutate({ email: "", password: "" }, { onSuccess: () => { void navigate({ to: "/" }) } })
  }

  return (
    <aside className="w-full self-start bg-kurio-card font-mono lg:w-[280px] lg:shrink-0">
      <h2 className="px-4 pb-2 pt-4 text-base font-bold">
        Meu perfil
      </h2>

      <nav aria-label="Menu do perfil">
        {items.map((item) => {
          const Icon = item.icon
          const selected = active === item.section

          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={selected ? "page" : undefined}
              className={`flex min-h-11 items-center gap-4 border-l-4 px-3 text-sm text-kurio-primary transition-colors hover:bg-kurio-raised ${
                selected
                  ? "border-kurio-primary bg-kurio-raised/40"
                  : "border-transparent"
              }`}
            >
              <Icon size={17} strokeWidth={1.5} />
              {item.label}
            </Link>
          )
        })}

        <Link to="/pedido/confirmacao" search={{}} className="flex min-h-11 items-center gap-4 px-4 text-sm text-kurio-primary/80">
          <ShoppingCart size={17} />
          Atividade
        </Link>

        <div className="flex min-h-11 items-center gap-4 px-4 text-sm text-kurio-primary/80">
          <Heart size={17} />
          Lista de interesse
        </div>

        <div className="flex min-h-11 items-center gap-4 px-4 text-sm text-kurio-primary/80">
          <Tag size={17} />
          Ofertas
        </div>

        <div className="flex min-h-11 items-center gap-4 px-4 text-sm text-kurio-primary/80">
          <Download size={17} />
          Arquivos baixados
        </div>

        <div className="flex min-h-11 items-center gap-4 px-4 text-sm text-kurio-primary/80">
          <CircleHelp size={17} />
          Suporte
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={logout.isPending}
          className="flex min-h-11 w-full items-center gap-4 border-t border-kurio-border px-4 text-left text-sm font-bold text-kurio-primary hover:bg-kurio-raised"
        >
          <LogOut size={17} />
          Sair
        </button>
        <RequestState error={logout.error} />
      </nav>
    </aside>
  )
}
