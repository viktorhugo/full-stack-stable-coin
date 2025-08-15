"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, PlusCircle, AlertTriangle } from "lucide-react"
import { dscService } from "@/lib/contract-service"
import { useDscPosition } from "@/lib/hooks/use-dsc-position"
import { useToast } from "@/hooks/use-toast"
import { formatUsdValue, parseTokenInput, validateNumericInput, formatHealthFactor } from "@/lib/utils/formatting"
import type { CollateralToken } from "@/lib/types"

export function DepositCollateralForm() {
  const [selectedToken, setSelectedToken] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [collateralTokens, setCollateralTokens] = useState<CollateralToken[]>([])
  const [estimatedValue, setEstimatedValue] = useState<bigint>(0n)
  const [newHealthFactor, setNewHealthFactor] = useState<bigint>(0n)

  const { position, refresh } = useDscPosition()
  const { toast } = useToast()

  // Load collateral tokens
  useEffect(() => {
    const loadTokens = async () => {
      try {
        await dscService.initialize()
        const tokens = dscService.getCollateralTokens()
        setCollateralTokens(tokens)
        if (tokens.length > 0 && !selectedToken) {
          setSelectedToken(tokens[0].address)
        }
      } catch (error) {
        console.error("Failed to load collateral tokens:", error)
      }
    }
    loadTokens()
  }, [selectedToken])

  // Calculate estimated values when amount or token changes
  useEffect(() => {
    const calculateEstimates = async () => {
      if (!selectedToken || !amount || !validateNumericInput(amount)) {
        setEstimatedValue(0n)
        setNewHealthFactor(0n)
        return
      }

      try {
        const tokenAmount = parseTokenInput(amount)
        const usdValue = await dscService.calculateUsdValue(selectedToken, tokenAmount)
        setEstimatedValue(usdValue)

        // Calculate new health factor if user has existing position
        if (position) {
          const newCollateralValue = position.collateralValueInUsd + usdValue
          if (position.totalDscMinted > 0n) {
            // Simplified health factor calculation (actual formula may differ)
            const newHealthFactor = (newCollateralValue * 100n) / (position.totalDscMinted * 150n)
            setNewHealthFactor(newHealthFactor)
          }
        }
      } catch (error) {
        console.error("Failed to calculate estimates:", error)
      }
    }

    calculateEstimates()
  }, [selectedToken, amount, position])

  const handleDeposit = async () => {
    if (!selectedToken || !amount || !validateNumericInput(amount)) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const tokenAmount = parseTokenInput(amount)
      const result = await dscService.depositCollateral(selectedToken, tokenAmount)

      if (result.success) {
        toast({
          title: "Deposit Successful",
          description: `Successfully deposited ${amount} ${getTokenSymbol(selectedToken)}`,
        })
        setAmount("")
        refresh()
      } else {
        toast({
          title: "Deposit Failed",
          description: result.error || "Transaction failed",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Deposit Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTokenSymbol = (address: string): string => {
    const token = collateralTokens.find((t) => t.address === address)
    return token?.symbol || "TOKEN"
  }

  const getTokenName = (address: string): string => {
    const token = collateralTokens.find((t) => t.address === address)
    return token?.name || "Unknown Token"
  }

  const selectedTokenData = collateralTokens.find((t) => t.address === selectedToken)
  const isValidAmount = validateNumericInput(amount)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <PlusCircle className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Deposit Collateral</h3>
      </div>

      <div className="space-y-4">
        {/* Token Selection */}
        <div className="space-y-2">
          <Label htmlFor="token-select">Select Collateral Token</Label>
          <Select value={selectedToken} onValueChange={setSelectedToken}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a token to deposit" />
            </SelectTrigger>
            <SelectContent>
              {collateralTokens.map((token) => (
                <SelectItem key={token.address} value={token.address}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{token.symbol.slice(0, 2)}</span>
                    </div>
                    <span>{token.symbol}</span>
                    <span className="text-muted-foreground text-sm">({token.name})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-20"
              step="any"
              min="0"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {selectedToken ? getTokenSymbol(selectedToken) : "TOKEN"}
            </div>
          </div>
        </div>

        {/* Estimated Values */}
        {isValidAmount && estimatedValue > 0n && (
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated USD Value:</span>
                <span className="font-medium">{formatUsdValue(estimatedValue)}</span>
              </div>
              {position && newHealthFactor > 0n && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">New Health Factor:</span>
                  <span className="font-medium text-green-600">{formatHealthFactor(newHealthFactor)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction Fee:</span>
                <span className="font-medium">~$2-5 (Gas)</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warnings */}
        {selectedTokenData && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Make sure you have approved the DSC contract to spend your {selectedTokenData.symbol} tokens before
              depositing.
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button onClick={handleDeposit} disabled={!isValidAmount || isLoading || !selectedToken} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Depositing...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" />
              Deposit Collateral
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
