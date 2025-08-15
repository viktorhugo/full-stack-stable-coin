"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Target, AlertTriangle, TrendingUp, Search, Zap } from "lucide-react"
import { dscService } from "@/lib/contract-service"
import { useDscPosition } from "@/lib/hooks/use-dsc-position"
import { useToast } from "@/hooks/use-toast"
import {
  formatTokenAmount,
  formatUsdValue,
  parseTokenInput,
  validateNumericInput,
  formatHealthFactor,
  formatAddress,
} from "@/lib/utils/formatting"
import type { LiquidationTarget } from "@/lib/types"

export function LiquidationForm() {
  const [activeTab, setActiveTab] = useState("manual")
  const [targetUser, setTargetUser] = useState("")
  const [selectedCollateral, setSelectedCollateral] = useState("")
  const [debtToCover, setDebtToCover] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [liquidationTargets, setLiquidationTargets] = useState<LiquidationTarget[]>([])
  const [selectedTarget, setSelectedTarget] = useState<LiquidationTarget | null>(null)
  const [estimatedReward, setEstimatedReward] = useState<bigint>(0n)

  const { position, refresh } = useDscPosition()
  const { toast } = useToast()

  // Mock function to find liquidatable positions (in real implementation, this would query events or subgraph)
  const findLiquidatablePositions = async (): Promise<LiquidationTarget[]> => {
    // This is a mock implementation. In reality, you would:
    // 1. Query blockchain events for user positions
    // 2. Check health factors for each position
    // 3. Return positions with health factor < 1.0

    const mockTargets: LiquidationTarget[] = [
      {
        user: "0x1234567890123456789012345678901234567890",
        healthFactor: parseTokenInput("0.85"),
        totalDebt: parseTokenInput("1000"),
        collateralValue: parseTokenInput("1200"),
        collateralTokens: [
          {
            token: "0xA0b86a33E6441E8C8C7014b0C112D4d1c0C8E8B8",
            tokenName: "Wrapped Ether",
            tokenSymbol: "WETH",
            balance: parseTokenInput("0.5"),
            valueInUsd: parseTokenInput("1200"),
            pricePerToken: parseTokenInput("2400"),
          },
        ],
      },
      {
        user: "0x2345678901234567890123456789012345678901",
        healthFactor: parseTokenInput("0.92"),
        totalDebt: parseTokenInput("500"),
        collateralValue: parseTokenInput("650"),
        collateralTokens: [
          {
            token: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            tokenName: "Wrapped Bitcoin",
            tokenSymbol: "WBTC",
            balance: parseTokenInput("0.01"),
            valueInUsd: parseTokenInput("650"),
            pricePerToken: parseTokenInput("65000"),
          },
        ],
      },
    ]

    return mockTargets
  }

  // Search for liquidatable positions
  const handleSearchPositions = async () => {
    setIsSearching(true)
    try {
      const targets = await findLiquidatablePositions()
      setLiquidationTargets(targets)

      if (targets.length === 0) {
        toast({
          title: "No Liquidatable Positions",
          description: "No positions found with health factor below 1.0",
        })
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Failed to find liquidatable positions",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Calculate estimated liquidation reward
  useEffect(() => {
    const calculateReward = async () => {
      if (!validateNumericInput(debtToCover) || !selectedCollateral) {
        setEstimatedReward(0n)
        return
      }

      try {
        const debtAmount = parseTokenInput(debtToCover)
        // Liquidation bonus is typically 10% (this would come from the contract)
        const bonus = debtAmount / 10n // 10% bonus
        const totalReward = debtAmount + bonus

        // Convert to collateral token amount
        const collateralReward = await dscService.calculateTokenAmount(selectedCollateral, totalReward)
        setEstimatedReward(collateralReward)
      } catch (error) {
        console.error("Failed to calculate liquidation reward:", error)
      }
    }

    calculateReward()
  }, [debtToCover, selectedCollateral])

  const handleLiquidate = async () => {
    if (!targetUser || !selectedCollateral || !validateNumericInput(debtToCover)) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const debtAmount = parseTokenInput(debtToCover)
      const result = await dscService.liquidate(selectedCollateral, targetUser, debtAmount)

      if (result.success) {
        toast({
          title: "Liquidation Successful",
          description: `Successfully liquidated ${debtToCover} DSC debt from ${formatAddress(targetUser)}`,
        })
        setTargetUser("")
        setDebtToCover("")
        refresh()
      } else {
        toast({
          title: "Liquidation Failed",
          description: result.error || "Transaction failed",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Liquidation Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTargetSelect = (target: LiquidationTarget) => {
    setSelectedTarget(target)
    setTargetUser(target.user)
    if (target.collateralTokens.length > 0) {
      setSelectedCollateral(target.collateralTokens[0].token)
    }
    // Set debt to cover to 50% of total debt by default
    setDebtToCover(formatTokenAmount(target.totalDebt / 2n, 18, 6))
    setActiveTab("manual")
  }

  const getCollateralOptions = () => {
    if (selectedTarget) {
      return selectedTarget.collateralTokens
    }
    // In a real implementation, you would get this from the contract
    return [
      {
        token: "0xA0b86a33E6441E8C8C7014b0C112D4d1c0C8E8B8",
        tokenName: "Wrapped Ether",
        tokenSymbol: "WETH",
        balance: 0n,
        valueInUsd: 0n,
        pricePerToken: 0n,
      },
      {
        token: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        tokenName: "Wrapped Bitcoin",
        tokenSymbol: "WBTC",
        balance: 0n,
        valueInUsd: 0n,
        pricePerToken: 0n,
      },
    ]
  }

  const isValidInputs = targetUser && selectedCollateral && validateNumericInput(debtToCover)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-destructive" />
        <h3 className="text-lg font-semibold">Liquidation System</h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Find Targets
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Manual Liquidation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Liquidatable Positions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleSearchPositions} disabled={isSearching} className="w-full">
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Find Liquidatable Positions
                  </>
                )}
              </Button>

              {liquidationTargets.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Liquidatable Positions Found:</h4>
                  {liquidationTargets.map((target, index) => (
                    <Card key={index} className="border-destructive/20 bg-destructive/5">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-mono text-sm">{formatAddress(target.user)}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="destructive" className="text-xs">
                                Health Factor: {formatHealthFactor(target.healthFactor)}
                              </Badge>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => handleTargetSelect(target)}>
                            Select
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total Debt:</span>
                            <div className="font-medium">{formatTokenAmount(target.totalDebt)} DSC</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Collateral Value:</span>
                            <div className="font-medium">{formatUsdValue(target.collateralValue)}</div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <span className="text-muted-foreground text-sm">Collateral:</span>
                          <div className="flex gap-2 mt-1">
                            {target.collateralTokens.map((collateral, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {formatTokenAmount(collateral.balance)} {collateral.tokenSymbol}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manual Liquidation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Target User Address */}
              <div className="space-y-2">
                <Label htmlFor="target-user">Target User Address</Label>
                <Input
                  id="target-user"
                  placeholder="0x..."
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  className="font-mono"
                />
              </div>

              {/* Collateral Token Selection */}
              <div className="space-y-2">
                <Label>Collateral Token to Receive</Label>
                <Select value={selectedCollateral} onValueChange={setSelectedCollateral}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose collateral token" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCollateralOptions().map((collateral) => (
                      <SelectItem key={collateral.token} value={collateral.token}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-destructive/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-destructive">
                              {collateral.tokenSymbol.slice(0, 2)}
                            </span>
                          </div>
                          <span>{collateral.tokenSymbol}</span>
                          <span className="text-muted-foreground text-sm">({collateral.tokenName})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Debt to Cover */}
              <div className="space-y-2">
                <Label htmlFor="debt-amount">DSC Debt to Cover</Label>
                <div className="relative">
                  <Input
                    id="debt-amount"
                    type="number"
                    placeholder="0.0"
                    value={debtToCover}
                    onChange={(e) => setDebtToCover(e.target.value)}
                    className="pr-16"
                    step="any"
                    min="0"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">DSC</div>
                </div>
              </div>

              {/* Estimated Reward */}
              {estimatedReward > 0n && selectedCollateral && (
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-600">Estimated Liquidation Reward</span>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {formatTokenAmount(estimatedReward)}{" "}
                      {getCollateralOptions().find((c) => c.token === selectedCollateral)?.tokenSymbol}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Includes 10% liquidation bonus</div>
                  </CardContent>
                </Card>
              )}

              {/* Warnings */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Only positions with health factor below 1.0 can be liquidated. Make sure you have enough DSC tokens to
                  cover the debt.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button
                onClick={handleLiquidate}
                disabled={!isValidInputs || isLoading}
                className="w-full"
                variant="destructive"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Liquidating...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Liquidate Position
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">How Liquidation Works</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Find positions with health factor below 1.0</li>
            <li>• Pay off part of their DSC debt</li>
            <li>• Receive their collateral + 10% liquidation bonus</li>
            <li>• Help maintain protocol stability</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
