"use client"

import { useApp, type EventStatus } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Zap, LogOut, LayoutDashboard, Plus, CalendarCheck, BarChart3,
  Users, Clock, Trophy, TrendingUp, MapPin, Timer, Image,
  ArrowLeft, CheckCircle2, AlertCircle, Menu, X, Coins, Radio,
  XCircle, UserCheck, ShieldCheck
} from "lucide-react"
import { useState } from "react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const mockChartData = [
  { name: "Ene", attendees: 120, azist: 24000 },
  { name: "Feb", attendees: 180, azist: 36000 },
  { name: "Mar", attendees: 250, azist: 50000 },
  { name: "Abr", attendees: 190, azist: 38000 },
  { name: "May", attendees: 310, azist: 62000 },
  { name: "Jun", attendees: 280, azist: 56000 },
]

const mockAttendees = [
  { id: "1", address: "0x742d...bD18", arrivedAt: "09:15", duration: "4h 30min", status: "confirmed" as const },
  { id: "2", address: "0x8a3f...2c91", arrivedAt: "09:22", duration: "3h 15min", status: "confirmed" as const },
  { id: "3", address: "0xb12e...7d44", arrivedAt: "10:05", duration: "2h 45min", status: "confirmed" as const },
  { id: "4", address: "0xc9d1...3a88", arrivedAt: "09:30", duration: "1h 10min", status: "rejected" as const },
  { id: "5", address: "0xd4e2...5f99", arrivedAt: "11:00", duration: "--", status: "pending" as const },
  { id: "6", address: "0xe5f3...6a00", arrivedAt: "09:45", duration: "5h 00min", status: "confirmed" as const },
]

function StatusBadge({ status }: { status: EventStatus }) {
  const config: Record<EventStatus, { label: string; className: string }> = {
    upcoming: { label: "Proximo", className: "bg-secondary text-foreground" },
    live: { label: "En vivo", className: "bg-primary/10 text-primary" },
    ended: { label: "Finalizado", className: "bg-muted text-muted-foreground" },
    finalized: { label: "Recompensas enviadas", className: "bg-success/10 text-success" },
  }
  const { label, className } = config[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {status === "live" && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
      )}
      {label}
    </span>
  )
}

function AdminNav({ currentTab, onTab, onNavigate }: { currentTab: string; onTab: (t: string) => void; onNavigate: (p: string) => void }) {
  const { walletAddress, disconnectWallet } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const short = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : ""

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "create", label: "Crear Evento", icon: Plus },
    { id: "events", label: "Gestionar Eventos", icon: CalendarCheck },
    { id: "attendance", label: "Asistencia", icon: UserCheck },
    { id: "metrics", label: "Metricas", icon: BarChart3 },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("dashboard")} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"><Zap className="h-4 w-4 text-primary-foreground" /></div>
            <span className="font-display text-lg font-bold text-foreground">PoP</span>
          </button>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">Admin</span>
        </div>
        <div className="hidden items-center gap-1 md:flex">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${currentTab === t.id ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <t.icon className="h-4 w-4" />
              <span className="hidden lg:inline">{t.label}</span>
            </button>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <button onClick={() => onNavigate("dashboard")} className="text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="inline h-4 w-4 mr-1" />Vista usuario
          </button>
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
          {tabs.map(t => (
            <button key={t.id} onClick={() => { onTab(t.id); setMobileMenuOpen(false) }} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${currentTab === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
          <button onClick={() => onNavigate("dashboard")} className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground border-t border-border pt-3">
            <ArrowLeft className="h-4 w-4" /> Vista usuario
          </button>
        </div>
      )}
    </nav>
  )
}

function AdminDashboard() {
  const stats = [
    { label: "Total asistentes", value: "1,342", icon: Users, change: "+12%" },
    { label: "Duracion promedio", value: "2.5h", icon: Clock, change: "+8%" },
    { label: "AZIST distribuidos", value: "268K", icon: Coins, change: "+23%" },
    { label: "Tasa de confirmacion", value: "87%", icon: ShieldCheck, change: "+5%" },
  ]

  return (
    <div className="animate-slide-up">
      <h1 className="mb-8 font-display text-3xl font-bold text-foreground">Panel de administracion</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-primary">{s.change}</span>
            </div>
            <p className="mt-4 font-display text-2xl font-bold text-foreground">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border/50 bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Asistencia mensual</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockChartData}>
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
      </div>
    </div>
  )
}

