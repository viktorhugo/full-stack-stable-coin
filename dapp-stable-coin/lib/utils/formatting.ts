import { formatEther, formatUnits, parseEther, parseUnits } from "ethers"

// Format Wei to readable string with specified decimals
export function formatTokenAmount(amount: bigint, decimals = 18, displayDecimals = 4): string {
  const formatted = formatUnits(amount, decimals)
  const num = Number.parseFloat(formatted)

  if (num === 0) return "0"
  if (num < 0.0001) return "< 0.0001"

  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  })
}

// Format USD values (assuming 18 decimals)
export function formatUsdValue(amount: bigint, displayDecimals = 2): string {
  const formatted = formatEther(amount)
  const num = Number.parseFloat(formatted)

  if (num === 0) return "$0.00"
  if (num < 0.01) return "< $0.01"

  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: displayDecimals,
    maximumFractionDigits: displayDecimals,
  })
}

// Format health factor (18 decimals, but display as ratio)
export function formatHealthFactor(healthFactor: bigint): string {
  if (healthFactor === 0n) return "0.00"

  const formatted = formatEther(healthFactor)
  const num = Number.parseFloat(formatted)

  return num.toFixed(2)
}

// Format percentage
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`
}

// Calculate collateralization ratio
export function calculateCollateralizationRatio(collateralValue: bigint, dscMinted: bigint): number {
  if (dscMinted === 0n) return 0

  const collateralNum = Number.parseFloat(formatEther(collateralValue))
  const dscNum = Number.parseFloat(formatEther(dscMinted))

  return (collateralNum / dscNum) * 100
}

// Parse user input to Wei
export function parseTokenInput(input: string, decimals = 18): bigint {
  try {
    if (!input || input.trim() === "") return 0n
    return parseUnits(input.trim(), decimals)
  } catch (error) {
    return 0n
  }
}

// Validate numeric input
export function validateNumericInput(input: string): boolean {
  if (!input || input.trim() === "") return false
  const num = Number.parseFloat(input)
  return !isNaN(num) && num > 0 && isFinite(num)
}

// Format transaction hash for display
export function formatTxHash(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

// Calculate liquidation price
export function calculateLiquidationPrice(
  collateralAmount: bigint,
  dscMinted: bigint,
  currentPrice: bigint,
  liquidationThreshold = 150, // 150% collateralization
): bigint {
  if (collateralAmount === 0n) return 0n

  const collateralNum = Number.parseFloat(formatEther(collateralAmount))
  const dscNum = Number.parseFloat(formatEther(dscMinted))
  const priceNum = Number.parseFloat(formatEther(currentPrice))

  // Price at which position becomes liquidatable
  const liquidationPrice = (dscNum * liquidationThreshold) / (100 * collateralNum)

  return parseEther(liquidationPrice.toString())
}

// Health factor color coding
export function getHealthFactorColor(healthFactor: bigint): string {
  const hf = Number.parseFloat(formatEther(healthFactor))

  if (hf >= 2.0) return "text-green-500"
  if (hf >= 1.5) return "text-yellow-500"
  if (hf >= 1.2) return "text-orange-500"
  return "text-red-500"
}

// Health factor status
export function getHealthFactorStatus(healthFactor: bigint): "safe" | "warning" | "danger" | "liquidation" {
  const hf = Number.parseFloat(formatEther(healthFactor))

  if (hf >= 1.5) return "safe"
  if (hf >= 1.2) return "warning"
  if (hf >= 1.0) return "danger"
  return "liquidation"
}

// Format wallet address for display (0x1234...5678)
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
