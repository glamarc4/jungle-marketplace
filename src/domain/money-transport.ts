// REST uses decimal ETH; application/storage retain exact, safe integer units.
const fields = {
  unitPriceMicroEth: ['unitPriceEth', 6], subtotalMicroEth: ['subtotalEth', 6],
  discountMicroEth: ['discountEth', 6], networkFeeMicroEth: ['networkFeeEth', 6],
  totalMicroEth: ['totalEth', 6], priceCents: ['priceEth', 2],
  previousPriceCents: ['previousPriceEth', 2],
} as const

type Fields = typeof fields
export type MoneyTransport<T> = T extends readonly (infer Item)[] ? MoneyTransport<Item>[]
  : T extends object ? { [Key in keyof T as Key extends keyof Fields ? Fields[Key][0] : Key]: Key extends keyof Fields ? string : MoneyTransport<T[Key]> }
  : T

export function integerToEth(value: number, decimals = 6): string {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Valor monetário inválido')
  const scale = 10n ** BigInt(decimals)
  const integer = BigInt(value)
  const fraction = (integer % scale).toString().padStart(decimals, '0').replace(/0+$/, '')
  return `${integer / scale}${fraction ? `.${fraction}` : ''}`
}
export function ethToInteger(value: unknown, decimals = 6): number {
  if (typeof value !== 'string' || !/^\d+(\.\d+)?$/.test(value)) throw new Error('ETH deve ser uma string decimal')
  const [whole, fraction = ''] = value.split('.')
  if (fraction.length > decimals && /[1-9]/.test(fraction.slice(decimals))) throw new Error('Precisão monetária não suportada; valor não foi arredondado')
  const integer = BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fraction.slice(0, decimals).padEnd(decimals, '0'))
  if (integer > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Valor monetário fora do limite seguro')
  return Number(integer)
}
function convert(value: unknown, decode: boolean): unknown {
  if (Array.isArray(value)) return value.map(item => convert(item, decode))
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value).map(([key, amount]) => {
    const field = Object.entries(fields).find(([internal, [wire]]) => (decode ? wire : internal) === key)
    if (!field) return [key, convert(amount, decode)]
    const [internal, [wire, decimals]] = field
    if (amount === undefined) return [decode ? internal : wire, undefined]
    return [decode ? internal : wire, decode ? ethToInteger(amount, decimals) : integerToEth(amount as number, decimals)]
  }))
}
export function toMoneyTransport<T>(value: T): MoneyTransport<T> { return convert(value, false) as MoneyTransport<T> }
export function fromMoneyTransport(value: unknown): unknown { return convert(value, true) }
