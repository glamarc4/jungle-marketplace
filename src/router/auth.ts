
import { redirect } from '@tanstack/react-router'
import { authApi } from '@/api/auth'
import { keys, queryClient } from '@/api/query-client'

export function validateOrderSearch(
  search: Record<string, unknown>,
): { orderId?: string } {
  return typeof search.orderId === 'string' &&
    /^DEMO-[A-Za-z0-9-]{1,100}$/.test(search.orderId)
    ? { orderId: search.orderId }
    : {}
}

export function validateAuthSearch(
  search: Record<string, unknown>,
): {
  redirect?: '/checkout' | '/pedido/confirmacao' | '/perfil' | '/carteiras'
  orderId?: string
} {
  if (search.redirect === '/perfil' || search.redirect === '/carteiras') return { redirect: search.redirect }

  if (search.redirect === '/checkout') {
    return { redirect: '/checkout' }
  }

  if (search.redirect === '/pedido/confirmacao') {
    return {
      redirect: '/pedido/confirmacao',
      ...validateOrderSearch(search),
    }
  }

  return {}
}

export function afterAuthDestination(
  search: ReturnType<typeof validateAuthSearch>,
) {
  if (search.redirect === '/perfil' || search.redirect === '/carteiras') return { to: search.redirect }

  if (search.redirect === '/checkout') {
    return { to: '/checkout' as const }
  }

  if (search.redirect === '/pedido/confirmacao') {
    return {
      to: '/pedido/confirmacao' as const,
      search: { orderId: search.orderId },
    }
  }

  return { to: '/perfil' as const }
}

export async function requireCheckoutSession({
  location,
}: {
  location: {
    pathname: string
    search: Record<string, unknown>
  }
}) {
  // Consulta independente para evitar o cancelamento da query
  // compartilhada durante a navegação.
  const session = await authApi.me()

  // Mantém Header e componentes sincronizados com a sessão
  // revalidada pela API.
  await queryClient.cancelQueries({
    queryKey: keys.session,
    exact: true,
  })

  queryClient.setQueryData(keys.session, session)

  if (!session) {
    await queryClient.cancelQueries({ queryKey: ['account'] })
    queryClient.removeQueries({ queryKey: ['account'] })
    throw redirect({
      to: '/entrar',
      search: validateAuthSearch({
        ...location.search,
        redirect: location.pathname,
      }),
      replace: true,
    })
  }
}
