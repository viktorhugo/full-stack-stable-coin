"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, AlertTriangle, CheckCircle, Zap } from "lucide-react"
import { walletManager, formatAddress, type WalletState } from "@/lib/wallet"
import { CONTRACT_CONFIG } from "@/lib/config"

export function WalletConnect() {
  const [walletState, setWalletState] = useState<WalletState>(walletManager.getState())
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    const unsubscribe = walletManager.subscribe(setWalletState)
    return unsubscribe
  }, [])

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await walletManager.connectMetaMask()
    } catch (error) {
      console.error("Connection failed:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSwitchNetwork = async () => {
    await walletManager.switchNetwork()
  }

  const handleDisconnect = () => {
    walletManager.disconnect()
  }

  const isCorrectNetwork = walletManager.isCorrectNetwork()
  const targetNetwork = Object.values(CONTRACT_CONFIG.NETWORKS).find(
    (n) => n.chainId === CONTRACT_CONFIG.TARGET_NETWORK,
  )

  if (!walletState.isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto cyber-card glow-effect">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-6 neon-border animate-pulse">
            <Wallet className="w-8 h-8 text-primary drop-shadow-lg" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Connect Wallet
          </CardTitle>
          <CardDescription className="text-base">Connect your wallet to interact with DSC Protocol</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
            size="lg"
          >
            {isConnecting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Connecting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Connect MetaMask
              </div>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground bg-muted/10 p-3 rounded-lg border border-muted/20">
            Make sure you have MetaMask installed and are on{" "}
            <span className="text-primary font-semibold">{targetNetwork?.name}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto cyber-card glow-effect">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center neon-border">
              <Wallet className="w-6 h-6 text-primary drop-shadow-lg" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Wallet Connected</CardTitle>
              <CardDescription className="font-mono text-sm bg-muted/20 px-2 py-1 rounded border border-primary/20">
                {formatAddress(walletState.address!)}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={isCorrectNetwork ? "default" : "destructive"}
            className={`${isCorrectNetwork ? "bg-primary/20 text-primary border-primary/30 shadow-primary/20" : ""} shadow-lg`}
          >
            {isCorrectNetwork ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
            {isCorrectNetwork ? "Connected" : "Wrong Network"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isCorrectNetwork && (
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please switch to <span className="font-semibold">{targetNetwork?.name}</span> to use the DApp
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          {!isCorrectNetwork && (
            <Button
              onClick={handleSwitchNetwork}
              variant="outline"
              className="flex-1 bg-transparent border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
            >
              Switch Network
            </Button>
          )}
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="flex-1 bg-transparent border-muted/30 hover:bg-muted/10 hover:border-muted/50 transition-all duration-300"
          >
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
