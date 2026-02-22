"use client"

import { useApp } from "@/lib/app-context"
import { useAccount } from "wagmi"
import { useIsAdmin } from "@/hooks/contracts/useRoleManager"
import { useCreateEpoch } from "@/hooks/contracts/useEpochManager"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { AREA_NAMES } from "@/lib/types"
import { Plus, MapPin, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { useState } from "react"

export function CreateEventPage() {
  const { setCurrentPage } = useApp()
  const { address } = useAccount()
  const { isAdmin, isLoading: isLoadingAdmin } = useIsAdmin(address)
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

  const handleSubmit = async () => {
    if (!form.name || !form.location || !form.date || !form.startTime || !form.endTime) return

    const startDateTime = new Date(`${form.date}T${form.startTime}`)
    const endDateTime = new Date(`${form.date}T${form.endTime}`)
    const startTimestamp = BigInt(Math.floor(startDateTime.getTime() / 1000))
    const endTimestamp = BigInt(Math.floor(endDateTime.getTime() / 1000))

    await createEpoch(form.name, form.location, form.area, startTimestamp, endTimestamp, form.maxParticipants)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar activePage="create" />
      <main className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        {submitted ? (
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
        ) : (
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
        )}
      </main>
    </div>
  )
}
