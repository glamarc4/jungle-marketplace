export type CollectorFormValues = {
  displayName: string
  username: string
  network: string
  profileName: string
  walletAddress: string
  secondaryWallet: string
  walletType: string
  referralCode: string
  email: string
  ensName: string
  ensExtension: string
  useAnotherWallet: boolean
  notes: string
}

export const initialCollectorValues: CollectorFormValues = {
  displayName: "",
  username: "",
  network: "",
  profileName: "",
  walletAddress: "",
  secondaryWallet: "",
  walletType: "",
  referralCode: "",
  email: "",
  ensName: "",
  ensExtension: ".eth",
  useAnotherWallet: false,
  notes: "",
}

