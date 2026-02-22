"use client"

import { useApp } from "@/lib/app-context"
import { useAccount } from "wagmi"
import { useEpochs } from "@/hooks/contracts/useEpochs"
import { useUserStats } from "@/hooks/contracts/useUserStats"
import { useCheckIn, useCheckOut, usePresence } from "@/hooks/contracts/usePresenceRegistry"
import { Navbar } from "@/components/navbar"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { Button } from "@/components/ui/button"
import type { EventItem, EventStatus, AttendanceStatus } from "@/lib/types"
import { PRESENCE_STATE_MAP } from "@/lib/types"
import {
  Calendar, MapPin, Clock, Users, ArrowLeft,
  CheckCircle2, Timer, Star, Radio, Tag,
  XCircle, Loader2, Coins, Share2, Copy, Check
} from "lucide-react"
import { useState, useEffect, useCallback, useMemo } from "react"

/* --- Status Badge --- */
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

/* --- Attendance Badge --- */
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

/* --- Event Card --- */
function EventCard({ event, onSelect }: { event: EventItem; onSelect: (e: EventItem) => void }) {
  const { isConnected, address } = useAccount()
  const { stats } = useUserStats(address)

  const reward = useMemo(() => {
    if (!isConnected) return null
    const base = event.baseReward
    const catMul = event.categoryMultiplier
    const min = Math.round(base * catMul)
    const max = Math.round(base * catMul * stats.levelMultiplier * stats.streakMultiplier)
    return { min, max }
  }, [isConnected, event.baseReward, event.categoryMultiplier, stats.levelMultiplier, stats.streakMultiplier])

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
              <Users className="h-3.5 w-3.5" /> {event.attendees}{event.maxParticipants > 0 ? `/${event.maxParticipants}` : ""} asistentes
            </div>
          )}
        </div>
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

