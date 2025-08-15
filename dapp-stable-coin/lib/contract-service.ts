import { type Contract, parseUnits } from "ethers"
import { walletManager } from "./wallet"
import type { UserPosition, CollateralToken, TransactionResult, PriceData } from "./types"

export class DSCService {
  private static instance: DSCService
  private contract: Contract | null = null
  private collateralTokens: CollateralToken[] = []
  private priceCache: Map<string, PriceData> = new Map()

  static getInstance(): DSCService {
    if (!DSCService.instance) {
      DSCService.instance = new DSCService()
    }
    return DSCService.instance
  }

  private getContract(): Contract | null {
    if (!this.contract) {
      this.contract = walletManager.getDSCContract()
    }
    return this.contract
  }

  // Initialize service and load collateral tokens
  async initialize(): Promise<void> {
    try {
      const contract = this.getContract()
      if (!contract) throw new Error("Contract not available")

      // Load supported collateral tokens
      const tokenAddresses = await contract.getCollateralTokens()
      this.collateralTokens = await Promise.all(
        tokenAddresses.map(async (address: string) => {
          const priceFeedAddress = await contract.getCollateralTokenPriceFeed(address)

          // In a real implementation, you'd fetch token metadata from the token contract
          // For now, we'll use placeholder data
          return {
            address,
            name: this.getTokenName(address),
            symbol: this.getTokenSymbol(address),
            decimals: 18,
            priceFeedAddress,
          }
        }),
      )
    } catch (error) {
      console.error("Failed to initialize DSC service:", error)
      throw error
    }
  }

  // Get user's complete position information
  async getUserPosition(userAddress: string): Promise<UserPosition> {
    try {
      const contract = this.getContract()
      if (!contract) throw new Error("Contract not available")

      // Get account information
      const [totalDscMinted, collateralValueInUsd] = await contract.getAccountInformation(userAddress)
      const healthFactor = await contract.getHealthFactor(userAddress)

      // Get collateral balances for each token
      const collateralBalances = await Promise.all(
        this.collateralTokens.map(async (token) => {
          const balance = await contract.getCollateralBalanceOfUser(userAddress, token.address)
          const valueInUsd = balance > 0n ? await contract.getUsdValue(token.address, balance) : 0n
          const pricePerToken = await this.getTokenPrice(token.address)

          return {
            token: token.address,
            tokenName: token.name,
            tokenSymbol: token.symbol,
            balance,
            valueInUsd,
            pricePerToken,
          }
        }),
      )

      return {
        totalDscMinted,
        collateralValueInUsd,
        healthFactor,
        collateralBalances: collateralBalances.filter((cb) => cb.balance > 0n),
      }
    } catch (error) {
      console.error("Failed to get user position:", error)
      throw error
    }
  }

  // Deposit collateral
  async depositCollateral(tokenAddress: string, amount: bigint): Promise<TransactionResult> {
    try {
      const contract = this.getContract()
      if (!contract) throw new Error("Contract not available")

      const tx = await contract.depositCollateral(tokenAddress, amount)
      const receipt = await tx.wait()

      return {
        success: true,
        hash: tx.hash,
        receipt,
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.parseError(error),
      }
    }
  }

  // Mint DSC tokens
  async mintDsc(amount: bigint): Promise<TransactionResult> {
    try {
      const contract = this.getContract()
      if (!contract) throw new Error("Contract not available")

      const tx = await contract.mintDsc(amount)
      const receipt = await tx.wait()

      return {
        success: true,
        hash: tx.hash,
        receipt,
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.parseError(error),
      }
    }
  }

  // Deposit collateral and mint DSC in one transaction
  async depositCollateralAndMintDsc(
    tokenAddress: string,
    collateralAmount: bigint,
    dscAmount: bigint,
  ): Promise<TransactionResult> {
    try {
      const contract = this.getContract()
      if (!contract) throw new Error("Contract not available")

      const tx = await contract.depositCollateralAndMintDsc(tokenAddress, collateralAmount, dscAmount)
      const receipt = await tx.wait()

      return {
        success: true,
        hash: tx.hash,
        receipt,
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.parseError(error),
      }
    }
  }

  // Redeem collateral
  async redeemCollateral(tokenAddress: string, amount: bigint): Promise<TransactionResult> {
    try {
      const contract = this.getContract()
      if (!contract) throw new Error("Contract not available")

      const tx = await contract.redeemCollateral(tokenAddress, amount)
      const receipt = await tx.wait()

      return {
        success: true,
        hash: tx.hash,
        receipt,
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.parseError(error),
      }
    }
  }

