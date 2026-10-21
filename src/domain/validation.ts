export function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function validWalletAddress(network: string, address: string) {
  if (network === 'ethereum' || network === 'polygon') return /^0x[\da-fA-F]{40}$/.test(address)
  if (network !== 'solana' || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return false
  // Decode base58 and require exactly 32 bytes (a Solana public key).
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let value = 0n
  for (const char of address) value = value * 58n + BigInt(alphabet.indexOf(char))
  let bytes = 0
  while (value > 0n) { bytes++; value >>= 8n }
  return bytes + (address.match(/^1*/)?.[0].length ?? 0) === 32
}
