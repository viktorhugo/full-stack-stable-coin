"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingDown, AlertTriangle, Shield, DollarSign, Activity, Zap } from "lucide-react"
import { useDscPosition } from "@/lib/hooks/use-dsc-position"
import {
  formatUsdValue,
  formatTokenAmount,
  formatHealthFactor,
  getHealthFactorColor,
  getHealthFactorStatus,
  calculateCollateralizationRatio,
} from "@/lib/utils/formatting"

export function PositionOverview() {
  const { position, loading, error, isConnected } = useDscPosition()

  if (!isConnected) {
    return (
      <Card className="border-muted/30 cyber-card">
        <CardHeader className="text-center py-16">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-muted/20 to-muted/5 rounded-full flex items-center justify-center mb-6 border border-muted/30">
            <Shield className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl text-muted-foreground">Connect Wallet</CardTitle>
          <CardDescription className="text-base">Connect your wallet to view your DSC position</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="cyber-card glow-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary animate-pulse" />
            Your Position
          </CardTitle>
          <CardDescription>Loading position data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="h-6 bg-gradient-to-r from-primary/20 to-transparent rounded animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-secondary/20 to-transparent rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gradient-to-r from-accent/20 to-transparent rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!position) {
    return (
      <Card className="border-dashed border-2 border-primary/30 cyber-card">
        <CardHeader className="text-center py-16">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-6 neon-border animate-pulse">
            <DollarSign className="w-8 h-8 text-primary drop-shadow-lg" />
          </div>
          <CardTitle className="text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            No Position Yet
          </CardTitle>
          <CardDescription className="text-base">Deposit collateral to start using DSC Protocol</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const healthFactorNum = Number(formatHealthFactor(position.healthFactor))
  const healthStatus = getHealthFactorStatus(position.healthFactor)
  const collateralizationRatio = calculateCollateralizationRatio(position.collateralValueInUsd, position.totalDscMinted)

  return (
    <div className="space-y-6">
      {/* Health Factor Alert */}
      {healthStatus === "danger" || healthStatus === "liquidation" ? (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/5 glow-effect">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {healthStatus === "liquidation"
              ? "⚠️ Your position is at risk of liquidation! Add collateral or burn DSC immediately."
              : "⚠️ Your health factor is low. Consider adding collateral or burning DSC to improve your position."}
          </AlertDescription>
        </Alert>
      ) : healthStatus === "warning" ? (
        <Alert className="border-yellow-500/30 bg-yellow-500/5">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="font-medium">
            Your health factor is getting low. Monitor your position closely.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Main Position Card */}
      <Card className="cyber-card glow-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary" />
                Your Position
              </CardTitle>
              <CardDescription className="text-base">Current DSC protocol position overview</CardDescription>
            </div>
            <Badge
              variant={healthStatus === "safe" ? "default" : healthStatus === "warning" ? "secondary" : "destructive"}
              className={`text-sm px-4 py-2 font-semibold shadow-lg ${
                healthStatus === "safe"
                  ? "bg-primary/20 text-primary border-primary/30 shadow-primary/20"
                  : healthStatus === "warning"
                    ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30 shadow-yellow-500/20"
                    : "shadow-destructive/20"
              }`}
            >
              {healthStatus === "safe" && <Shield className="w-3 h-3 mr-1" />}
              {healthStatus === "warning" && <TrendingDown className="w-3 h-3 mr-1" />}
              {(healthStatus === "danger" || healthStatus === "liquidation") && (
                <AlertTriangle className="w-3 h-3 mr-1" />
              )}
              {healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3 p-4 bg-gradient-to-br from-primary/5 to-transparent rounded-lg border border-primary/20">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Health Factor</div>
              <div className={`text-3xl font-bold ${getHealthFactorColor(position.healthFactor)} drop-shadow-lg`}>
                {formatHealthFactor(position.healthFactor)}
              </div>
              <Progress value={Math.min(healthFactorNum * 50, 100)} className="h-3 bg-muted/20" />
            </div>

            <div className="space-y-3 p-4 bg-gradient-to-br from-secondary/5 to-transparent rounded-lg border border-secondary/20">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Collateral Value</div>
              <div className="text-3xl font-bold text-primary drop-shadow-lg">
                {formatUsdValue(position.collateralValueInUsd)}
              </div>
              <div className="text-sm text-muted-foreground bg-muted/20 px-2 py-1 rounded">
                {position.collateralBalances.length} token{position.collateralBalances.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="space-y-3 p-4 bg-gradient-to-br from-accent/5 to-transparent rounded-lg border border-accent/20">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">DSC Minted</div>
              <div className="text-3xl font-bold text-secondary drop-shadow-lg">
                {formatTokenAmount(position.totalDscMinted)} DSC
              </div>
              <div className="text-sm text-muted-foreground bg-muted/20 px-2 py-1 rounded">
                {collateralizationRatio.toFixed(0)}% collateralized
              </div>
            </div>
          </div>

          {/* Collateral Breakdown */}
          {position.collateralBalances.length > 0 && (
            <div className="space-y-4">
              <div className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Collateral Breakdown
              </div>
              <div className="space-y-3">
                {position.collateralBalances.map((collateral, index) => (
                  /* Mejorando los elementos de colateral con efectos visuales */
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/10 to-transparent rounded-lg border border-muted/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center border border-primary/30">
                        <span className="text-sm font-bold text-primary">{collateral.tokenSymbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{collateral.tokenSymbol}</div>
                        <div className="text-sm text-muted-foreground">{collateral.tokenName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {formatTokenAmount(collateral.balance)} {collateral.tokenSymbol}
                      </div>
                      <div className="text-sm text-muted-foreground bg-muted/20 px-2 py-1 rounded">
                        {formatUsdValue(collateral.valueInUsd)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
