"use client"

import { useApp, type EventItem, type EventStatus, type AttendanceStatus } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Zap, LogOut, Calendar, MapPin, Clock, Users, ArrowLeft, Trophy,
  CheckCircle2, Timer, AlertCircle, Menu, X, Star, Radio, Tag,
  XCircle, Loader2, Coins
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"

/* ─── Status Badge ─── */
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

/* ─── Attendance Badge ─── */
function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  if (status === "none") return null
  const config: Record<Exclude<AttendanceStatus, "none">, { label: string; className: string }> = {
    arrived: { label: "Presente", className: "bg-primary/10 text-primary" },
    leaving: { label: "Saliendo", className: "bg-warning/10 text-warning" },
    confirmed: { label: "Asistencia confirmada", className: "bg-success/10 text-success" },
    rejected: { label: "Asistencia rechazada", className: "bg-destructive/10 text-destructive" },
  }
  const { label, className } = config[status]
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${className}`}>{label}</span>
}

/* ─── Navbar ─── */
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
          <button onClick={() => onNavigate("events")} className="text-sm font-medium text-foreground">Eventos</button>
          <button onClick={() => onNavigate("rewards")} className="text-sm text-muted-foreground hover:text-foreground">Recompensas</button>
          <button onClick={() => onNavigate("activity")} className="text-sm text-muted-foreground hover:text-foreground">Actividad</button>
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

/* ─── Event Card ─── */
function EventCard({ event, onSelect }: { event: EventItem; onSelect: (e: EventItem) => void }) {
  const { getEstimatedReward, walletState } = useApp()
  const reward = walletState === "connected" ? getEstimatedReward(event) : null

  return (
    <div className="group overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="relative h-44 bg-secondary">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Calendar className="h-8 w-8 text-primary/60" />
          </div>
        </div>
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <StatusBadge status={event.status} />
        </div>
        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-card/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm flex items-center gap-1">
            <Tag className="h-3 w-3" /> {event.category}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-foreground">{event.title}</h3>
          {event.attendanceStatus && event.attendanceStatus !== "none" && (
            <AttendanceBadge status={event.attendanceStatus} />
          )}
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" /> {event.date} &middot; {event.time} - {event.endTime}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Min. {event.minAttendance} min de asistencia
          </div>
          {event.attendees > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> {event.attendees} asistentes
            </div>
          )}
        </div>
        {/* Reward range */}
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
          <Coins className="h-4 w-4 text-primary" />
          {reward ? (
            <span className="text-xs font-semibold text-primary">
              {reward.min === reward.max
                ? `~${reward.max} AZIST`
                : `${reward.min} - ${reward.max} AZIST`}
            </span>
          ) : (
            <span className="text-xs font-semibold text-primary">{event.baseReward} AZIST base</span>
          )}
        </div>
        <Button
          size="sm"
          className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => onSelect(event)}
        >
          Ver detalles
        </Button>
      </div>
    </div>
  )
}

/* ─── Event Detail ─── */
function EventDetail({ event, onBack, onCheckin }: { event: EventItem; onBack: () => void; onCheckin: () => void }) {
  const { getEstimatedReward, getRewardExplanation, walletState } = useApp()
  const reward = walletState === "connected" ? getEstimatedReward(event) : null
  const canCheckin = event.status === "live" && (!event.attendanceStatus || event.attendanceStatus === "none")

  return (
    <div className="animate-slide-up">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver a eventos
      </button>
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
        <div className="relative h-56 bg-secondary md:h-72">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <Calendar className="h-10 w-10 text-primary/60" />
            </div>
          </div>
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <StatusBadge status={event.status} />
            <span className="rounded-full bg-card/90 px-3 py-1 text-sm font-medium text-foreground backdrop-blur-sm">
              {event.category}
            </span>
          </div>
        </div>
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">{event.title}</h1>
              {event.attendanceStatus && event.attendanceStatus !== "none" && (
                <div className="mt-2">
                  <AttendanceBadge status={event.attendanceStatus} />
                </div>
              )}
            </div>
            {reward && (
              <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2">
                <Coins className="h-5 w-5 text-primary" />
                <span className="font-display text-xl font-bold text-primary">
                  {reward.min === reward.max ? `~${reward.max}` : `${reward.min}-${reward.max}`}
                </span>
                <span className="text-sm text-primary/70">AZIST</span>
              </div>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-muted-foreground">{event.description}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-secondary/30 p-4">
              <MapPin className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Ubicacion</p>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-secondary/30 p-4">
              <Calendar className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Fecha y hora</p>
                <p className="text-sm text-muted-foreground">{event.date} de {event.time} a {event.endTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-secondary/30 p-4">
              <Timer className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Asistencia minima requerida</p>
                <p className="text-sm text-muted-foreground">{event.minAttendance} minutos</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-secondary/30 p-4">
              <Clock className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Duracion maxima recompensable</p>
                <p className="text-sm text-muted-foreground">{event.maxRewardDuration} minutos</p>
              </div>
            </div>
          </div>

          {/* Reward explanation */}
          {walletState === "connected" && (
            <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Como se calcula tu recompensa</p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {getRewardExplanation()}
              </p>
            </div>
          )}

          {canCheckin ? (
            <Button
              size="lg"
              className="mt-8 w-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 md:w-auto"
              onClick={onCheckin}
            >
              <Radio className="mr-2 h-5 w-5" />
              Registrar llegada
            </Button>
          ) : event.status === "upcoming" ? (
            <div className="mt-8 rounded-xl bg-secondary/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">Este evento aun no ha comenzado. Vuelve el <span className="font-semibold text-foreground">{event.date}</span> a las <span className="font-semibold text-foreground">{event.time}</span>.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/* ─── Check-in: Waiting for validation ─── */
function WaitingValidation({ event, onComplete }: { event: EventItem; onComplete: () => void }) {
  const { confirmAttendance, rejectAttendance } = useApp()
  const [phase, setPhase] = useState<"validating" | "confirmed" | "rejected">("validating")

  useEffect(() => {
    // Simulate validation: confirm after 3 seconds (in real app this comes from backend)
    const timer = setTimeout(() => {
      confirmAttendance(event.id)
      setPhase("confirmed")
    }, 3000)
    return () => clearTimeout(timer)
  }, [event.id, confirmAttendance])

  if (phase === "validating") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center animate-slide-up">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Verificando asistencia...</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Estamos confirmando tu presencia en el evento. Esto puede tomar un momento.
          </p>
          <div className="mt-6 mx-auto w-48">
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full animate-pulse rounded-full bg-primary" style={{ width: "60%" }} />
            </div>
          </div>
          {/* Simulated rejection button for demo */}
          <button
            onClick={() => { rejectAttendance(event.id); setPhase("rejected") }}
            className="mt-8 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            (Demo: simular rechazo)
          </button>
        </div>
      </div>
    )
  }

  if (phase === "rejected") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center animate-slide-up">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Asistencia rechazada</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            No pudimos verificar tu presencia en este evento. Si crees que es un error, contacta al organizador.
          </p>
          <Button onClick={onComplete} variant="outline" className="mt-8 border-border text-foreground">Volver a eventos</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center animate-slide-up">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-12 w-12 text-success" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Asistencia confirmada</h2>
        <p className="mt-2 text-muted-foreground">{event.title}</p>
        <Button onClick={onComplete} className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
          Continuar
        </Button>
      </div>
    </div>
  )
}

/* ─── Check-in: Prolonged attendance tracking ─── */
function AttendanceTracker({ event, onComplete }: { event: EventItem; onComplete: () => void }) {
  const { arriveAtEvent, leaveEvent, confirmAttendance } = useApp()
  const totalSeconds = (event.minAttendance) * 1 // 1 sec per "minute" for demo
  const [elapsed, setElapsed] = useState(0)
  const [phase, setPhase] = useState<"arriving" | "active" | "validating" | "confirmed" | "left-early">("arriving")

  const progress = Math.min((elapsed / totalSeconds) * 100, 100)
  const remaining = Math.max(totalSeconds - elapsed, 0)

  useEffect(() => {
    // Simulate arrival validation
    const arrivalTimer = setTimeout(() => {
      arriveAtEvent(event.id)
      setPhase("active")
    }, 1500)
    return () => clearTimeout(arrivalTimer)
  }, [event.id, arriveAtEvent])

  useEffect(() => {
    if (phase !== "active") return
    const timer = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1
        if (next >= totalSeconds) {
          clearInterval(timer)
          setPhase("validating")
          setTimeout(() => {
            confirmAttendance(event.id)
            setPhase("confirmed")
          }, 2000)
        }
        return next
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [phase, totalSeconds, event.id, confirmAttendance])

  const handleLeaveEarly = useCallback(() => {
    leaveEvent(event.id)
    setPhase("left-early")
  }, [event.id, leaveEvent])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  if (phase === "arriving") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center animate-slide-up">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Registrando llegada...</h2>
          <p className="mt-2 text-muted-foreground">Confirmando tu presencia en el evento</p>
        </div>
      </div>
    )
  }

  if (phase === "validating") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center animate-slide-up">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Verificando asistencia...</h2>
          <p className="mt-2 text-muted-foreground">Calculando tu recompensa final</p>
        </div>
      </div>
    )
  }

  if (phase === "confirmed") {
    const { getEstimatedReward } = useApp()
    const reward = getEstimatedReward(event)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center animate-slide-up">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-12 w-12 text-success" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Asistencia completada</h2>
          <p className="mt-2 text-muted-foreground">{event.title}</p>
          <div className="mt-6 animate-count-up">
            <span className="font-display text-5xl font-bold text-primary">+{reward.max}</span>
            <p className="mt-1 text-sm text-primary/70">AZIST ganados</p>
          </div>
          <Button onClick={onComplete} className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">Continuar</Button>
        </div>
      </div>
    )
  }

  if (phase === "left-early") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center animate-slide-up">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Salida anticipada</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Saliste antes de completar el tiempo minimo de {event.minAttendance} minutos. No se otorgaron recompensas.
          </p>
          <Button onClick={onComplete} variant="outline" className="mt-8 border-border text-foreground">Volver a eventos</Button>
        </div>
      </div>
    )
  }

  // phase === "active"
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md text-center animate-slide-up">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Presente
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">{event.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Seguimiento de asistencia activo</p>

        {/* Circular progress */}
        <div className="relative mx-auto mt-8 h-48 w-48">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" className="stroke-secondary" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="44" fill="none" className="stroke-primary transition-all duration-1000"
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${progress * 2.76} ${276 - progress * 2.76}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-bold tabular-nums text-foreground">{formatTime(remaining)}</span>
            <span className="text-xs text-muted-foreground">restante</span>
          </div>
        </div>

        <div className="mt-6 space-y-3 rounded-xl border border-border/50 bg-secondary/30 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Duracion total del evento</span>
            <span className="font-medium text-foreground">{event.duration} min</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Asistencia minima</span>
            <span className="font-medium text-foreground">{event.minAttendance} min</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Duracion maxima recompensable</span>
            <span className="font-medium text-foreground">{event.maxRewardDuration} min</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-secondary" />
        </div>

        <Button
          variant="outline"
          onClick={handleLeaveEarly}
          className="mt-6 border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          Registrar salida
        </Button>
      </div>
    </div>
  )
}

/* ─── Events Page ─── */
export function EventsPage() {
  const { events, setCurrentPage, walletState } = useApp()
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [checkinEvent, setCheckinEvent] = useState<EventItem | null>(null)
  const [filter, setFilter] = useState<"all" | EventStatus>("all")

  const filtered = filter === "all" ? events : events.filter(e => e.status === filter)

  if (checkinEvent) {
    const isQuickEvent = checkinEvent.minAttendance <= 60
    return (
      <div className="min-h-screen bg-background">
        <Navbar onNavigate={(p) => { setCheckinEvent(null); setSelectedEvent(null); setCurrentPage(p) }} />
        <main className="mx-auto max-w-7xl px-4 py-6">
          {isQuickEvent ? (
            <WaitingValidation event={checkinEvent} onComplete={() => { setCheckinEvent(null); setSelectedEvent(null) }} />
          ) : (
            <AttendanceTracker event={checkinEvent} onComplete={() => { setCheckinEvent(null); setSelectedEvent(null) }} />
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {walletState === "connected" ? (
        <Navbar onNavigate={setCurrentPage} />
      ) : (
        <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <button onClick={() => setCurrentPage("landing")} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"><Zap className="h-4 w-4 text-primary-foreground" /></div>
              <span className="font-display text-lg font-bold text-foreground">PoP Rewards</span>
            </button>
            <Button size="sm" onClick={() => setCurrentPage("landing")} className="bg-primary text-primary-foreground">Conectar Wallet</Button>
          </div>
        </nav>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        {selectedEvent ? (
          <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} onCheckin={() => setCheckinEvent(selectedEvent)} />
        ) : (
          <>
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground">Eventos</h1>
              <p className="mt-2 text-muted-foreground">Descubre eventos y gana recompensas por tu asistencia</p>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {[
                { value: "all" as const, label: "Todos" },
                { value: "live" as const, label: "En vivo" },
                { value: "upcoming" as const, label: "Proximos" },
                { value: "ended" as const, label: "Finalizados" },
                { value: "finalized" as const, label: "Recompensas enviadas" },
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

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(event => (
                <EventCard key={event.id} event={event} onSelect={setSelectedEvent} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mt-4 font-display text-lg font-semibold text-foreground">No hay eventos</p>
                <p className="mt-1 text-sm text-muted-foreground">No se encontraron eventos con este filtro</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
