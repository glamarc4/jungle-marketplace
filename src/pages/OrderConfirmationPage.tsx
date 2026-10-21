import { useCallback } from 'react'
import { Link, Navigate, useNavigate, useSearch } from '@tanstack/react-router'
import { OrderConfirmationModal } from '@/components/checkout/OrderConfirmationModal'
import { RequestState } from '@/components/RequestState'
import { useOrder, useOrders, useSession } from '@/hooks/use-api'
import { isUnauthorized } from '@/api/client'
import { formatMicroEth } from '@/domain/money'

export function OrderConfirmationPage() {
  const { orderId } = useSearch({ from: '/pedido/confirmacao' })
  const session = useSession()
  const orders = useOrders()
  const order = useOrder(orderId ?? '')
  const navigate = useNavigate()
  const close = useCallback(() => {
    void navigate({ to: '/pedido/confirmacao', search: {}, replace: true })
  }, [navigate])

  if ((session.isSuccess && !session.data) || isUnauthorized(order.error) || isUnauthorized(orders.error)) {
    return <Navigate to="/entrar" search={{ redirect: '/pedido/confirmacao', orderId }} replace />
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 font-mono sm:px-6 lg:px-8">
      <h1 className="mb-5 text-lg font-bold">Pedidos de demonstração</h1>
      <RequestState pending={session.isPending || orders.isLoading} error={session.error ?? orders.error} retry={() => { void session.refetch(); void orders.refetch() }} />
      {orders.data?.length === 0 && <p className="text-sm text-kurio-secondary">Você ainda não possui pedidos confirmados.</p>}
      <ul className="space-y-3">
        {orders.data?.map(item => (
          <li key={item.orderId}>
            <Link to="/pedido/confirmacao" search={{ orderId: item.orderId }} className="block break-words rounded-sm border border-kurio-border p-4 text-sm hover:border-kurio-primary">
              <span className="block">{item.orderId}</span>
              <span className="text-kurio-secondary">{item.date} · {formatMicroEth(item.totalMicroEth)} · Ver confirmação</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/mercado" className="mt-6 inline-block text-sm text-kurio-primary hover:underline">Continuar explorando</Link>
      {orderId && <RequestState pending={order.isLoading} error={order.error} retry={() => void order.refetch()} />}
      {orderId && order.data && !order.error && <OrderConfirmationModal order={order.data} onClose={close} />}
    </section>
  )
}
