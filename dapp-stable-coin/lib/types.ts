export interface UserPosition {
  totalDscMinted: bigint
  collateralValueInUsd: bigint
  healthFactor: bigint
  collateralBalances: CollateralBalance[]
}

export interface CollateralBalance {
  token: string
  tokenName: string
  tokenSymbol: string
  balance: bigint
  valueInUsd: bigint
  pricePerToken: bigint
}

export interface CollateralToken {
  address: string
  name: string
  symbol: string
  decimals: number
  priceFeedAddress: string
}

export interface TransactionResult {
  success: boolean
  hash?: string
  error?: string
  receipt?: any
}

export interface PriceData {
  token: string
  price: bigint
  decimals: number
  lastUpdated: number
}

export interface LiquidationTarget {
  user: string
  healthFactor: bigint
  totalDebt: bigint
  collateralValue: bigint
  collateralTokens: CollateralBalance[]
}

// Transaction types
export type TransactionType = "deposit" | "mint" | "redeem" | "burn" | "liquidate" | "depositAndMint" | "redeemAndBurn"

export interface TransactionParams {
  type: TransactionType
  tokenAddress?: string
  amount?: bigint
  amountCollateral?: bigint
  amountDsc?: bigint
  targetUser?: string
}
