"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"
import { dscService } from "@/lib/contract-service"
import { formatUsdValue } from "@/lib/utils/formatting"

interface TokenPrice {
  address: string
  symbol: string
  name: string
  price: bigint
  change24h?: number
}

export function PriceFeed() {
  const [prices, setPrices] = useState<TokenPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    const loadPrices = async () => {
      try {
        await dscService.initialize()
        const tokens = dscService.getCollateralTokens()

        const priceData = await Promise.all(
          tokens.map(async (token) => {
            const price = await dscService.getTokenPrice(token.address)
            return {
              address: token.address,
              symbol: token.symbol,
              name: token.name,
              price,
              change24h: Math.random() * 10 - 5, // Mock 24h change
            }
          }),
        )

        setPrices(priceData)
        setLastUpdate(new Date())
      } catch (error) {
        console.error("Failed to load prices:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPrices()

    // Update prices every 30 seconds
    const interval = setInterval(loadPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Prices
          </CardTitle>
          <CardDescription>Loading price feeds...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Live Prices
            </CardTitle>
            <CardDescription>Chainlink price feeds • Updated {lastUpdate.toLocaleTimeString()}</CardDescription>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {prices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No price feeds available</div>
        ) : (
          prices.map((token) => (
            <div
              key={token.address}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{token.symbol.slice(0, 2)}</span>
                </div>
                <div>
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-xs text-muted-foreground">{token.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatUsdValue(token.price)}</div>
                {token.change24h !== undefined && (
                  <div className="flex items-center gap-1 text-xs">
                    {token.change24h >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span className={token.change24h >= 0 ? "text-green-500" : "text-red-500"}>
                      {token.change24h >= 0 ? "+" : ""}
                      {token.change24h.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
