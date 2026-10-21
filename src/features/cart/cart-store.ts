// Compatibility facade: Query is the only client cart state; MSW owns persistence.
import { useCartQuery } from '../../hooks/use-api'
export type { CartItem } from '../../domain/cart'
export { ethToMicroEth, formatMicroEth } from '../../domain/money'
export function useCart() { return useCartQuery().data?.items ?? [] }