function CreateEventForm() {
  const [submitted, setSubmitted] = useState(false)
  const [categoryMultiplier, setCategoryMultiplier] = useState("1.0")

  if (submitted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center animate-slide-up">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Evento creado</h2>
          <p className="mt-2 text-muted-foreground">El evento ha sido publicado como &quot;Proximo&quot;</p>
          <Button onClick={() => setSubmitted(false)} className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">Crear otro evento</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-slide-up">
      <h1 className="mb-8 font-display text-3xl font-bold text-foreground">Crear evento</h1>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Basic Info */}
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Informacion basica</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Nombre del evento</label>
              <input className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Ej: Web3 Summit 2026" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Descripcion</label>
              <textarea className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" rows={3} placeholder="Describe el evento..." />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Categoria</label>
                <select
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  onChange={(e) => {
                    const muls: Record<string, string> = { Conferencia: "1.5", Taller: "1.2", Meetup: "1.0", Exhibicion: "1.1" }
                    setCategoryMultiplier(muls[e.target.value] || "1.0")
                  }}
                >
                  <option>Conferencia</option>
                  <option>Taller</option>
                  <option>Meetup</option>
                  <option>Exhibicion</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Bonus de categoria</label>
                <div className="flex items-center rounded-xl border border-input bg-secondary/30 px-4 py-2.5 text-sm">
                  <span className="font-semibold text-primary">x{categoryMultiplier}</span>
                  <span className="ml-2 text-xs text-muted-foreground">aplicado a la recompensa base</span>
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Recompensa base (AZIST)</label>
              <input type="number" className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="500" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Imagen del evento</label>
              <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 text-muted-foreground transition-colors hover:border-primary/30">
                <div className="flex flex-col items-center gap-2">
                  <Image className="h-8 w-8" />
                  <span className="text-sm">Arrastra una imagen o haz clic</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Ubicacion</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Direccion</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Ej: Centro de Convenciones, CDMX" />
              </div>
            </div>
            <div className="h-40 rounded-xl bg-secondary flex items-center justify-center text-sm text-muted-foreground">
              <MapPin className="mr-2 h-5 w-5" /> Vista previa del mapa
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Radio de validacion</label>
              <div className="flex items-center gap-4">
                <input type="range" min="50" max="500" defaultValue="100" className="flex-1 accent-primary" />
                <span className="min-w-[4rem] rounded-lg bg-secondary px-3 py-1 text-center text-sm font-medium text-foreground">100m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Time & Duration */}
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Horario y duracion</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Fecha</label>
                <input type="date" className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Hora de inicio</label>
                <input type="time" className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Hora de fin</label>
                <input type="time" className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Asistencia minima (minutos)</label>
                <input type="number" className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="120" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Duracion maxima recompensable (minutos)</label>
              <input type="number" className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="420" />
              <p className="mt-1 text-xs text-muted-foreground">Tiempo maximo que contribuye al calculo de la recompensa.</p>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
          onClick={() => setSubmitted(true)}
        >
          <Plus className="mr-2 h-5 w-5" /> Crear evento
        </Button>
      </div>
    </div>
  )
}

