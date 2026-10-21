export function ethToMicroEth(value: string) {
  if (!/^\d+(\.\d{1,6})?$/.test(value)) throw new Error("Preço em ETH inválido")
  const [whole, fraction = ""] = value.split(".")
  const result = BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, "0"))
  if (result > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("Preço fora do limite seguro")
  return Number(result)
}

export function formatMicroEth(
  value: number,
  minFractionDigits = 2,
) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error("Valor monetário inválido")
  const whole = BigInt(value) / 1_000_000n
  const fraction = String(value % 1_000_000)
    .padStart(6, "0")
    .replace(/0+$/, "")

  const decimals = fraction.padEnd(
    minFractionDigits,
    "0",
  )

  return `${whole}${decimals ? `.${decimals}` : ""} ETH`
}

export const NETWORK_FEE_MICRO_ETH = 16_000

export function calculateTotals(items: { unitPriceMicroEth: number; quantity: number }[], coupon: string | null = null) {
  if (coupon !== null && coupon !== "KURIO10") throw new Error("Cupom inválido")
  if (items.some(item => !Number.isSafeInteger(item.unitPriceMicroEth) || item.unitPriceMicroEth < 0 || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) throw new Error("Item inválido")
  const subtotal = items.reduce((sum, item) => sum + BigInt(item.unitPriceMicroEth) * BigInt(item.quantity), 0n)
  // All catalog prices are multiples of 10,000 microETH: 10% is exact.
  if (coupon && subtotal % 10n !== 0n) throw new Error("Desconto não representável em microETH")
  const discount = coupon === "KURIO10" ? subtotal / 10n : 0n
  const fee = items.length ? BigInt(NETWORK_FEE_MICRO_ETH) : 0n
  const values = [subtotal, discount, fee, subtotal - discount + fee]
  if (values.some(value => value > BigInt(Number.MAX_SAFE_INTEGER))) throw new Error("Total fora do limite seguro")
  return { subtotalMicroEth: Number(subtotal), discountMicroEth: Number(discount), networkFeeMicroEth: Number(fee), totalMicroEth: Number(subtotal - discount + fee) }
}
