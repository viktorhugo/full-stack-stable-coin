"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Loader2, Flame, Info } from "lucide-react"
import { dscService } from "@/lib/contract-service"
import { useDscPosition } from "@/lib/hooks/use-dsc-position"
import { useToast } from "@/hooks/use-toast"
import { formatTokenAmount, parseTokenInput, validateNumericInput, formatHealthFactor } from "@/lib/utils/formatting"

export function BurnDscForm() {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [newHealthFactor, setNewHealthFactor] = useState<bigint>(0n)

  const { position, refresh } = useDscPosition()
  const { toast } = useToast()

  // Calculate new health factor when amount changes
  useEffect(() => {
    if (!amount || !validateNumericInput(amount) || !position) {
      setNewHealthFactor(0n)
      return
    }

    try {
      const dscAmount = parseTokenInput(amount)
      const newTotalDsc = position.totalDscMinted - dscAmount

      if (newTotalDsc > 0n && position.collateralValueInUsd > 0n) {
        // Simplified health factor calculation
        const newHealthFactor = (position.collateralValueInUsd * 100n) / (newTotalDsc * 150n)
        setNewHealthFactor(newHealthFactor)
      } else if (newTotalDsc === 0n) {
        // If all DSC is burned, health factor becomes infinite (represented as a large number)
        setNewHealthFactor(parseTokenInput("999999"))
      }
    } catch (error) {
      console.error("Failed to calculate new health factor:", error)
    }
  }, [amount, position])

  const handleBurn = async () => {
    if (!amount || !validateNumericInput(amount)) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    const dscAmount = parseTokenInput(amount)
    if (dscAmount > position!.totalDscMinted) {
      toast({
        title: "Amount Too High",
        description: "Cannot burn more DSC than you have minted",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await dscService.burnDsc(dscAmount)

      if (result.success) {
        toast({
          title: "Burn Successful",
          description: `Successfully burned ${amount} DSC`,
        })
        setAmount("")
        refresh()
      } else {
        toast({
          title: "Burn Failed",
          description: result.error || "Transaction failed",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Burn Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMaxClick = () => {
    if (position && position.totalDscMinted > 0n) {
      setAmount(formatTokenAmount(position.totalDscMinted, 18, 6))
    }
  }

  const handleSliderChange = (value: number[]) => {
    if (position && position.totalDscMinted > 0n) {
      const percentage = value[0] / 100
      const sliderAmount = (position.totalDscMinted * BigInt(Math.floor(percentage * 100))) / 100n
      setAmount(formatTokenAmount(sliderAmount, 18, 6))
    }
  }

  const isValidAmount = validateNumericInput(amount)
  const sliderValue =
    position && position.totalDscMinted > 0n ? (parseTokenInput(amount || "0") * 100n) / position.totalDscMinted : 0n

  if (!position || position.totalDscMinted === 0n) {
    return (
      <div className="text-center py-8">
        <Flame className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No DSC to Burn</h3>
        <p className="text-muted-foreground">Mint DSC tokens first to enable burning</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-chart-4" />
        <h3 className="text-lg font-semibold">Burn DSC</h3>
      </div>

      <div className="space-y-4">
        {/* Current Position Info */}
        <Card className="bg-muted/30">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">DSC Balance:</span>
              <span className="font-medium">{formatTokenAmount(position.totalDscMinted)} DSC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Health Factor:</span>
              <span className="font-medium">{formatHealthFactor(position.healthFactor)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Collateral Value:</span>
              <span className="font-medium">${formatTokenAmount(position.collateralValueInUsd, 18, 2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="amount">DSC Amount to Burn</Label>
            <Button variant="ghost" size="sm" onClick={handleMaxClick} className="h-auto p-1 text-xs">
              MAX: {formatTokenAmount(position.totalDscMinted, 18, 4)}
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

        {/* Impact Preview */}
        {isValidAmount && newHealthFactor > 0n && (
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">DSC to burn:</span>
                <span className="font-medium">{amount} DSC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining DSC:</span>
                <span className="font-medium">
                  {formatTokenAmount(position.totalDscMinted - parseTokenInput(amount))} DSC
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">New Health Factor:</span>
                <span className="font-medium text-green-600">
                  {newHealthFactor > parseTokenInput("1000") ? "∞" : formatHealthFactor(newHealthFactor)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Burning DSC improves your health factor and reduces liquidation risk. You can redeem more collateral after
            burning DSC.
          </AlertDescription>
        </Alert>

        {/* Submit Button */}
        <Button onClick={handleBurn} disabled={!isValidAmount || isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Burning...
            </>
          ) : (
            <>
              <Flame className="w-4 h-4 mr-2" />
              Burn DSC
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
