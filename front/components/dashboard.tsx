"use client"

import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Zap, LogOut, Trophy, Flame, Target, Clock, ChevronRight,
  TrendingUp, Star, Menu, X, Coins, Sparkles, ArrowUpRight
} from "lucide-react"
import { useState } from "react"

function Navbar({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { walletAddress, disconnectWallet, role } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const short = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : ""

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("dashboard")} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">PoP</span>
          </button>
        </div>
        <div className="hidden items-center gap-6 md:flex">
          <button onClick={() => onNavigate("dashboard")} className="text-sm font-medium text-foreground">Dashboard</button>
          <button onClick={() => onNavigate("events")} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Eventos</button>
          <button onClick={() => onNavigate("rewards")} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Recompensas</button>
          <button onClick={() => onNavigate("activity")} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Actividad</button>
          {role === "admin" && (
            <button onClick={() => onNavigate("admin")} className="text-sm text-primary transition-colors hover:text-primary/80">Admin</button>
          )}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-mono text-xs text-foreground">{short}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={disconnectWallet} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="border-t border-border/50 bg-background p-4 md:hidden">
          <div className="flex flex-col gap-3">
            {["dashboard", "events", "rewards", "activity"].map(page => (
              <button
                key={page}
                onClick={() => { onNavigate(page); setMobileMenuOpen(false) }}
                className="rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {page === "dashboard" ? "Dashboard" : page === "events" ? "Eventos" : page === "rewards" ? "Recompensas" : "Actividad"}
              </button>
            ))}
            {role === "admin" && (
              <button onClick={() => { onNavigate("admin"); setMobileMenuOpen(false) }} className="rounded-lg px-3 py-2 text-left text-sm text-primary transition-colors hover:bg-secondary">Admin</button>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="font-mono text-xs text-muted-foreground">{short}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={disconnectWallet} className="text-muted-foreground"><LogOut className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export function Dashboard() {
  const { userStats, activities, objectives, setCurrentPage, role, setRole } = useApp()
  const { azistBalance, xp, level, xpToNextLevel, levelMultiplier, streak, streakMultiplier } = userStats
  const xpProgress = (xp / xpToNextLevel) * 100
  const remainingXp = xpToNextLevel - xp

  return (
    <div className="min-h-screen bg-background">
      <Navbar onNavigate={setCurrentPage} />

      <main className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Star className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Bienvenido</h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  <Trophy className="h-3 w-3" /> Nivel {level}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
                  <Flame className="h-3 w-3" /> {streak} dias
                </span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setRole(role === "admin" ? "user" : "admin")} className="border-border text-muted-foreground text-xs">
            {role === "admin" ? "Vista usuario" : "Vista admin"}
          </Button>
        </div>

        {/* AZIST + XP Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {/* AZIST Balance Card */}
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
            <div className="relative p-6">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Coins className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Balance AZIST</p>
                </div>
                <p className="mt-3 font-display text-4xl font-bold tabular-nums text-foreground md:text-5xl">
                  {azistBalance.toLocaleString()}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Tokens disponibles para canjear</p>
              </div>
            </div>
          </div>

          {/* XP + Level Card */}
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
            <div className="relative p-6">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Experiencia (XP)</p>
                </div>
                <p className="mt-3 font-display text-4xl font-bold tabular-nums text-foreground md:text-5xl">
                  {xp.toLocaleString()}
                </p>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Nivel {level} &rarr; Nivel {level + 1}</span>
                    <span className="font-medium text-foreground">{Math.round(xpProgress)}%</span>
                  </div>
                  <Progress value={xpProgress} className="h-2 bg-secondary" />
                  <p className="text-xs text-muted-foreground">
                    Faltan <span className="font-medium text-primary">{remainingXp.toLocaleString()}</span> XP
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Multiplier Bonuses */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Bonus de nivel</span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">x{levelMultiplier.toFixed(2)}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Nivel {level}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-warning" />
              <span className="text-xs font-medium text-muted-foreground">Bonus de racha</span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">x{streakMultiplier.toFixed(2)}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{streak} dias seguidos</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Bonus total</span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-primary">x{(levelMultiplier * streakMultiplier).toFixed(2)}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Nivel + racha</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Eventos asistidos</span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">
              {activities.filter(a => a.type === "event" && a.status === "confirmed").length}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Total confirmados</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="rounded-2xl border border-border/50 bg-card p-6 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Actividad reciente</h2>
              <button onClick={() => setCurrentPage("activity")} className="flex items-center gap-1 text-sm text-primary hover:text-primary/80">
                Ver todo <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {activities.slice(0, 4).map((a, i) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-xl border border-border/30 bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${a.azist > 0 ? "bg-primary/10 text-primary" : a.azist < 0 ? "bg-muted text-muted-foreground" : a.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                      {a.azist > 0 ? <TrendingUp className="h-4 w-4" /> : a.type === "redemption" ? <Trophy className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.eventName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground">{a.date}</p>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${a.status === "confirmed" ? "bg-primary/10 text-primary" : a.status === "pending" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
                          {a.status === "confirmed" ? "Confirmado" : a.status === "pending" ? "Pendiente" : "Rechazado"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {a.azist !== 0 && (
                      <span className={`font-mono text-sm font-semibold ${a.azist > 0 ? "text-primary" : "text-muted-foreground"}`}>
                        {a.azist > 0 ? "+" : ""}{a.azist} AZIST
                      </span>
                    )}
                    {a.xp > 0 && (
                      <p className="text-[10px] text-muted-foreground">+{a.xp} XP</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Objectives + Streak */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Objetivos activos</h2>
              <div className="space-y-4">
                {objectives.map(obj => (
                  <div key={obj.id}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm text-foreground">{obj.title}</span>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {obj.progress}/{obj.total}
                      </span>
                    </div>
                    <Progress value={(obj.progress / obj.total) * 100} className="h-1.5 bg-secondary" />
                  </div>
                ))}
              </div>
            </div>

            {/* Streak */}
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Racha activa</h2>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                  <Flame className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">{streak} dias</p>
                  <p className="text-xs text-muted-foreground">Bonus: x{streakMultiplier.toFixed(2)} en recompensas</p>
                </div>
              </div>
              <div className="mt-4 flex gap-1">
                {Array.from({ length: 30 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-3 flex-1 rounded-sm ${i < streak ? "bg-primary" : i < streak + 2 ? "bg-primary/20" : "bg-secondary"}`}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-xs text-muted-foreground">Dia 1</span>
                <span className="text-xs text-muted-foreground">Dia 30</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Eventos", icon: Clock, page: "events" },
            { label: "Recompensas", icon: Trophy, page: "rewards" },
            { label: "Actividad", icon: TrendingUp, page: "activity" },
            { label: "Admin", icon: Target, page: "admin", adminOnly: true },
          ].filter(a => !a.adminOnly || role === "admin").map(action => (
            <button
              key={action.label}
              onClick={() => setCurrentPage(action.page)}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
