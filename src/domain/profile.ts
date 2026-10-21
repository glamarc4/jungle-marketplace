export type ProfileValues = {
  displayName: string
  username: string
  email: string
  ens: string
  ensSuffix: string
  walletNickname: string
  avatar: string
}

export const emptyProfile: ProfileValues = {
  displayName: "",
  username: "",
  email: "",
  ens: "",
  ensSuffix: ".eth",
  walletNickname: "",
  avatar: "",
}

