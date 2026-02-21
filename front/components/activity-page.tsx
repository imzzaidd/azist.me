"use client"

import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import {
  Zap, LogOut, TrendingUp, Trophy, Hash, Calendar, Filter,
  Menu, X, ArrowUpRight, ArrowDownRight, Coins, Sparkles
} from "lucide-react"
import { useState } from "react"

function Navbar({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { walletAddress, disconnectWallet, role } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const short = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : ""

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
          <button onClick={() => onNavigate("rewards")} className="text-sm text-muted-foreground hover:text-foreground">Recompensas</button>
          <button onClick={() => onNavigate("activity")} className="text-sm font-medium text-foreground">Actividad</button>
          {role === "admin" && <button onClick={() => onNavigate("admin")} className="text-sm text-primary">Admin</button>}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-primary" /><span className="font-mono text-xs text-foreground">{short}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={disconnectWallet}><LogOut className="h-4 w-4 text-muted-foreground" /></Button>
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

export function ActivityPage() {
  const { activities, setCurrentPage, walletState } = useApp()
  const [filter, setFilter] = useState<"all" | "event" | "redemption">("all")

  const filtered = filter === "all" ? activities : activities.filter(a => a.type === filter)

  return (
    <div className="min-h-screen bg-background">
      {walletState === "connected" ? (
        <Navbar onNavigate={setCurrentPage} />
      ) : (
        <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <button onClick={() => setCurrentPage("landing")} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"><Zap className="h-4 w-4 text-primary-foreground" /></div>
              <span className="font-display text-lg font-bold text-foreground">azist.me</span>
            </button>
          </div>
        </nav>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Historial de actividad</h1>
          <p className="mt-2 text-muted-foreground">Registro completo de tus eventos y canjes</p>
        </div>

        {/* Filter */}
        <div className="mb-6 flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {[
            { value: "all" as const, label: "Todos" },
            { value: "event" as const, label: "Eventos" },
            { value: "redemption" as const, label: "Canjes" },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filter === f.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Activity List */}
        <div className="space-y-3">
          {filtered.map((a, i) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4 transition-colors hover:border-primary/20 hover:bg-card/80 animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.status === "confirmed" && a.type === "event" ? "bg-primary/10" : a.status === "rejected" ? "bg-destructive/10" : a.type === "redemption" ? "bg-muted" : "bg-warning/10"}`}>
                  {a.type === "event" ? (
                    a.status === "rejected" ? <TrendingUp className="h-5 w-5 text-destructive" /> : <TrendingUp className="h-5 w-5 text-primary" />
                  ) : (
                    <Trophy className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{a.eventName}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${a.status === "confirmed" ? "bg-success/10 text-success" : a.status === "pending" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
                      {a.status === "confirmed" ? "Confirmado" : a.status === "pending" ? "Pendiente" : "Rechazado"}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {a.date}</span>
                    <span className="flex items-center gap-1"><Hash className="h-3 w-3" /> {a.txHash}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                {a.azist !== 0 && (
                  <div className="flex items-center gap-1">
                    {a.azist > 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className={`flex items-center gap-1 font-mono text-sm font-semibold ${a.azist > 0 ? "text-primary" : "text-muted-foreground"}`}>
                      {a.azist > 0 ? "+" : ""}{a.azist}
                      <Coins className="h-3 w-3" />
                    </span>
                  </div>
                )}
                {a.xp > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    +{a.xp} <Sparkles className="h-2.5 w-2.5" /> XP
                  </span>
                )}
                {a.azist === 0 && a.xp === 0 && a.status !== "pending" && (
                  <span className="text-xs text-muted-foreground">Sin recompensa</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 font-display text-lg font-semibold text-foreground">Sin actividad</p>
            <p className="mt-1 text-sm text-muted-foreground">No hay registros con este filtro</p>
          </div>
        )}
      </main>
    </div>
  )
}
