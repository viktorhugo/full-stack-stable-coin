"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, MinusCircle, Coins, Flame, Zap, Target } from "lucide-react"
import { DepositCollateralForm } from "@/components/forms/deposit-collateral-form"
import { RedeemCollateralForm } from "@/components/forms/redeem-collateral-form"
import { MintDscForm } from "@/components/forms/mint-dsc-form"
import { BurnDscForm } from "@/components/forms/burn-dsc-form"
import { ComboActionsForm } from "@/components/forms/combo-actions-form"
import { LiquidationForm } from "@/components/forms/liquidation-form"

interface ActionTabsProps {
  onActionSelect?: (action: string) => void
}

export function ActionTabs({ onActionSelect }: ActionTabsProps) {
  const [activeTab, setActiveTab] = useState("deposit")

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    onActionSelect?.(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Actions</CardTitle>
        <CardDescription>Manage your DSC position</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="deposit" className="text-xs">
              <PlusCircle className="w-3 h-3 mr-1" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="mint" className="text-xs">
              <Coins className="w-3 h-3 mr-1" />
              Mint
            </TabsTrigger>
            <TabsTrigger value="redeem" className="text-xs">
              <MinusCircle className="w-3 h-3 mr-1" />
              Redeem
            </TabsTrigger>
            <TabsTrigger value="burn" className="text-xs">
              <Flame className="w-3 h-3 mr-1" />
              Burn
            </TabsTrigger>
            <TabsTrigger value="combo" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Combo
            </TabsTrigger>
            <TabsTrigger value="liquidate" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              Liquidate
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="deposit" className="space-y-4">
              <DepositCollateralForm />
            </TabsContent>

            <TabsContent value="mint" className="space-y-4">
              <MintDscForm />
            </TabsContent>

            <TabsContent value="redeem" className="space-y-4">
              <RedeemCollateralForm />
            </TabsContent>

            <TabsContent value="burn" className="space-y-4">
              <BurnDscForm />
            </TabsContent>

            <TabsContent value="combo" className="space-y-4">
              <ComboActionsForm />
            </TabsContent>

            {/* Added liquidation form to the liquidate tab */}
            <TabsContent value="liquidate" className="space-y-4">
              <LiquidationForm />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
