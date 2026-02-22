"use client"

import { useApp } from "@/lib/app-context"
import { useAccount } from "wagmi"
import { useIsAdmin } from "@/hooks/contracts/useRoleManager"
import { useAdminMetrics } from "@/hooks/contracts/useAdminMetrics"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Users, Clock, Coins, ShieldCheck, AlertCircle } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function AdminPage() {
  const { setCurrentPage } = useApp()
  const { address } = useAccount()
  const { isAdmin, isLoading: isLoadingAdmin } = useIsAdmin(address)
  const { metrics, isLoading: isLoadingMetrics } = useAdminMetrics()

  if (isLoadingAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Acceso denegado</h2>
          <p className="mt-2 text-muted-foreground">No tienes permisos de administrador en el contrato</p>
          <Button onClick={() => setCurrentPage("dashboard")} className="mt-6 bg-primary text-primary-foreground">Volver al dashboard</Button>
        </div>
      </div>
    )
  }

  const stats = [
    { label: "Total asistentes", value: metrics.totalAttendees.toLocaleString(), icon: Users },
    { label: "Duracion promedio", value: metrics.averageDuration > 0 ? `${metrics.averageDuration} min` : "0 min", icon: Clock },
    { label: "Total eventos", value: metrics.totalEvents.toLocaleString(), icon: Coins },
    { label: "Eventos finalizados", value: metrics.finalizedEvents.toLocaleString(), icon: ShieldCheck },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar activePage="admin" />
      <main className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        <div className="animate-slide-up">
          <h1 className="mb-8 font-display text-3xl font-bold text-foreground">Panel de administracion</h1>

          {isLoadingMetrics ? (
            <div className="flex items-center justify-center py-20">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map(s => (
                  <div key={s.label} className="rounded-2xl border border-border/50 bg-card p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <s.icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="mt-4 font-display text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-border/50 bg-card p-6">
                <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Asistencia mensual</h2>
                {metrics.chartData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metrics.chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs fill-muted-foreground" tick={{ fill: 'currentColor' }} />
                        <YAxis className="text-xs fill-muted-foreground" tick={{ fill: 'currentColor' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            color: 'hsl(var(--foreground))',
                          }}
                        />
                        <Bar dataKey="attendees" fill="oklch(0.65 0.22 160)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">No hay datos de eventos todavia</p>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
