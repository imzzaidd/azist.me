"use client"

import { useApp } from "@/lib/app-context"
import { useAccount } from "wagmi"
import { useIsAdmin } from "@/hooks/contracts/useRoleManager"
import { useEpochs } from "@/hooks/contracts/useEpochs"
import { useActivateEpoch, useCloseEpoch, useFinalizeEpoch } from "@/hooks/contracts/useEpochManager"
import { useEpochParticipants, useVerifyPresence, useDisputePresence } from "@/hooks/contracts/usePresenceRegistry"
import { useBatchDistribute } from "@/hooks/contracts/useRewardDistributor"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import type { EventStatus } from "@/lib/types"
import {
  CalendarCheck, Users, Clock, ArrowLeft, CheckCircle2,
  AlertCircle, Radio, Timer, Coins, XCircle, UserCheck,
  Loader2
} from "lucide-react"
import { useState } from "react"

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
    <div>
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
    <div>
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver a seleccion de evento
      </button>

      <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Asistentes - Evento #{epochId}</h2>
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

function AttendanceVerification() {
  const { events } = useEpochs()
  const [selectedEpochId, setSelectedEpochId] = useState<string | null>(null)
  const liveAndEndedEvents = events.filter(e => e.status === "live" || e.status === "ended")

  if (selectedEpochId) {
    return <EpochAttendanceDetail epochId={selectedEpochId} onBack={() => setSelectedEpochId(null)} />
  }

  return (
    <div>
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

export function ManageEventsPage() {
  const { setCurrentPage } = useApp()
  const { address } = useAccount()
  const { isAdmin, isLoading: isLoadingAdmin } = useIsAdmin(address)
  const [view, setView] = useState<"events" | "attendance">("events")

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar activePage="manage" />
      <main className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        <div className="animate-slide-up">
          <h1 className="mb-6 font-display text-3xl font-bold text-foreground">Gestionar eventos</h1>

          <div className="mb-6 flex items-center gap-2">
            <button
              onClick={() => setView("events")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${view === "events" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              Eventos
            </button>
            <button
              onClick={() => setView("attendance")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${view === "attendance" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              Asistencia
            </button>
          </div>

          {view === "events" && <ManageEvents />}
          {view === "attendance" && <AttendanceVerification />}
        </div>
      </main>
    </div>
  )
}
