"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Menu, X, ExternalLink, Copy, LogOut } from "lucide-react"
import { useAccount, useConnect, useDisconnect, useEnsName } from "wagmi"
import { formatAddress } from "@/lib/utils/formatting"
import { toast } from "sonner"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const { address, isConnected, chain } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.success("Dirección copiada al portapapeles")
    }
  }

  const handleConnect = (connectorId: string) => {
    const connector = connectors.find((c) => c.id === connectorId)
    if (connector) {
      connect({ connector })
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/80 backdrop-blur-xl border-b border-lime-500/20 shadow-lg shadow-lime-500/5"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-lime-500/25">
                <span className="text-black font-black text-xl">D</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-xl blur-sm opacity-50 -z-10"></div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">DSC</h1>
              <p className="text-xs text-lime-400 font-semibold tracking-wider">PROTOCOL</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#dashboard" className="text-slate-300 hover:text-lime-400 font-medium transition-colors">
              Dashboard
            </a>
            <a href="#docs" className="text-slate-300 hover:text-lime-400 font-medium transition-colors">
              Docs
            </a>
            <a href="#analytics" className="text-slate-300 hover:text-lime-400 font-medium transition-colors">
              Analytics
            </a>

            {/* Network Badge */}
            {isConnected && chain && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-semibold">
                {chain.name}
              </Badge>
            )}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {!isConnected ? (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => handleConnect("injected")}
                  disabled={isPending}
                  className="bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-black font-bold px-6 py-2 rounded-xl shadow-lg shadow-lime-500/25 hover:shadow-lime-500/40 transition-all duration-300 transform hover:scale-105"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {isPending ? "Conectando..." : "Conectar Wallet"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Wallet Info */}
                <div className="hidden sm:flex items-center space-x-3 bg-slate-900/80 backdrop-blur-sm border border-lime-500/20 rounded-xl px-4 py-2 shadow-lg shadow-lime-500/10">
                  <div className="w-3 h-3 bg-lime-400 rounded-full animate-pulse"></div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{ensName || formatAddress(address!)}</p>
                    <p className="text-xs text-lime-400">Conectado</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="text-slate-300 hover:text-lime-400 hover:bg-lime-500/10 p-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://etherscan.io/address/${address}`, "_blank")}
                    className="text-slate-300 hover:text-lime-400 hover:bg-lime-500/10 p-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => disconnect()}
                    className="text-slate-300 hover:text-red-400 hover:bg-red-500/10 p-2"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-slate-300 hover:text-lime-400 p-2"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-b border-lime-500/20 shadow-lg shadow-lime-500/10">
            <div className="container mx-auto px-4 py-6 space-y-4">
              <a
                href="#dashboard"
                className="block text-slate-300 hover:text-lime-400 font-medium py-2 transition-colors"
              >
                Dashboard
              </a>
              <a href="#docs" className="block text-slate-300 hover:text-lime-400 font-medium py-2 transition-colors">
                Docs
              </a>
              <a
                href="#analytics"
                className="block text-slate-300 hover:text-lime-400 font-medium py-2 transition-colors"
              >
                Analytics
              </a>

              {!isConnected && (
                <div className="pt-4 border-t border-lime-500/20">
                  <Button
                    onClick={() => handleConnect("injected")}
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-black font-bold py-3 rounded-xl shadow-lg shadow-lime-500/25"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isPending ? "Conectando..." : "Conectar Wallet"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
