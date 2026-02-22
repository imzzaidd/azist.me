"use client"

import { useApp } from "@/lib/app-context"
import { useAccount } from "wagmi"
import { useUserStats } from "@/hooks/contracts/useUserStats"
import { useIsAdmin } from "@/hooks/contracts/useRoleManager"
import { useActivityLogs } from "@/hooks/contracts/useActivityLogs"
import { Navbar } from "@/components/navbar"
import { Progress } from "@/components/ui/progress"
import {
  Trophy, Flame, Clock,
  TrendingUp, Star, Coins, Sparkles, ArrowUpRight,
  Plus, CalendarCheck, BarChart3, Target
} from "lucide-react"

export function Dashboard() {
  const { setCurrentPage } = useApp()
  const { address } = useAccount()
  const { stats: userStats, isLoading } = useUserStats(address)
  const { isAdmin } = useIsAdmin(address)
  const { activities } = useActivityLogs(address)
  const { azistBalance, xp, level, xpToNextLevel, levelMultiplier, streak, streakMultiplier } = userStats
  const xpProgress = xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 0
  const remainingXp = xpToNextLevel - xp

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar activePage="dashboard" />
        <main className="mx-auto max-w-7xl px-4 py-6 md:py-10">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Cargando datos...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar activePage="dashboard" />

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
        </div>

        {/* AZIST + XP Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
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
                  {azistBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Tokens disponibles</p>
              </div>
            </div>
          </div>

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
              {activities.filter(a => a.type === "reward").length}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Total recompensados</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="rounded-2xl border border-border/50 bg-card p-6 lg:col-span-2">
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Actividad reciente</h2>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No hay actividad registrada aun</p>
              ) : (
                activities.slice(0, 4).map((a, i) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-xl border border-border/30 bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${a.azist > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {a.azist > 0 ? <TrendingUp className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.eventName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-muted-foreground">{a.date}</p>
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            {a.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {a.azist !== 0 && (
                        <span className={`font-mono text-sm font-semibold ${a.azist > 0 ? "text-primary" : "text-muted-foreground"}`}>
                          {a.azist > 0 ? "+" : ""}{a.azist.toFixed(2)} AZIST
                        </span>
                      )}
                      {a.xp > 0 && (
                        <p className="text-[10px] text-muted-foreground">+{a.xp} XP</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Streak */}
          <div className="space-y-6">
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
            { label: "Crear Evento", icon: Plus, page: "create" },
            { label: "Gestionar", icon: CalendarCheck, page: "manage" },
            { label: "Metricas", icon: BarChart3, page: "metrics" },
            { label: "Admin", icon: Target, page: "admin", adminOnly: true },
          ].filter(a => !a.adminOnly || isAdmin).map(action => (
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
