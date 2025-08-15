"use client"

import { useState, useEffect, useCallback } from "react"
import { dscService } from "@/lib/contract-service"
import { eventService } from "@/lib/event-service"
import { walletManager, type WalletState } from "@/lib/wallet"
import type { UserPosition } from "@/lib/types"

export function useDscPosition() {
  const [position, setPosition] = useState<UserPosition | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletState, setWalletState] = useState<WalletState>(walletManager.getState())

  // Subscribe to wallet changes
  useEffect(() => {
    const unsubscribe = walletManager.subscribe(setWalletState)
    return unsubscribe
  }, [])

  // Subscribe to events for real-time updates
  useEffect(() => {
    if (!walletState.address) return

    const unsubscribe = eventService.subscribe((events) => {
      // Check if any events are for the current user
      const userEvents = events.filter((event) => event.user.toLowerCase() === walletState.address?.toLowerCase())

      if (userEvents.length > 0) {
        // Refresh position when user events are detected
        loadPosition()
      }
    })

    return unsubscribe
  }, [walletState.address])

  // Load user position
  const loadPosition = useCallback(async () => {
    if (!walletState.isConnected || !walletState.address) {
      setPosition(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Initialize service if needed
      await dscService.initialize()

      // Load user position
      const userPosition = await dscService.getUserPosition(walletState.address)
      setPosition(userPosition)
    } catch (err: any) {
      setError(err.message || "Failed to load position")
      console.error("Failed to load DSC position:", err)
    } finally {
      setLoading(false)
    }
  }, [walletState.isConnected, walletState.address])

  // Load position when wallet connects or address changes
  useEffect(() => {
    loadPosition()
  }, [loadPosition])

  // Refresh position data
  const refresh = useCallback(() => {
    loadPosition()
  }, [loadPosition])

  return {
    position,
    loading,
    error,
    refresh,
    isConnected: walletState.isConnected,
    address: walletState.address,
  }
}
