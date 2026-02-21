"use client"

import { useApp } from "@/lib/app-context"
import { useAccount } from "wagmi"
import { useEpochs } from "@/hooks/contracts/useEpochs"
import { useIsAdmin } from "@/hooks/contracts/useRoleManager"
import { useCreateEpoch, useActivateEpoch, useCloseEpoch, useFinalizeEpoch } from "@/hooks/contracts/useEpochManager"
import { useEpochParticipants, useVerifyPresence, useDisputePresence } from "@/hooks/contracts/usePresenceRegistry"
import { useBatchDistribute } from "@/hooks/contracts/useRewardDistributor"
import { WalletButton } from "@/components/wallet-modal"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { EventStatus } from "@/lib/types"
import { AREA_NAMES } from "@/lib/types"
import {
  Zap, LogOut, LayoutDashboard, Plus, CalendarCheck, BarChart3,
  Users, Clock, Trophy, TrendingUp, MapPin, Timer, Image,
  ArrowLeft, CheckCircle2, AlertCircle, Menu, X, Coins, Radio,
  XCircle, UserCheck, ShieldCheck, Loader2
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
          <WalletButton />
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
    { label: "Total asistentes", value: "---", icon: Users, change: "" },
    { label: "Duracion promedio", value: "---", icon: Clock, change: "" },
    { label: "AZIST distribuidos", value: "---", icon: Coins, change: "" },
    { label: "Tasa de confirmacion", value: "---", icon: ShieldCheck, change: "" },
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
              {s.change && <span className="text-xs font-medium text-primary">{s.change}</span>}
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
  const { createEpoch, isPending } = useCreateEpoch()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: "",
    location: "",
    area: 0,
    date: "",
    startTime: "",
    endTime: "",
    maxParticipants: 100,
  })

  const handleSubmit = async () => {
    if (!form.name || !form.location || !form.date || !form.startTime || !form.endTime) return

    const startDateTime = new Date(`${form.date}T${form.startTime}`)
    const endDateTime = new Date(`${form.date}T${form.endTime}`)
    const startTimestamp = BigInt(Math.floor(startDateTime.getTime() / 1000))
    const endTimestamp = BigInt(Math.floor(endDateTime.getTime() / 1000))

    await createEpoch(form.name, form.location, form.area, startTimestamp, endTimestamp, form.maxParticipants)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center animate-slide-up">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Transaccion enviada</h2>
          <p className="mt-2 text-muted-foreground">La transaccion de creacion del evento ha sido enviada a la blockchain</p>
          <Button onClick={() => setSubmitted(false)} className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">Crear otro evento</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-slide-up">
      <h1 className="mb-8 font-display text-3xl font-bold text-foreground">Crear evento</h1>

      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Informacion basica</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Nombre del evento</label>
              <input
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Ej: Web3 Summit 2026"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Area / Categoria</label>
              <select
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={form.area}
                onChange={e => setForm(prev => ({ ...prev, area: Number(e.target.value) }))}
              >
                {AREA_NAMES.map((name, i) => (
                  <option key={name} value={i}>{name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Ubicacion</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Direccion</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Ej: Centro de Convenciones, CDMX"
                  value={form.location}
                  onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Horario</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Fecha</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={form.date}
                  onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Hora de inicio</label>
                <input
                  type="time"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={form.startTime}
                  onChange={e => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Hora de fin</label>
                <input
                  type="time"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={form.endTime}
                  onChange={e => setForm(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Maximo de participantes</label>
              <input
                type="number"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="100"
                value={form.maxParticipants}
                onChange={e => setForm(prev => ({ ...prev, maxParticipants: Number(e.target.value) }))}
              />
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
          onClick={handleSubmit}
          disabled={isPending || !form.name || !form.location || !form.date}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Enviando transaccion...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-5 w-5" /> Crear evento
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function ManageEvents() {
  const { events, isLoading, refetch } = useEpochs()
  const { activateEpoch, isPending: isActivating } = useActivateEpoch()
  const { closeEpoch, isPending: isClosing } = useCloseEpoch()
  const { finalizeEpoch, isPending: isFinalizing } = useFinalizeEpoch()
  const { batchDistribute, isPending: isDistributing } = useBatchDistribute()
  const [actioningId, setActioningId] = useState<string | null>(null)

  const handleActivate = async (epochId: string) => {
    setActioningId(epochId)
    await activateEpoch(BigInt(epochId))
    setTimeout(() => { refetch(); setActioningId(null) }, 5000)
  }

  const handleClose = async (epochId: string) => {
    setActioningId(epochId)
    await closeEpoch(BigInt(epochId))
    setTimeout(() => { refetch(); setActioningId(null) }, 5000)
  }

  const handleFinalize = async (epochId: string) => {
    setActioningId(epochId)
    await finalizeEpoch(BigInt(epochId))
    setTimeout(() => { refetch(); setActioningId(null) }, 5000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="animate-slide-up">
      <h1 className="mb-8 font-display text-3xl font-bold text-foreground">Gestionar eventos</h1>

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
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={actioningId === event.id}
                  onClick={() => handleActivate(event.id)}
                >
                  {actioningId === event.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Radio className="mr-1.5 h-3.5 w-3.5" />}
                  Iniciar
                </Button>
              )}
              {event.status === "live" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-warning/30 text-warning hover:bg-warning/10"
                  disabled={actioningId === event.id}
                  onClick={() => handleClose(event.id)}
                >
                  {actioningId === event.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Timer className="mr-1.5 h-3.5 w-3.5" />}
                  Finalizar
                </Button>
              )}
              {event.status === "ended" && (
                <Button
                  size="sm"
                  className="bg-success text-success-foreground hover:bg-success/90"
                  disabled={actioningId === event.id}
                  onClick={() => handleFinalize(event.id)}
                >
                  {actioningId === event.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Coins className="mr-1.5 h-3.5 w-3.5" />}
                  Finalizar y distribuir
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

      {events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <CalendarCheck className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mt-4 font-display text-lg font-semibold text-foreground">No hay eventos</p>
          <p className="mt-1 text-sm text-muted-foreground">Crea tu primer evento para empezar</p>
        </div>
      )}
    </div>
  )
}

function AttendanceVerification() {
  // For now, this requires selecting an epoch. We show a simplified version.
  const { events } = useEpochs()
  const [selectedEpochId, setSelectedEpochId] = useState<string | null>(null)
  const liveAndEndedEvents = events.filter(e => e.status === "live" || e.status === "ended")

  if (!selectedEpochId) {
    return (
      <div className="animate-slide-up">
        <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Verificacion de asistencia</h1>
        <p className="mb-8 text-muted-foreground">Selecciona un evento para verificar asistencia</p>

        <div className="space-y-3">
          {liveAndEndedEvents.map(event => (
            <button
              key={event.id}
              onClick={() => setSelectedEpochId(event.id)}
              className="flex w-full items-center justify-between rounded-xl border border-border/50 bg-card p-4 text-left transition-colors hover:border-primary/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.attendees} asistentes</p>
                </div>
              </div>
              <StatusBadge status={event.status} />
            </button>
          ))}
        </div>

        {liveAndEndedEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <UserCheck className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 font-display text-lg font-semibold text-foreground">Sin eventos activos</p>
            <p className="mt-1 text-sm text-muted-foreground">No hay eventos en vivo o finalizados para verificar</p>
          </div>
        )}
      </div>
    )
  }

  return <EpochAttendanceDetail epochId={selectedEpochId} onBack={() => setSelectedEpochId(null)} />
}

function EpochAttendanceDetail({ epochId, onBack }: { epochId: string; onBack: () => void }) {
  const { participants, isLoading } = useEpochParticipants(BigInt(epochId))
  const { verify, isPending: isVerifying } = useVerifyPresence()
  const { dispute, isPending: isDisputing } = useDisputePresence()
  const [actioningAddress, setActioningAddress] = useState<string | null>(null)

  const handleVerify = async (participant: `0x${string}`) => {
    setActioningAddress(participant)
    await verify(BigInt(epochId), participant)
    setActioningAddress(null)
  }

  const handleDispute = async (participant: `0x${string}`) => {
    setActioningAddress(participant)
    await dispute(BigInt(epochId), participant, "Asistencia no verificada")
    setActioningAddress(null)
  }

  return (
    <div className="animate-slide-up">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver a seleccion de evento
      </button>

      <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Asistentes - Evento #{epochId}</h1>
      <p className="mb-8 text-muted-foreground">{(participants as `0x${string}`[])?.length || 0} participantes registrados</p>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {(participants as `0x${string}`[])?.map((addr) => (
            <div key={addr} className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-mono text-sm font-medium text-foreground">{addr.slice(0, 6)}...{addr.slice(-4)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-7 bg-success text-success-foreground hover:bg-success/90 px-2"
                  disabled={actioningAddress === addr}
                  onClick={() => handleVerify(addr)}
                >
                  {actioningAddress === addr && isVerifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 border-destructive/30 text-destructive hover:bg-destructive/10 px-2"
                  disabled={actioningAddress === addr}
                  onClick={() => handleDispute(addr)}
                >
                  {actioningAddress === addr && isDisputing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!participants || (participants as `0x${string}`[]).length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <UserCheck className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mt-4 font-display text-lg font-semibold text-foreground">Sin participantes</p>
          <p className="mt-1 text-sm text-muted-foreground">Nadie se ha registrado en este evento todavia</p>
        </div>
      )}
    </div>
  )
}

function MetricsDashboard() {
  const metricCards = [
    { label: "Total asistentes", value: "---", icon: Users },
    { label: "Duracion promedio", value: "---", icon: Clock },
    { label: "AZIST distribuidos", value: "---", icon: Coins },
    { label: "Tasa de confirmacion", value: "---", icon: ShieldCheck },
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
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }} />
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
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="azist" fill="oklch(0.6 0.15 200)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminPanel() {
  const { setCurrentPage } = useApp()
  const { address } = useAccount()
  const { isAdmin, isLoading } = useIsAdmin(address)
  const [currentTab, setCurrentTab] = useState("dashboard")

  if (isLoading) {
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
