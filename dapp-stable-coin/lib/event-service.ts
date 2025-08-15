"use client"

import type { Contract, EventLog } from "ethers"
import { walletManager } from "./wallet"

export interface DSCEvent {
  id: string
  type: "CollateralDeposited" | "CollateralRedeemed" | "DscMinted" | "DscBurned" | "Liquidation"
  user: string
  timestamp: number
  blockNumber: number
  transactionHash: string
  data: {
    token?: string
    tokenSymbol?: string
    amount?: bigint
    amountDsc?: bigint
    liquidator?: string
    liquidatedUser?: string
  }
}

export class EventService {
  private static instance: EventService
  private contract: Contract | null = null
  private listeners: ((events: DSCEvent[]) => void)[] = []
  private events: DSCEvent[] = []
  private isListening = false

  static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService()
    }
    return EventService.instance
  }

  subscribe(listener: (events: DSCEvent[]) => void) {
    this.listeners.push(listener)
    // Send current events to new subscriber
    listener([...this.events])

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.events]))
  }

  private getContract(): Contract | null {
    if (!this.contract) {
      this.contract = walletManager.getDSCContract()
    }
    return this.contract
  }

  async startListening() {
    if (this.isListening) return

    const contract = this.getContract()
    if (!contract) {
      console.warn("Contract not available for event listening")
      return
    }

    this.isListening = true

    try {
      // Load recent events first
      await this.loadRecentEvents()

      // Listen for new events
      contract.on("CollateralDeposited", this.handleCollateralDeposited.bind(this))
      contract.on("CollateralRedeemed", this.handleCollateralRedeemed.bind(this))
      // Note: DscMinted and DscBurned events would need to be added to the contract ABI
      // contract.on("DscMinted", this.handleDscMinted.bind(this))
      // contract.on("DscBurned", this.handleDscBurned.bind(this))

      console.log("Event listening started")
    } catch (error) {
      console.error("Failed to start event listening:", error)
      this.isListening = false
    }
  }

  stopListening() {
    if (!this.isListening) return

    const contract = this.getContract()
    if (contract) {
      contract.removeAllListeners()
    }

    this.isListening = false
    console.log("Event listening stopped")
  }

  private async loadRecentEvents() {
    const contract = this.getContract()
    if (!contract) return

    try {
      // Get events from the last 1000 blocks
      const currentBlock = await contract.runner?.provider?.getBlockNumber()
      if (!currentBlock) return

      const fromBlock = Math.max(0, currentBlock - 1000)

      // Load CollateralDeposited events
      const depositFilter = contract.filters.CollateralDeposited()
      const depositEvents = await contract.queryFilter(depositFilter, fromBlock, currentBlock)

      // Load CollateralRedeemed events
      const redeemFilter = contract.filters.CollateralRedeemed()
      const redeemEvents = await contract.queryFilter(redeemFilter, fromBlock, currentBlock)

      // Process and add events
      const allEvents = [...depositEvents, ...redeemEvents]
      const processedEvents = await Promise.all(allEvents.map((event) => this.processEvent(event as EventLog)))

      // Sort by block number (newest first)
      processedEvents.sort((a, b) => b.blockNumber - a.blockNumber)

      this.events = processedEvents.slice(0, 50) // Keep only last 50 events
      this.notify()
    } catch (error) {
      console.error("Failed to load recent events:", error)
    }
  }

  private async handleCollateralDeposited(user: string, token: string, amount: bigint, event: any) {
    const dscEvent = await this.createEventFromLog(event, "CollateralDeposited", {
      user,
      token,
      amount,
    })
    this.addEvent(dscEvent)
  }

  private async handleCollateralRedeemed(
    redeemFrom: string,
    redeemTo: string,
    token: string,
    amount: bigint,
    event: any,
  ) {
    const dscEvent = await this.createEventFromLog(event, "CollateralRedeemed", {
      user: redeemFrom,
      token,
      amount,
    })
    this.addEvent(dscEvent)
  }

  private async processEvent(eventLog: EventLog): Promise<DSCEvent> {
    const eventName = eventLog.eventName || eventLog.fragment?.name

    switch (eventName) {
      case "CollateralDeposited":
        return this.createEventFromLog(eventLog, "CollateralDeposited", {
          user: eventLog.args[0],
          token: eventLog.args[1],
          amount: eventLog.args[2],
        })

      case "CollateralRedeemed":
        return this.createEventFromLog(eventLog, "CollateralRedeemed", {
          user: eventLog.args[0],
          token: eventLog.args[2],
          amount: eventLog.args[3],
        })

      default:
        return this.createEventFromLog(eventLog, "CollateralDeposited", {
          user: eventLog.args?.[0] || "0x0",
          token: eventLog.args?.[1] || "0x0",
          amount: eventLog.args?.[2] || 0n,
        })
    }
  }

  private async createEventFromLog(eventLog: any, type: DSCEvent["type"], data: any): Promise<DSCEvent> {
    const block = (await eventLog.getBlock?.()) || { timestamp: Date.now() / 1000 }

    return {
      id: `${eventLog.transactionHash}-${eventLog.logIndex}`,
      type,
      user: data.user,
      timestamp: block.timestamp * 1000, // Convert to milliseconds
      blockNumber: eventLog.blockNumber,
      transactionHash: eventLog.transactionHash,
      data: {
        ...data,
        tokenSymbol: this.getTokenSymbol(data.token),
      },
    }
  }

  private addEvent(event: DSCEvent) {
    // Check if event already exists
    if (this.events.some((e) => e.id === event.id)) return

    // Add to beginning of array
    this.events.unshift(event)

    // Keep only last 50 events
    if (this.events.length > 50) {
      this.events = this.events.slice(0, 50)
    }

    this.notify()
  }

  private getTokenSymbol(tokenAddress: string): string {
    // In a real implementation, you would fetch this from the token contract
    const symbols: { [key: string]: string } = {
      "0xA0b86a33E6441E8C8C7014b0C112D4d1c0C8E8B8": "WETH",
      "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": "WBTC",
    }
    return symbols[tokenAddress] || "TOKEN"
  }

  getEvents(): DSCEvent[] {
    return [...this.events]
  }

  // Get events for a specific user
  getUserEvents(userAddress: string): DSCEvent[] {
    return this.events.filter((event) => event.user.toLowerCase() === userAddress.toLowerCase())
  }
}

// Global event service instance
export const eventService = EventService.getInstance()
