"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, PlusCircle, MinusCircle, ExternalLink, Clock, User, Globe } from "lucide-react"
import { eventService, type DSCEvent } from "@/lib/event-service"
import { useDscPosition } from "@/lib/hooks/use-dsc-position"
import { formatTokenAmount, formatAddress, formatTxHash } from "@/lib/utils/formatting"

export function TransactionHistory() {
  const [events, setEvents] = useState<DSCEvent[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  const { address } = useDscPosition()

  useEffect(() => {
    const unsubscribe = eventService.subscribe((newEvents) => {
      setEvents(newEvents)
      setIsLoading(false)
    })

    // Start listening for events
    eventService.startListening()

    return () => {
      unsubscribe()
      eventService.stopListening()
    }
  }, [])

  const getFilteredEvents = () => {
    if (activeTab === "mine" && address) {
      return eventService.getUserEvents(address)
    }
    return events
  }

  const getEventIcon = (type: DSCEvent["type"]) => {
    switch (type) {
      case "CollateralDeposited":
        return <PlusCircle className="w-4 h-4 text-primary" />
      case "CollateralRedeemed":
        return <MinusCircle className="w-4 h-4 text-accent" />
      case "DscMinted":
        return <PlusCircle className="w-4 h-4 text-secondary" />
      case "DscBurned":
        return <MinusCircle className="w-4 h-4 text-chart-4" />
      case "Liquidation":
        return <MinusCircle className="w-4 h-4 text-destructive" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getEventColor = (type: DSCEvent["type"]) => {
    switch (type) {
      case "CollateralDeposited":
        return "bg-primary/10 text-primary border-primary/20"
      case "CollateralRedeemed":
        return "bg-accent/10 text-accent border-accent/20"
      case "DscMinted":
        return "bg-secondary/10 text-secondary border-secondary/20"
      case "DscBurned":
        return "bg-chart-4/10 text-chart-4 border-chart-4/20"
      case "Liquidation":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20"
    }
  }

  const getEventDescription = (event: DSCEvent) => {
    switch (event.type) {
      case "CollateralDeposited":
        return `Deposited ${formatTokenAmount(event.data.amount || 0n)} ${event.data.tokenSymbol}`
      case "CollateralRedeemed":
        return `Redeemed ${formatTokenAmount(event.data.amount || 0n)} ${event.data.tokenSymbol}`
      case "DscMinted":
        return `Minted ${formatTokenAmount(event.data.amountDsc || 0n)} DSC`
      case "DscBurned":
        return `Burned ${formatTokenAmount(event.data.amountDsc || 0n)} DSC`
      case "Liquidation":
        return `Liquidated ${formatAddress(event.data.liquidatedUser || "")}`
      default:
        return "Unknown transaction"
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  const openEtherscan = (txHash: string) => {
    // This would use the actual network's block explorer
    const baseUrl = "https://sepolia.etherscan.io/tx/"
    window.open(`${baseUrl}${txHash}`, "_blank")
  }

  const filteredEvents = getFilteredEvents()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Transaction History
            </CardTitle>
            <CardDescription>Recent DSC protocol activity</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              All Activity
            </TabsTrigger>
            <TabsTrigger value="mine" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              My Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0">{getEventIcon(event.type)}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={`text-xs ${getEventColor(event.type)}`}>
                            {event.type.replace(/([A-Z])/g, " $1").trim()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(event.timestamp)}</span>
                        </div>

                        <div className="text-sm font-medium mb-1">{getEventDescription(event)}</div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>By {formatAddress(event.user)}</span>
                          <span>•</span>
                          <span>Block {event.blockNumber.toLocaleString()}</span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEtherscan(event.transactionHash)}
                        className="flex-shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="mine" className="mt-4">
            <ScrollArea className="h-96">
              {!address ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Connect your wallet to view your transactions</p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions found for your address</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0">{getEventIcon(event.type)}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={`text-xs ${getEventColor(event.type)}`}>
                            {event.type.replace(/([A-Z])/g, " $1").trim()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(event.timestamp)}</span>
                        </div>

                        <div className="text-sm font-medium mb-1">{getEventDescription(event)}</div>

                        <div className="text-xs text-muted-foreground">Tx: {formatTxHash(event.transactionHash)}</div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEtherscan(event.transactionHash)}
                        className="flex-shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
