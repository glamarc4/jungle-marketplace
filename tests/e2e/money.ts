import { expect } from '@playwright/test'
// Independent assertion arithmetic: parse decimal ETH into wei without floats.
export function wei(value: string): bigint {
  expect(typeof value).toBe('string')
  expect(value).toMatch(/^\d+(\.\d{1,18})?$/)
  const [whole, fraction = ''] = value.split('.')
  return BigInt(whole) * 10n ** 18n + BigInt(fraction.padEnd(18, '0'))
}
export function displayWei(value: bigint, digits = 2) {
  const fraction = (value % 10n ** 18n).toString().padStart(18, '0').replace(/0+$/, '').padEnd(digits, '0')
  return `${value / 10n ** 18n}.${fraction} ETH`
}
