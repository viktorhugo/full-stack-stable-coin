"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Loader2, MinusCircle, AlertTriangle, Info } from "lucide-react"
import { dscService } from "@/lib/contract-service"
import { useDscPosition } from "@/lib/hooks/use-dsc-position"
import { useToast } from "@/hooks/use-toast"
import {
  formatTokenAmount,
  formatUsdValue,
  parseTokenInput,
  validateNumericInput,
  formatHealthFactor,
  getHealthFactorStatus,
} from "@/lib/utils/formatting"

export function RedeemCollateralForm() {
  const [selectedToken, setSelectedToken] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [maxRedeemable, setMaxRedeemable] = useState<bigint>(0n)
  const [newHealthFactor, setNewHealthFactor] = useState<bigint>(0n)
  const [estimatedValue, setEstimatedValue] = useState<bigint>(0n)

  const { position, refresh } = useDscPosition()
  const { toast } = useToast()

  // Set initial token when position loads
  useEffect(() => {
    if (position && position.collateralBalances.length > 0 && !selectedToken) {
      setSelectedToken(position.collateralBalances[0].token)
    }
  }, [position, selectedToken])

  // Calculate estimates when amount or token changes
  useEffect(() => {
    const calculateEstimates = async () => {
      if (!selectedToken || !amount || !validateNumericInput(amount) || !position) {
        setEstimatedValue(0n)
        setNewHealthFactor(0n)
        return
      }

      try {
        const tokenAmount = parseTokenInput(amount)
        const usdValue = await dscService.calculateUsdValue(selectedToken, tokenAmount)
        setEstimatedValue(usdValue)

        // Calculate new health factor
        const newCollateralValue = position.collateralValueInUsd - usdValue
        if (position.totalDscMinted > 0n && newCollateralValue > 0n) {
          // Simplified health factor calculation
          const newHealthFactor = (newCollateralValue * 100n) / (position.totalDscMinted * 150n)
          setNewHealthFactor(newHealthFactor)
        } else {
          setNewHealthFactor(0n)
        }
      } catch (error) {
        console.error("Failed to calculate estimates:", error)
      }
    }

    calculateEstimates()
  }, [selectedToken, amount, position])

  // Calculate maximum redeemable amount
  useEffect(() => {
    if (!position || !selectedToken) {
      setMaxRedeemable(0n)
      return
    }

    const collateral = position.collateralBalances.find((c) => c.token === selectedToken)
    if (!collateral) {
      setMaxRedeemable(0n)
      return
    }

    // If no DSC minted, can redeem all
    if (position.totalDscMinted === 0n) {
      setMaxRedeemable(collateral.balance)
      return
    }

    // Calculate max redeemable while maintaining 150% collateralization
    const requiredCollateral = (position.totalDscMinted * 150n) / 100n
    const excessCollateral = position.collateralValueInUsd - requiredCollateral

    if (excessCollateral <= 0n) {
      setMaxRedeemable(0n)
      return
    }

    // Convert excess USD to token amount
    const maxRedeemableInTokens = Math.min(
      Number(collateral.balance),
      (Number(excessCollateral) / Number(collateral.pricePerToken)) * 1e18,
    )

    setMaxRedeemable(BigInt(Math.floor(maxRedeemableInTokens)))
  }, [position, selectedToken])

  const handleRedeem = async () => {
    if (!selectedToken || !amount || !validateNumericInput(amount)) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    const tokenAmount = parseTokenInput(amount)
    if (tokenAmount > maxRedeemable) {
      toast({
        title: "Amount Too High",
        description: "Cannot redeem more than the maximum allowed amount",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await dscService.redeemCollateral(selectedToken, tokenAmount)

      if (result.success) {
        toast({
          title: "Redemption Successful",
          description: `Successfully redeemed ${amount} ${getTokenSymbol(selectedToken)}`,
        })
        setAmount("")
        refresh()
      } else {
        toast({
          title: "Redemption Failed",
          description: result.error || "Transaction failed",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Redemption Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMaxClick = () => {
    if (maxRedeemable > 0n) {
      setAmount(formatTokenAmount(maxRedeemable, 18, 6))
    }
  }

  const handleSliderChange = (value: number[]) => {
    if (maxRedeemable > 0n) {
      const percentage = value[0] / 100
      const sliderAmount = (maxRedeemable * BigInt(Math.floor(percentage * 100))) / 100n
      setAmount(formatTokenAmount(sliderAmount, 18, 6))
    }
  }

  const getTokenSymbol = (address: string): string => {
    if (!position) return "TOKEN"
    const collateral = position.collateralBalances.find((c) => c.token === address)
    return collateral?.tokenSymbol || "TOKEN"
  }

  const selectedCollateral = position?.collateralBalances.find((c) => c.token === selectedToken)
  const isValidAmount = validateNumericInput(amount)
  const newHealthStatus = newHealthFactor > 0n ? getHealthFactorStatus(newHealthFactor) : "safe"
  const sliderValue = maxRedeemable > 0n ? (parseTokenInput(amount || "0") * 100n) / maxRedeemable : 0n

  if (!position || position.collateralBalances.length === 0) {
    return (
      <div className="text-center py-8">
        <MinusCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Collateral to Redeem</h3>
        <p className="text-muted-foreground">Deposit collateral first to enable redemption</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <MinusCircle className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold">Redeem Collateral</h3>
      </div>

      <div className="space-y-4">
        {/* Token Selection */}
        <div className="space-y-2">
          <Label htmlFor="token-select">Select Collateral Token</Label>
          <Select value={selectedToken} onValueChange={setSelectedToken}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a token to redeem" />
            </SelectTrigger>
            <SelectContent>
              {position.collateralBalances.map((collateral) => (
                <SelectItem key={collateral.token} value={collateral.token}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-accent">{collateral.tokenSymbol.slice(0, 2)}</span>
                    </div>
                    <span>{collateral.tokenSymbol}</span>
                    <span className="text-muted-foreground text-sm">
                      ({formatTokenAmount(collateral.balance)} available)
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Balance */}
        {selectedCollateral && (
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Available Balance:</span>
                <div className="text-right">
                  <div className="font-medium">
                    {formatTokenAmount(selectedCollateral.balance)} {selectedCollateral.tokenSymbol}
                  </div>
                  <div className="text-sm text-muted-foreground">{formatUsdValue(selectedCollateral.valueInUsd)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="amount">Amount</Label>
            <Button variant="ghost" size="sm" onClick={handleMaxClick} className="h-auto p-1 text-xs">
              MAX: {formatTokenAmount(maxRedeemable, 18, 4)}
            </Button>
          </div>
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

        {/* Slider */}
        {maxRedeemable > 0n && (
          <div className="space-y-2">
            <Label className="text-sm">Quick Select</Label>
            <Slider
              value={[Number(sliderValue)]}
              onValueChange={handleSliderChange}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Estimated Values */}
        {isValidAmount && estimatedValue > 0n && (
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You will receive:</span>
                <span className="font-medium">{formatUsdValue(estimatedValue)}</span>
              </div>
              {newHealthFactor > 0n && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">New Health Factor:</span>
                  <span
                    className={`font-medium ${
                      newHealthStatus === "safe"
                        ? "text-green-600"
                        : newHealthStatus === "warning"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {formatHealthFactor(newHealthFactor)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Warnings */}
        {newHealthStatus === "danger" || newHealthStatus === "liquidation" ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This redemption would put your position at risk of liquidation. Consider redeeming less or burning some
              DSC first.
            </AlertDescription>
          </Alert>
        ) : maxRedeemable === 0n && position.totalDscMinted > 0n ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You cannot redeem collateral while maintaining the minimum 150% collateralization ratio. Burn some DSC
              first to free up collateral.
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Submit Button */}
        <Button
          onClick={handleRedeem}
          disabled={!isValidAmount || isLoading || !selectedToken || maxRedeemable === 0n}
          className="w-full"
          variant={newHealthStatus === "danger" || newHealthStatus === "liquidation" ? "destructive" : "default"}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Redeeming...
            </>
          ) : (
            <>
              <MinusCircle className="w-4 h-4 mr-2" />
              Redeem Collateral
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
