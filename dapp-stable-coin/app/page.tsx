"use client"

import { Navbar } from "@/components/navbar"
import { WalletConnect } from "@/components/wallet-connect"
import { PositionOverview } from "@/components/position-overview"
import { ActionTabs } from "@/components/action-tabs"
import { PriceFeed } from "@/components/price-feed"
import { TransactionHistory } from "@/components/transaction-history"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useDscPosition } from "@/lib/hooks/use-dsc-position"
import { ArrowRight, Shield, Zap, TrendingUp, DollarSign } from "lucide-react"

export default function Home() {
  const { isConnected } = useDscPosition()

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <Navbar />

      <div className="pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-lime-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-lime-400/8 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="text-center mb-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-lime-500/5 to-transparent blur-xl"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-lime-500/20 to-emerald-500/20 backdrop-blur-sm border border-lime-500/30 px-6 py-3 rounded-full mb-8 shadow-lg shadow-lime-500/10">
                <div className="w-3 h-3 bg-lime-400 rounded-full animate-ping"></div>
                <span className="text-lime-400 font-semibold tracking-wide">DECENTRALIZED STABLECOIN PROTOCOL</span>
                <div className="w-3 h-3 bg-lime-400 rounded-full animate-ping delay-500"></div>
              </div>

              <h1 className="text-6xl md:text-8xl font-black mb-6 relative">
                <span className="bg-gradient-to-r from-white via-lime-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-2xl">
                  DSC
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white via-lime-400 to-emerald-400 bg-clip-text text-transparent blur-sm opacity-50 -z-10">
                  DSC
                </div>
              </h1>

              <div className="text-2xl md:text-3xl font-bold text-lime-400 mb-4 tracking-wider">PROTOCOL</div>

              <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8">
                La próxima generación de{" "}
                <span className="text-lime-400 font-semibold">stablecoins descentralizadas</span>
                <br />
                con liquidación automática y respaldo cripto
              </p>

              {!isConnected && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-black font-bold px-8 py-4 rounded-xl shadow-lg shadow-lime-500/25 hover:shadow-lime-500/40 transition-all duration-300 transform hover:scale-105"
                  >
                    Comenzar Ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-lime-500/50 text-lime-400 hover:bg-lime-500/10 px-8 py-4 rounded-xl bg-transparent"
                  >
                    Ver Documentación
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border-lime-500/20 shadow-lg shadow-lime-500/10 hover:shadow-lime-500/20 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-lime-400 font-semibold">TVL Total</CardDescription>
                  <DollarSign className="h-6 w-6 text-lime-400 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-3xl font-black text-white">$0.00</CardTitle>
                <div className="text-sm text-emerald-400">+0% 24h</div>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border-emerald-500/20 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-emerald-400 font-semibold">DSC Acuñados</CardDescription>
                  <Shield className="h-6 w-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-3xl font-black text-white">0 DSC</CardTitle>
                <div className="text-sm text-lime-400">Estable</div>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border-lime-400/20 shadow-lg shadow-lime-400/10 hover:shadow-lime-400/20 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-lime-400 font-semibold">Usuarios Activos</CardDescription>
                  <TrendingUp className="h-6 w-6 text-lime-400 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-3xl font-black text-white">0</CardTitle>
                <div className="text-sm text-emerald-400">Creciendo</div>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border-yellow-500/20 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-yellow-400 font-semibold">Factor Salud Prom.</CardDescription>
                  <Zap className="h-6 w-6 text-yellow-400 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-3xl font-black text-white">∞</CardTitle>
                <div className="text-sm text-lime-400">Seguro</div>
              </CardHeader>
            </Card>
          </div>

          {/* Main Dashboard */}
          {isConnected ? (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Left Column - Position & Actions */}
              <div className="xl:col-span-3 space-y-8">
                <PositionOverview />
                <ActionTabs />
              </div>

              {/* Right Column - Price Feed, Transaction History & Wallet */}
              <div className="xl:col-span-1 space-y-8">
                <PriceFeed />
                <TransactionHistory />
                <WalletConnect />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Wallet Connection */}
              <div className="lg:col-span-1">
                <WalletConnect />
              </div>

              <div className="lg:col-span-2">
                <Card className="h-full bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border-lime-500/20 shadow-xl shadow-lime-500/10">
                  <CardHeader className="border-b border-lime-500/20">
                    <CardTitle className="text-3xl font-black text-white">Cómo Funciona DSC Protocol</CardTitle>
                    <CardDescription className="text-lg text-slate-300">
                      Un protocolo de stablecoin descentralizado con sobrecolateralización
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-lime-500/10 to-transparent border border-lime-500/20">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-lime-500 text-black font-bold text-lg px-3 py-1">1</Badge>
                          <h3 className="font-bold text-xl text-lime-400">Depositar Colateral</h3>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          Deposita criptoactivos soportados como colateral para asegurar tu posición
                        </p>
                      </div>

                      <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-emerald-500 text-black font-bold text-lg px-3 py-1">2</Badge>
                          <h3 className="font-bold text-xl text-emerald-400">Acuñar DSC</h3>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          Acuña stablecoins DSC hasta el límite de tu ratio de colateralización
                        </p>
                      </div>

                      <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-yellow-500 text-black font-bold text-lg px-3 py-1">3</Badge>
                          <h3 className="font-bold text-xl text-yellow-400">Monitorear Salud</h3>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          Mantén tu factor de salud por encima de 1.0 para evitar liquidación
                        </p>
                      </div>

                      <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-purple-500 text-black font-bold text-lg px-3 py-1">4</Badge>
                          <h3 className="font-bold text-xl text-purple-400">Redimir y Quemar</h3>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          Quema DSC para redimir tu colateral o mejorar tu factor de salud
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-lime-500/20 bg-gradient-to-r from-lime-500/5 to-emerald-500/5 rounded-xl p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 font-medium">Ratio Mínimo de Colateral:</span>
                          <span className="font-black text-lime-400 text-lg">150%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 font-medium">Umbral de Liquidación:</span>
                          <span className="font-black text-red-400 text-lg">Factor Salud &lt; 1.0</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