  // Burn DSC tokens
  async burnDsc(amount: bigint): Promise<TransactionResult> {
    try {
      const contract = this.getContract()
      if (!contract) throw new Error("Contract not available")

      const tx = await contract.burnDsc(amount)
      const receipt = await tx.wait()

      return {
        success: true,
        hash: tx.hash,
        receipt,
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.parseError(error),
      }
    }
  }

  // Redeem collateral and burn DSC in one transaction
  async redeemCollateralForDsc(
    tokenAddress: string,
    collateralAmount: bigint,
    dscAmount: bigint,
  ): Promise<TransactionResult> {
    try {
      const contract = this.getContract()
      if (!contract) throw new Error("Contract not available")

      const tx = await contract.redeemCollateralForDsc(tokenAddress, collateralAmount, dscAmount)
      const receipt = await tx.wait()

      return {
        success: true,
        hash: tx.hash,
        receipt,
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.parseError(error),
      }
    }
  }

  // Liquidate a user's position
  async liquidate(collateralToken: string, userToLiquidate: string, debtToCover: bigint): Promise<TransactionResult> {
    try {
      const contract = this.getContract()
      if (!contract) throw new Error("Contract not available")

      const tx = await contract.liquidate(collateralToken, userToLiquidate, debtToCover)
      const receipt = await tx.wait()

      return {
        success: true,
        hash: tx.hash,
        receipt,
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.parseError(error),
      }
    }
  }

  // Get token price from Chainlink price feed
  async getTokenPrice(tokenAddress: string): Promise<bigint> {
    try {
      // Check cache first
      const cached = this.priceCache.get(tokenAddress)
      if (cached && Date.now() - cached.lastUpdated < 60000) {
        // 1 minute cache
        return cached.price
      }

      const contract = this.getContract()
      if (!contract) throw new Error("Contract not available")

      // Get 1 token worth in USD (with 18 decimals)
      const oneToken = parseUnits("1", 18)
      const priceInUsd = await contract.getUsdValue(tokenAddress, oneToken)

      // Cache the price
      this.priceCache.set(tokenAddress, {
        token: tokenAddress,
        price: priceInUsd,
        decimals: 18,
        lastUpdated: Date.now(),
      })

      return priceInUsd
    } catch (error) {
      console.error(`Failed to get price for token ${tokenAddress}:`, error)
      return 0n
    }
  }

  // Calculate maximum DSC that can be minted
  async getMaxMintableDsc(userAddress: string): Promise<bigint> {
    try {
      const contract = this.getContract()
      if (!contract) throw new Error("Contract not available")

      const collateralValue = await contract.getAccountCollateralValue(userAddress)
      const [totalDscMinted] = await contract.getAccountInformation(userAddress)

      // Assuming 150% collateralization ratio (66.67% of collateral value)
      const maxMintable = (collateralValue * 2n) / 3n - totalDscMinted
      return maxMintable > 0n ? maxMintable : 0n
    } catch (error) {
      console.error("Failed to calculate max mintable DSC:", error)
      return 0n
    }
  }

  // Calculate USD amount from token amount
  async calculateUsdValue(tokenAddress: string, tokenAmount: bigint): Promise<bigint> {
    try {
      const contract = this.getContract()
      if (!contract) return 0n

      return await contract.getUsdValue(tokenAddress, tokenAmount)
    } catch (error) {
      console.error("Failed to calculate USD value:", error)
      return 0n
    }
  }

  // Calculate token amount from USD amount
  async calculateTokenAmount(tokenAddress: string, usdAmount: bigint): Promise<bigint> {
    try {
      const contract = this.getContract()
      if (!contract) return 0n

      return await contract.getTokenAmountFromUsd(tokenAddress, usdAmount)
    } catch (error) {
      console.error("Failed to calculate token amount:", error)
      return 0n
    }
  }

  // Get supported collateral tokens
  getCollateralTokens(): CollateralToken[] {
    return [...this.collateralTokens]
  }

  // Helper methods
  private getTokenName(address: string): string {
    // In a real implementation, fetch from token contract
    const names: { [key: string]: string } = {
      "0xA0b86a33E6441E8C8C7014b0C112D4d1c0C8E8B8": "Wrapped Ether",
      "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": "Wrapped Bitcoin",
    }
    return names[address] || "Unknown Token"
  }

  private getTokenSymbol(address: string): string {
    // In a real implementation, fetch from token contract
    const symbols: { [key: string]: string } = {
      "0xA0b86a33E6441E8C8C7014b0C112D4d1c0C8E8B8": "WETH",
      "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": "WBTC",
    }
    return symbols[address] || "UNK"
  }

  private parseError(error: any): string {
    if (error.reason) return error.reason
    if (error.message) {
      // Extract revert reason from error message
      const match = error.message.match(/revert (.+)/)
      if (match) return match[1]
      return error.message
    }
    return "Transaction failed"
  }
}

// Global service instance
export const dscService = DSCService.getInstance()
