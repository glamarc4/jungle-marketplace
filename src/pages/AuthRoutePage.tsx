
import { AuthModal } from "@/components/auth/AuthModal"

type AuthRoutePageProps = {
  mode: "login" | "register"
}

export function AuthRoutePage({ mode }: AuthRoutePageProps) {
  return <AuthModal mode={mode} />
}
