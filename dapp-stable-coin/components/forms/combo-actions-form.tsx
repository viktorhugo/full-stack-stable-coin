"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Zap, PlusCircle, MinusCircle, AlertTriangle } from "lucide-react"
import { dscService } from "@/lib/contract-service"
import { useDscPosition } from "@/lib/hooks/use-dsc-position"
import { useToast } from "@/hooks/use-toast"
import {
  formatTokenAmount,
  parseTokenInput,
  validateNumericInput,
  formatHealthFactor,
  getHealthFactorStatus,
} from "@/lib/utils/formatting"
import type { CollateralToken } from "@/lib/types"

export function ComboActionsForm() {
  const [activeCombo, setActiveCombo] = useState("deposit-mint")
  const [selectedToken, setSelectedToken] = useState<string>("")
  const [collateralAmount, setCollateralAmount] = useState("")
  const [dscAmount, setDscAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [collateralTokens, setCollateralTokens] = useState<CollateralToken[]>([])
  const [estimatedHealthFactor, setEstimatedHealthFactor] = useState<bigint>(0n)

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

  // Calculate estimated health factor
  useEffect(() => {
    const calculateEstimates = async () => {
      if (!validateNumericInput(collateralAmount) || !validateNumericInput(dscAmount) || !selectedToken) {
        setEstimatedHealthFactor(0n)
        return
      }

      try {
        const collateralAmountBig = parseTokenInput(collateralAmount)
        const dscAmountBig = parseTokenInput(dscAmount)
        const collateralValue = await dscService.calculateUsdValue(selectedToken, collateralAmountBig)

        let newCollateralValue = collateralValue
        let newDscMinted = dscAmountBig

        if (position) {
          if (activeCombo === "deposit-mint") {
            newCollateralValue = position.collateralValueInUsd + collateralValue
            newDscMinted = position.totalDscMinted + dscAmountBig
          } else if (activeCombo === "redeem-burn") {
            newCollateralValue = position.collateralValueInUsd - collateralValue
            newDscMinted = position.totalDscMinted - dscAmountBig
          }
        }

        if (newDscMinted > 0n && newCollateralValue > 0n) {
          const healthFactor = (newCollateralValue * 100n) / (newDscMinted * 150n)
          setEstimatedHealthFactor(healthFactor)
        } else if (newDscMinted === 0n) {
          setEstimatedHealthFactor(parseTokenInput("999999"))
        }
      } catch (error) {
        console.error("Failed to calculate estimates:", error)
      }
    }

    calculateEstimates()
  }, [collateralAmount, dscAmount, selectedToken, activeCombo, position])

  const handleDepositAndMint = async () => {
    if (!validateNumericInput(collateralAmount) || !validateNumericInput(dscAmount) || !selectedToken) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid amounts for both collateral and DSC",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const collateralAmountBig = parseTokenInput(collateralAmount)
      const dscAmountBig = parseTokenInput(dscAmount)

      const result = await dscService.depositCollateralAndMintDsc(selectedToken, collateralAmountBig, dscAmountBig)

      if (result.success) {
        toast({
          title: "Combo Action Successful",
          description: `Deposited ${collateralAmount} ${getTokenSymbol(selectedToken)} and minted ${dscAmount} DSC`,
        })
        setCollateralAmount("")
        setDscAmount("")
        refresh()
      } else {
        toast({
          title: "Combo Action Failed",
          description: result.error || "Transaction failed",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Combo Action Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRedeemAndBurn = async () => {
    if (!validateNumericInput(collateralAmount) || !validateNumericInput(dscAmount) || !selectedToken) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid amounts for both collateral and DSC",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const collateralAmountBig = parseTokenInput(collateralAmount)
      const dscAmountBig = parseTokenInput(dscAmount)

      const result = await dscService.redeemCollateralForDsc(selectedToken, collateralAmountBig, dscAmountBig)

      if (result.success) {
        toast({
          title: "Combo Action Successful",
          description: `Redeemed ${collateralAmount} ${getTokenSymbol(selectedToken)} and burned ${dscAmount} DSC`,
        })
        setCollateralAmount("")
        setDscAmount("")
        refresh()
      } else {
        toast({
          title: "Combo Action Failed",
          description: result.error || "Transaction failed",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Combo Action Failed",
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

  const isValidInputs = validateNumericInput(collateralAmount) && validateNumericInput(dscAmount)
  const healthStatus = estimatedHealthFactor > 0n ? getHealthFactorStatus(estimatedHealthFactor) : "safe"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-chart-5" />
        <h3 className="text-lg font-semibold">Combo Actions</h3>
      </div>

      <Tabs value={activeCombo} onValueChange={setActiveCombo}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deposit-mint" className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Deposit + Mint
          </TabsTrigger>
          <TabsTrigger value="redeem-burn" className="flex items-center gap-2">
            <MinusCircle className="w-4 h-4" />
            Redeem + Burn
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit-mint" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deposit Collateral & Mint DSC</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Token Selection */}
              <div className="space-y-2">
                <Label>Collateral Token</Label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a token" />
                  </SelectTrigger>
                  <SelectContent>
                    {collateralTokens.map((token) => (
                      <SelectItem key={token.address} value={token.address}>
                        {token.symbol} - {token.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Collateral Amount */}
              <div className="space-y-2">
                <Label>Collateral Amount</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={collateralAmount}
                    onChange={(e) => setCollateralAmount(e.target.value)}
                    className="pr-20"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {getTokenSymbol(selectedToken)}
                  </div>
                </div>
              </div>

              {/* DSC Amount */}
              <div className="space-y-2">
                <Label>DSC to Mint</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={dscAmount}
                    onChange={(e) => setDscAmount(e.target.value)}
                    className="pr-16"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">DSC</div>
                </div>
              </div>

              {/* Submit Button */}
              <Button onClick={handleDepositAndMint} disabled={!isValidInputs || isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Deposit & Mint
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redeem-burn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Redeem Collateral & Burn DSC</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Token Selection */}
              <div className="space-y-2">
                <Label>Collateral Token</Label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a token" />
                  </SelectTrigger>
                  <SelectContent>
                    {position?.collateralBalances.map((collateral) => (
                      <SelectItem key={collateral.token} value={collateral.token}>
                        {collateral.tokenSymbol} - {formatTokenAmount(collateral.balance)} available
                      </SelectItem>
                    )) || (
                      <SelectItem value="" disabled>
                        No collateral available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Collateral Amount */}
              <div className="space-y-2">
                <Label>Collateral Amount to Redeem</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={collateralAmount}
                    onChange={(e) => setCollateralAmount(e.target.value)}
                    className="pr-20"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {getTokenSymbol(selectedToken)}
                  </div>
                </div>
              </div>

              {/* DSC Amount */}
              <div className="space-y-2">
                <Label>DSC to Burn</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={dscAmount}
                    onChange={(e) => setDscAmount(e.target.value)}
                    className="pr-16"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">DSC</div>
                </div>
              </div>

              {/* Submit Button */}
              <Button onClick={handleRedeemAndBurn} disabled={!isValidInputs || isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Redeem & Burn
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Health Factor Preview */}
      {isValidInputs && estimatedHealthFactor > 0n && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estimated Health Factor:</span>
              <span
                className={`font-medium ${
                  healthStatus === "safe"
                    ? "text-green-600"
                    : healthStatus === "warning"
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {estimatedHealthFactor > parseTokenInput("1000") ? "∞" : formatHealthFactor(estimatedHealthFactor)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {healthStatus === "danger" || healthStatus === "liquidation" ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This combo action would put your position at risk of liquidation. Adjust the amounts to maintain a safe
            health factor.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