/* --- Share Button --- */
function ShareButton({ eventId }: { eventId: string }) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}?page=events&event=${eventId}`
    : ""

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Evento azist.me", url: shareUrl })
    } else {
      handleCopy()
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="border-primary/30 text-primary hover:bg-primary/10"
      onClick={handleShare}
    >
      {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Share2 className="mr-1.5 h-4 w-4" />}
      {copied ? "Enlace copiado" : "Compartir"}
    </Button>
  )
}

/* --- Event Detail --- */
function EventDetail({ event, onBack, onCheckin, isCheckinPending }: {
  event: EventItem;
  onBack: () => void;
  onCheckin: () => void;
  isCheckinPending: boolean;
}) {
  const { isConnected, address } = useAccount()
  const { stats } = useUserStats(address)

  const reward = useMemo(() => {
    if (!isConnected) return null
    const base = event.baseReward
    const catMul = event.categoryMultiplier
    const min = Math.round(base * catMul)
    const max = Math.round(base * catMul * stats.levelMultiplier * stats.streakMultiplier)
    return { min, max }
  }, [isConnected, event.baseReward, event.categoryMultiplier, stats.levelMultiplier, stats.streakMultiplier])

  const canCheckin = event.status === "live" && (!event.attendanceStatus || event.attendanceStatus === "none")

  const rewardExplanation = isConnected
    ? `Tu nivel ${stats.level} te da un bonus de x${stats.levelMultiplier.toFixed(2)} y tu racha de ${stats.streak} dias te da un bonus adicional de x${stats.streakMultiplier.toFixed(2)}. La categoria del evento tambien afecta tu recompensa final.`
    : ""

  return (
    <div className="animate-slide-up">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Volver a eventos
        </button>
        <ShareButton eventId={event.id} />
      </div>
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

          {isConnected && rewardExplanation && (
            <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Como se calcula tu recompensa</p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{rewardExplanation}</p>
            </div>
          )}

          {canCheckin ? (
            <Button
              size="lg"
              className="mt-8 w-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 md:w-auto"
              onClick={onCheckin}
              disabled={isCheckinPending}
            >
              {isCheckinPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Radio className="mr-2 h-5 w-5" />
                  Registrar llegada
                </>
              )}
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

/* --- Attendance Tracker (after check-in) --- */
function AttendanceTracker({ event, onComplete }: { event: EventItem; onComplete: () => void }) {
  const { address } = useAccount()
  const { checkOut, isPending: isCheckoutPending } = useCheckOut()
  const epochId = BigInt(event.id)
  const { presence, refetch: refetchPresence } = usePresence(epochId, address)

  // Poll presence status every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchPresence()
    }, 10000)
    return () => clearInterval(interval)
  }, [refetchPresence])

  // Derive attendance status from on-chain presence
  const attendanceStatus: AttendanceStatus = useMemo(() => {
    if (!presence) return "arrived"
    const state = typeof presence === "object" && "state" in presence ? Number((presence as { state: unknown }).state) : 0
    return PRESENCE_STATE_MAP[state] || "arrived"
  }, [presence])

  if (attendanceStatus === "confirmed") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center animate-slide-up">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-12 w-12 text-success" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Asistencia confirmada</h2>
          <p className="mt-2 text-muted-foreground">{event.title}</p>
          <p className="mt-4 text-sm text-muted-foreground">Tu recompensa sera distribuida cuando el evento se finalice.</p>
          <Button onClick={onComplete} className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">Continuar</Button>
        </div>
      </div>
    )
  }

  if (attendanceStatus === "rejected") {
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

  // Active attendance - waiting for check-out or validator confirmation
  const handleCheckOut = () => {
    checkOut(epochId)
  }

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
        <p className="mt-1 text-sm text-muted-foreground">Tu asistencia esta siendo registrada en la blockchain</p>

        <div className="mt-8 space-y-3 rounded-xl border border-border/50 bg-secondary/30 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estado</span>
            <span className="font-medium text-primary">Registrado en cadena</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Asistencia minima</span>
            <span className="font-medium text-foreground">{event.minAttendance} min</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Duracion maxima recompensable</span>
            <span className="font-medium text-foreground">{event.maxRewardDuration} min</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Un validador confirmara tu asistencia. Cuando termines, registra tu salida.
        </p>

        <Button
          variant="outline"
          onClick={handleCheckOut}
          disabled={isCheckoutPending}
          className="mt-6 border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          {isCheckoutPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrando salida...
            </>
          ) : (
            "Registrar salida"
          )}
        </Button>
      </div>
    </div>
  )
}

/* --- Events Page --- */
export function EventsPage() {
  const { setCurrentPage, selectedEventId, setSelectedEventId } = useApp()
  const { isConnected, address } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { events, isLoading } = useEpochs()
  const { checkIn, isPending: isCheckinPending } = useCheckIn()
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [checkinEvent, setCheckinEvent] = useState<EventItem | null>(null)
  const [filter, setFilter] = useState<"all" | EventStatus>("all")

  // Auto-open event from shared link
  useEffect(() => {
    if (selectedEventId && events.length > 0 && !selectedEvent) {
      const event = events.find(e => e.id === selectedEventId)
      if (event) {
        setSelectedEvent(event)
        setSelectedEventId(null)
      }
    }
  }, [selectedEventId, events, selectedEvent, setSelectedEventId])

  const filtered = filter === "all" ? events : events.filter(e => e.status === filter)

  const handleCheckin = useCallback((event: EventItem) => {
    if (!isConnected) {
      openConnectModal?.()
      return
    }
    checkIn(BigInt(event.id))
    setCheckinEvent(event)
  }, [isConnected, openConnectModal, checkIn])

  if (checkinEvent) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar activePage="events" />
        <main className="mx-auto max-w-7xl px-4 py-6">
          <AttendanceTracker event={checkinEvent} onComplete={() => { setCheckinEvent(null); setSelectedEvent(null) }} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar activePage="events" />

      <main className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        {selectedEvent ? (
          <EventDetail
            event={selectedEvent}
            onBack={() => setSelectedEvent(null)}
            onCheckin={() => handleCheckin(selectedEvent)}
            isCheckinPending={isCheckinPending}
          />
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

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-muted-foreground">Cargando eventos...</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(event => (
                  <EventCard key={event.id} event={event} onSelect={setSelectedEvent} />
                ))}
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
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
