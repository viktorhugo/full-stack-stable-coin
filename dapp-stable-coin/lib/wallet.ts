import { BrowserProvider, Contract, formatEther, type JsonRpcSigner } from "ethers"
import { CONTRACT_CONFIG } from "./config"

export interface WalletState {
  isConnected: boolean
  address: string | null
  chainId: number | null
  provider: BrowserProvider | null
  signer: JsonRpcSigner | null
}

export class WalletManager {
  private static instance: WalletManager
  private state: WalletState = {
    isConnected: false,
    address: null,
    chainId: null,
    provider: null,
    signer: null,
  }

  private listeners: ((state: WalletState) => void)[] = []

  static getInstance(): WalletManager {
    if (!WalletManager.instance) {
      WalletManager.instance = new WalletManager()
    }
    return WalletManager.instance
  }

  subscribe(listener: (state: WalletState) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener({ ...this.state }))
  }

  async connectMetaMask(): Promise<boolean> {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not installed")
      }

      const provider = new BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])

      if (accounts.length === 0) {
        throw new Error("No accounts found")
      }

      const signer = await provider.getSigner()
      const network = await provider.getNetwork()

      this.state = {
        isConnected: true,
        address: accounts[0],
        chainId: Number(network.chainId),
        provider,
        signer,
      }

      this.setupEventListeners()
      this.notify()
      return true
    } catch (error) {
      console.error("Failed to connect MetaMask:", error)
      return false
    }
  }

  async switchNetwork(): Promise<boolean> {
    try {
      if (!window.ethereum) return false

      const targetNetwork = CONTRACT_CONFIG.NETWORKS.SEPOLIA

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetNetwork.chainId.toString(16)}` }],
      })

      return true
    } catch (error: any) {
      // Network doesn't exist, add it
      if (error.code === 4902) {
        try {
          const targetNetwork = CONTRACT_CONFIG.NETWORKS.SEPOLIA
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${targetNetwork.chainId.toString(16)}`,
                chainName: targetNetwork.name,
                rpcUrls: [targetNetwork.rpcUrl],
              },
            ],
          })
          return true
        } catch (addError) {
          console.error("Failed to add network:", addError)
          return false
        }
      }
      console.error("Failed to switch network:", error)
      return false
    }
  }

  private setupEventListeners() {
    if (!window.ethereum) return

    window.ethereum.on("accountsChanged", (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect()
      } else {
        this.state.address = accounts[0]
        this.notify()
      }
    })

    window.ethereum.on("chainChanged", (chainId: string) => {
      this.state.chainId = Number.parseInt(chainId, 16)
      this.notify()
    })
  }

  disconnect() {
    this.state = {
      isConnected: false,
      address: null,
      chainId: null,
      provider: null,
      signer: null,
    }
    this.notify()
  }

  getState(): WalletState {
    return { ...this.state }
  }

  isCorrectNetwork(): boolean {
    return this.state.chainId === CONTRACT_CONFIG.TARGET_NETWORK
  }

  getDSCContract(): Contract | null {
    if (!this.state.signer) return null

    return new Contract(CONTRACT_CONFIG.DSC_ENGINE_ADDRESS, CONTRACT_CONFIG.DSC_ENGINE_ABI, this.state.signer)
  }
}

// Global wallet manager instance
export const walletManager = WalletManager.getInstance()

// Utility functions
export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const formatBalance = (balance: string, decimals = 4): string => {
  const num = Number.parseFloat(formatEther(balance))
  return num.toFixed(decimals)
}

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}
