"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Loader2, Coins, AlertTriangle, Info } from "lucide-react"
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

export function MintDscForm() {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [maxMintable, setMaxMintable] = useState<bigint>(0n)
  const [newHealthFactor, setNewHealthFactor] = useState<bigint>(0n)

  const { position, refresh, address } = useDscPosition()
  const { toast } = useToast()

  // Calculate maximum mintable DSC
  useEffect(() => {
    const calculateMaxMintable = async () => {
      if (!address || !position) {
        setMaxMintable(0n)
        return
      }

      try {
        const maxMintableDsc = await dscService.getMaxMintableDsc(address)
        setMaxMintable(maxMintableDsc)
      } catch (error) {
        console.error("Failed to calculate max mintable DSC:", error)
        setMaxMintable(0n)
      }
    }

    calculateMaxMintable()
  }, [address, position])

  // Calculate new health factor when amount changes
  useEffect(() => {
    if (!amount || !validateNumericInput(amount) || !position) {
      setNewHealthFactor(0n)
      return
    }

    try {
      const dscAmount = parseTokenInput(amount)
      const newTotalDsc = position.totalDscMinted + dscAmount

      if (newTotalDsc > 0n && position.collateralValueInUsd > 0n) {
        // Simplified health factor calculation (collateral value / (DSC minted * 1.5))
        const newHealthFactor = (position.collateralValueInUsd * 100n) / (newTotalDsc * 150n)
        setNewHealthFactor(newHealthFactor)
      }
    } catch (error) {
      console.error("Failed to calculate new health factor:", error)
    }
  }, [amount, position])

  const handleMint = async () => {
    if (!amount || !validateNumericInput(amount)) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    const dscAmount = parseTokenInput(amount)
    if (dscAmount > maxMintable) {
      toast({
        title: "Amount Too High",
        description: "Cannot mint more than the maximum allowed amount",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await dscService.mintDsc(dscAmount)

      if (result.success) {
        toast({
          title: "Mint Successful",
          description: `Successfully minted ${amount} DSC`,
        })
        setAmount("")
        refresh()
      } else {
        toast({
          title: "Mint Failed",
          description: result.error || "Transaction failed",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Mint Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMaxClick = () => {
    if (maxMintable > 0n) {
      setAmount(formatTokenAmount(maxMintable, 18, 6))
    }
  }

  const handleSliderChange = (value: number[]) => {
    if (maxMintable > 0n) {
      const percentage = value[0] / 100
      const sliderAmount = (maxMintable * BigInt(Math.floor(percentage * 100))) / 100n
      setAmount(formatTokenAmount(sliderAmount, 18, 6))
    }
  }

  const isValidAmount = validateNumericInput(amount)
  const newHealthStatus = newHealthFactor > 0n ? getHealthFactorStatus(newHealthFactor) : "safe"
  const sliderValue = maxMintable > 0n ? (parseTokenInput(amount || "0") * 100n) / maxMintable : 0n

  if (!position || position.collateralValueInUsd === 0n) {
    return (
      <div className="text-center py-8">
        <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Collateral Available</h3>
        <p className="text-muted-foreground">Deposit collateral first to mint DSC tokens</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Coins className="w-5 h-5 text-secondary" />
        <h3 className="text-lg font-semibold">Mint DSC</h3>
      </div>

      <div className="space-y-4">
        {/* Current Position Info */}
        <Card className="bg-muted/30">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Available Collateral:</span>
              <span className="font-medium">${formatTokenAmount(position.collateralValueInUsd, 18, 2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current DSC Minted:</span>
              <span className="font-medium">{formatTokenAmount(position.totalDscMinted)} DSC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Health Factor:</span>
              <span className="font-medium">{formatHealthFactor(position.healthFactor)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="amount">DSC Amount to Mint</Label>
            <Button variant="ghost" size="sm" onClick={handleMaxClick} className="h-auto p-1 text-xs">
              MAX: {formatTokenAmount(maxMintable, 18, 4)}
            </Button>
          </div>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-16"
              step="any"
              min="0"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">DSC</div>
          </div>
        </div>

        {/* Slider */}
        {maxMintable > 0n && (
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

        {/* Impact Preview */}
        {isValidAmount && newHealthFactor > 0n && (
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You will receive:</span>
                <span className="font-medium">{amount} DSC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">New Total DSC:</span>
                <span className="font-medium">
                  {formatTokenAmount(position.totalDscMinted + parseTokenInput(amount))} DSC
                </span>
              </div>
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
            </CardContent>
          </Card>
        )}

        {/* Warnings */}
        {newHealthStatus === "danger" || newHealthStatus === "liquidation" ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This mint would put your position at risk of liquidation. Consider minting less or adding more collateral.
            </AlertDescription>
          </Alert>
        ) : newHealthStatus === "warning" ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This mint will lower your health factor significantly. Monitor your position closely.
            </AlertDescription>
          </Alert>
        ) : maxMintable === 0n ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You cannot mint DSC while maintaining the minimum 150% collateralization ratio. Add more collateral to
              mint DSC.
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Submit Button */}
        <Button
          onClick={handleMint}
          disabled={!isValidAmount || isLoading || maxMintable === 0n}
          className="w-full"
          variant={newHealthStatus === "danger" || newHealthStatus === "liquidation" ? "destructive" : "default"}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Minting...
            </>
          ) : (
            <>
              <Coins className="w-4 h-4 mr-2" />
              Mint DSC
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