function ManageEvents() {
  const { events } = useApp()

  return (
    <div className="animate-slide-up">
      <h1 className="mb-8 font-display text-3xl font-bold text-foreground">Gestionar eventos</h1>

      {/* Event lifecycle overview */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {(["upcoming", "live", "ended", "finalized"] as EventStatus[]).map(status => {
          const count = events.filter(e => e.status === status).length
          return (
            <div key={status} className="rounded-xl border border-border/50 bg-card p-4 text-center">
              <StatusBadge status={status} />
              <p className="mt-2 font-display text-2xl font-bold text-foreground">{count}</p>
            </div>
          )
        })}
      </div>

      <div className="space-y-3">
        {events.map(event => (
          <div key={event.id} className="flex items-center justify-between rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <CalendarCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-display font-semibold text-foreground">{event.title}</p>
                  <StatusBadge status={event.status} />
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{event.date}</span>
                  <span>{event.category} (x{event.categoryMultiplier})</span>
                  <span>{event.baseReward} AZIST base</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-foreground">{event.attendees} asistentes</p>
                <p className="text-xs text-muted-foreground">{event.time} - {event.endTime}</p>
              </div>
              {event.status === "upcoming" && (
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Radio className="mr-1.5 h-3.5 w-3.5" /> Iniciar
                </Button>
              )}
              {event.status === "live" && (
                <Button size="sm" variant="outline" className="border-warning/30 text-warning hover:bg-warning/10">
                  <Timer className="mr-1.5 h-3.5 w-3.5" /> Finalizar
                </Button>
              )}
              {event.status === "ended" && (
                <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90">
                  <Coins className="mr-1.5 h-3.5 w-3.5" /> Enviar recompensas
                </Button>
              )}
              {event.status === "finalized" && (
                <span className="flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Completado
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AttendanceVerification() {
  const [selectedTab, setSelectedTab] = useState<"all" | "pending" | "confirmed" | "rejected">("all")
  const filtered = selectedTab === "all" ? mockAttendees : mockAttendees.filter(a => a.status === selectedTab)

  return (
    <div className="animate-slide-up">
      <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Verificacion de asistencia</h1>
      <p className="mb-8 text-muted-foreground">Gestiona y verifica la asistencia de los participantes</p>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { value: "all" as const, label: "Todos" },
          { value: "pending" as const, label: "Pendientes" },
          { value: "confirmed" as const, label: "Confirmados" },
          { value: "rejected" as const, label: "Rechazados" },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setSelectedTab(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedTab === f.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/50 bg-card p-4 text-center">
          <p className="text-xs font-medium text-muted-foreground">Confirmados</p>
          <p className="mt-1 font-display text-2xl font-bold text-success">{mockAttendees.filter(a => a.status === "confirmed").length}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4 text-center">
          <p className="text-xs font-medium text-muted-foreground">Pendientes</p>
          <p className="mt-1 font-display text-2xl font-bold text-warning">{mockAttendees.filter(a => a.status === "pending").length}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4 text-center">
          <p className="text-xs font-medium text-muted-foreground">Rechazados</p>
          <p className="mt-1 font-display text-2xl font-bold text-destructive">{mockAttendees.filter(a => a.status === "rejected").length}</p>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(att => (
          <div key={att.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${att.status === "confirmed" ? "bg-success/10" : att.status === "rejected" ? "bg-destructive/10" : "bg-warning/10"}`}>
                {att.status === "confirmed" ? <CheckCircle2 className="h-5 w-5 text-success" /> : att.status === "rejected" ? <XCircle className="h-5 w-5 text-destructive" /> : <Clock className="h-5 w-5 text-warning" />}
              </div>
              <div>
                <p className="font-mono text-sm font-medium text-foreground">{att.address}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Llegada: {att.arrivedAt}</span>
                  <span>Duracion: {att.duration}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${att.status === "confirmed" ? "bg-success/10 text-success" : att.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                {att.status === "confirmed" ? "Confirmado" : att.status === "rejected" ? "Rechazado" : "Pendiente"}
              </span>
              {att.status === "pending" && (
                <div className="flex gap-1">
                  <Button size="sm" className="h-7 bg-success text-success-foreground hover:bg-success/90 px-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 border-destructive/30 text-destructive hover:bg-destructive/10 px-2">
                    <XCircle className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <UserCheck className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mt-4 font-display text-lg font-semibold text-foreground">Sin registros</p>
          <p className="mt-1 text-sm text-muted-foreground">No hay asistentes con este filtro</p>
        </div>
      )}
    </div>
  )
}

function MetricsDashboard() {
  const metricCards = [
    { label: "Total asistentes", value: "1,342", icon: Users },
    { label: "Duracion promedio", value: "2h 34min", icon: Clock },
    { label: "AZIST distribuidos", value: "268,400", icon: Coins },
    { label: "Tasa de confirmacion", value: "87.3%", icon: ShieldCheck },
  ]

  return (
    <div className="animate-slide-up">
      <h1 className="mb-8 font-display text-3xl font-bold text-foreground">Metricas</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map(m => (
          <div key={m.label} className="rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <m.icon className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-4 font-display text-2xl font-bold text-foreground">{m.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Asistentes por mes</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData}>
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
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">AZIST distribuidos por mes</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData}>
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
                <Bar dataKey="azist" fill="oklch(0.6 0.15 200)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Confirmation rate per event */}
      <div className="mt-6 rounded-2xl border border-border/50 bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Tasa de confirmacion por evento</h2>
        <div className="space-y-4">
          {[
            { name: "Web3 Summit 2026", rate: 92 },
            { name: "DeFi Workshop", rate: 85 },
            { name: "NFT Coffee Meetup", rate: 97 },
            { name: "Blockchain para Empresas", rate: 78 },
            { name: "DAO Governance Workshop", rate: 71 },
          ].map(e => (
            <div key={e.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-foreground">{e.name}</span>
                <span className="font-medium text-primary">{e.rate}%</span>
              </div>
              <Progress value={e.rate} className="h-2 bg-secondary" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AdminPanel() {
  const { setCurrentPage, role } = useApp()
  const [currentTab, setCurrentTab] = useState("dashboard")

  if (role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Acceso denegado</h2>
          <p className="mt-2 text-muted-foreground">No tienes permisos de administrador</p>
          <Button onClick={() => setCurrentPage("dashboard")} className="mt-6 bg-primary text-primary-foreground">Volver al dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav currentTab={currentTab} onTab={setCurrentTab} onNavigate={setCurrentPage} />
      <main className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        {currentTab === "dashboard" && <AdminDashboard />}
        {currentTab === "create" && <CreateEventForm />}
        {currentTab === "events" && <ManageEvents />}
        {currentTab === "attendance" && <AttendanceVerification />}
        {currentTab === "metrics" && <MetricsDashboard />}
      </main>
    </div>
  )
}
