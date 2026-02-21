"use client"

import { useApp } from "@/lib/app-context"
import { useAccount } from "wagmi"
import { useAzistBalance } from "@/hooks/contracts/useAzistToken"
import { useIsAdmin } from "@/hooks/contracts/useRoleManager"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { WalletButton } from "@/components/wallet-modal"
import { Button } from "@/components/ui/button"
import type { Reward } from "@/lib/types"
import {
  Zap, Gift, Clock, CheckCircle2, XCircle, Lock,
  Menu, X, Copy, Coins
} from "lucide-react"
import { useState } from "react"

function Navbar({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { address } = useAccount()
  const { isAdmin } = useIsAdmin(address)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <button onClick={() => onNavigate("dashboard")} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"><Zap className="h-4 w-4 text-primary-foreground" /></div>
          <span className="font-display text-lg font-bold text-foreground">PoP</span>
        </button>
        <div className="hidden items-center gap-6 md:flex">
          <button onClick={() => onNavigate("dashboard")} className="text-sm text-muted-foreground hover:text-foreground">Dashboard</button>
          <button onClick={() => onNavigate("events")} className="text-sm text-muted-foreground hover:text-foreground">Eventos</button>
          <button onClick={() => onNavigate("rewards")} className="text-sm font-medium text-foreground">Recompensas</button>
          <button onClick={() => onNavigate("activity")} className="text-sm text-muted-foreground hover:text-foreground">Actividad</button>
          {isAdmin && <button onClick={() => onNavigate("admin")} className="text-sm text-primary">Admin</button>}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <WalletButton />
        </div>
        <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="border-t border-border/50 bg-background p-4 md:hidden">
          {["dashboard", "events", "rewards", "activity"].map(p => (
            <button key={p} onClick={() => { onNavigate(p); setMobileMenuOpen(false) }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-secondary">
              {p === "dashboard" ? "Dashboard" : p === "events" ? "Eventos" : p === "rewards" ? "Recompensas" : "Actividad"}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}

function RewardCard({ reward, userAzist, onSelect }: { reward: Reward; userAzist: number; onSelect: (r: Reward) => void }) {
  const canAfford = userAzist >= reward.azistCost
  const isSoldOut = reward.status === "sold-out"

  return (
    <div className={`group overflow-hidden rounded-2xl border bg-card transition-all ${isSoldOut ? "border-border/30 opacity-60" : "border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"}`}>
      <div className="relative h-40 bg-secondary">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Gift className="h-7 w-7 text-primary/60" />
          </div>
        </div>
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">Agotado</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-base font-semibold text-foreground">{reward.name}</h3>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-primary" />
            <span className="font-display text-lg font-bold text-foreground">{reward.azistCost.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">AZIST</span>
          </div>
          {!canAfford && !isSoldOut && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> Insuficiente
            </span>
          )}
        </div>
        <Button
          size="sm"
          className={`mt-4 w-full ${isSoldOut || !canAfford ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
          disabled={isSoldOut || !canAfford}
          onClick={() => onSelect(reward)}
        >
          {isSoldOut ? "Agotado" : !canAfford ? "AZIST insuficientes" : "Canjear"}
        </Button>
      </div>
    </div>
  )
}

function RewardModal({ reward, userBalance, onClose, onRedeem }: { reward: Reward; userBalance: number; onClose: () => void; onRedeem: () => void }) {
  const [redeemed, setRedeemed] = useState(false)
  const [code, setCode] = useState("")
  const [copied, setCopied] = useState(false)

  const handleRedeem = () => {
    onRedeem()
    const generatedCode = `POP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    setCode(generatedCode)
    setRedeemed(true)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md animate-slide-up rounded-2xl border border-border bg-card shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground" aria-label="Cerrar">
          <XCircle className="h-5 w-5" />
        </button>

        {redeemed ? (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">Recompensa canjeada</h3>
            <p className="text-sm text-muted-foreground">Tu codigo de recompensa:</p>
            <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
              <span className="font-mono text-lg font-bold text-primary">{code}</span>
              <button onClick={handleCopy} className="text-primary/60 hover:text-primary" aria-label="Copiar codigo">
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <Button onClick={onClose} className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90">Cerrar</Button>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-4 flex h-20 items-center justify-center rounded-xl bg-secondary">
              <Gift className="h-10 w-10 text-primary/60" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">{reward.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{reward.description}</p>
            <div className="mt-4 space-y-2 rounded-xl border border-border/50 bg-secondary/30 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Costo</span>
                <span className="flex items-center gap-1 font-semibold text-foreground"><Coins className="h-3.5 w-3.5 text-primary" /> {reward.azistCost.toLocaleString()} AZIST</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tu balance</span>
                <span className="font-semibold text-foreground">{userBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} AZIST</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Despues del canje</span>
                <span className={`font-semibold ${userBalance - reward.azistCost >= 0 ? "text-foreground" : "text-destructive"}`}>
                  {(userBalance - reward.azistCost).toLocaleString(undefined, { maximumFractionDigits: 2 })} AZIST
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Expira</span>
                <span className="flex items-center gap-1 text-foreground"><Clock className="h-3.5 w-3.5" /> {reward.expirationDate}</span>
              </div>
            </div>
            <Button
              onClick={handleRedeem}
              className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={userBalance < reward.azistCost}
            >
              Confirmar canje
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function RewardsPage() {
  const { rewards, setCurrentPage, redeemReward } = useApp()
  const { isConnected, address } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { balance } = useAzistBalance(address)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)

  return (
    <div className="min-h-screen bg-background">
      {isConnected ? (
        <Navbar onNavigate={setCurrentPage} />
      ) : (
        <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <button onClick={() => setCurrentPage("landing")} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"><Zap className="h-4 w-4 text-primary-foreground" /></div>
              <span className="font-display text-lg font-bold text-foreground">PoP Rewards</span>
            </button>
            <Button size="sm" onClick={() => openConnectModal?.()} className="bg-primary text-primary-foreground">Conectar Wallet</Button>
          </div>
        </nav>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Recompensas</h1>
            <p className="mt-2 text-muted-foreground">Canjea tus AZIST por recompensas exclusivas</p>
          </div>
          {isConnected && (
            <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2">
              <Coins className="h-5 w-5 text-primary" />
              <span className="font-display text-xl font-bold text-primary">{balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              <span className="text-sm text-primary/70">AZIST disponibles</span>
            </div>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map(reward => (
            <RewardCard key={reward.id} reward={reward} userAzist={balance} onSelect={setSelectedReward} />
          ))}
        </div>

        {rewards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Gift className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 font-display text-lg font-semibold text-foreground">No hay recompensas disponibles</p>
            <p className="mt-1 text-sm text-muted-foreground">Vuelve pronto para nuevas recompensas</p>
          </div>
        )}
      </main>

      {selectedReward && (
        <RewardModal
          reward={selectedReward}
          userBalance={balance}
          onClose={() => setSelectedReward(null)}
          onRedeem={() => {
            redeemReward(selectedReward.id, balance)
          }}
        />
      )}
    </div>
  )
}
