"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { AREA_NAMES, AREA_IMAGES, type EventItem, type EventStatus, type Activity, type AttendanceStatus } from "@/lib/types"

const STORAGE_KEY = "azist_local_events"
const REWARDS_KEY = "azist_local_rewards"

// --- Persisted types ---

interface LocalParticipant {
  address: string
  status: AttendanceStatus
  checkInTime: number
}

interface LocalBadge {
  eventId: string
  eventName: string
  category: string
  date: string
  azistEarned: number
}

interface LocalUserRewards {
  azistBalance: number
  xp: number
  badges: LocalBadge[]
  activities: Activity[]
}

// --- Storage helpers ---

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full — silently ignore
  }
}

// --- Context type ---

interface LocalEventsContextType {
  events: EventItem[]
  addEvent: (params: {
    name: string
    location: string
    area: number
    startTime: number
    endTime: number
    maxParticipants: number
  }) => void
  updateStatus: (id: string, status: EventStatus) => void
  // Participation
  checkIn: (eventId: string, address: string) => void
  checkOut: (eventId: string, address: string) => void
  getParticipants: (eventId: string) => LocalParticipant[]
  getAttendanceStatus: (eventId: string, address: string) => AttendanceStatus
  verifyAttendance: (eventId: string, address: string) => void
  disputeAttendance: (eventId: string, address: string) => void
  // Rewards
  finalizeAndDistribute: (eventId: string) => void
  getUserRewards: (address: string) => LocalUserRewards
}

const LocalEventsContext = createContext<LocalEventsContextType | undefined>(undefined)

// Participants stored separately per event
function participantsKey(eventId: string) {
  return `azist_participants_${eventId}`
}

function rewardsForUser(address: string): LocalUserRewards {
  const all = load<Record<string, LocalUserRewards>>(REWARDS_KEY, {})
  return all[address.toLowerCase()] ?? { azistBalance: 0, xp: 0, badges: [], activities: [] }
}

function saveUserRewards(address: string, rewards: LocalUserRewards) {
  const all = load<Record<string, LocalUserRewards>>(REWARDS_KEY, {})
  all[address.toLowerCase()] = rewards
  save(REWARDS_KEY, all)
}

export function LocalEventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<EventItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  // Force re-render trigger for rewards reads
  const [rewardsVersion, setRewardsVersion] = useState(0)

  useEffect(() => {
    setEvents(load<EventItem[]>(STORAGE_KEY, []))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) save(STORAGE_KEY, events)
  }, [events, hydrated])

  // --- Event CRUD ---

  const addEvent = useCallback((params: {
    name: string; location: string; area: number
    startTime: number; endTime: number; maxParticipants: number
  }) => {
    const startDate = new Date(params.startTime * 1000)
    const endDate = new Date(params.endTime * 1000)
    const durationMinutes = Math.floor((params.endTime - params.startTime) / 60)
    const categoryName = AREA_NAMES[params.area] || "Desconocido"

    setEvents(prev => {
      const newEvent: EventItem = {
        id: String(prev.length + 1),
        title: params.name,
        description: `Evento en ${params.location}`,
        category: categoryName,
        categoryMultiplier: [1.5, 1.3, 1.2, 1.1, 1.4][params.area] ?? 1.0,
        startTimestamp: params.startTime,
        date: startDate.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" }),
        time: startDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        endTime: endDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        location: params.location,
        image: AREA_IMAGES[categoryName] || "/placeholder.svg",
        baseReward: durationMinutes,
        status: "upcoming",
        duration: durationMinutes,
        minAttendance: [30, 20, 45, 15, 30][params.area] ?? 30,
        maxRewardDuration: [360, 480, 240, 180, 300][params.area] ?? 300,
        attendees: 0,
        maxParticipants: params.maxParticipants,
      }
      return [...prev, newEvent]
    })
  }, [])

  const updateStatus = useCallback((id: string, status: EventStatus) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status } : e))
  }, [])

  // --- Participation ---

  const checkIn = useCallback((eventId: string, address: string) => {
    const key = participantsKey(eventId)
    const participants = load<LocalParticipant[]>(key, [])
    const existing = participants.find(p => p.address.toLowerCase() === address.toLowerCase())
    if (existing) return // already checked in

    participants.push({ address: address.toLowerCase(), status: "arrived", checkInTime: Math.floor(Date.now() / 1000) })
    save(key, participants)

    // Increment attendee count
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, attendees: e.attendees + 1 } : e
    ))

    // Add activity
    const rewards = rewardsForUser(address)
    const event = events.find(e => e.id === eventId)
    rewards.activities.unshift({
      id: `checkin-${eventId}-${Date.now()}`,
      eventName: `Check-In: ${event?.title || `Evento #${eventId}`}`,
      date: new Date().toLocaleDateString("es-ES"),
      azist: 0,
      xp: 0,
      status: "Registrado",
      txHash: "",
      type: "checkin",
    })
    saveUserRewards(address, rewards)
    setRewardsVersion(v => v + 1)
  }, [events])

  const checkOut = useCallback((eventId: string, address: string) => {
    const key = participantsKey(eventId)
    const participants = load<LocalParticipant[]>(key, [])
    const updated = participants.map(p =>
      p.address.toLowerCase() === address.toLowerCase()
        ? { ...p, status: "leaving" as AttendanceStatus }
        : p
    )
    save(key, updated)
    setRewardsVersion(v => v + 1)
  }, [])

  const getParticipants = useCallback((eventId: string): LocalParticipant[] => {
    return load<LocalParticipant[]>(participantsKey(eventId), [])
  }, [rewardsVersion]) // eslint-disable-line react-hooks/exhaustive-deps

  const getAttendanceStatus = useCallback((eventId: string, address: string): AttendanceStatus => {
    const participants = load<LocalParticipant[]>(participantsKey(eventId), [])
    const p = participants.find(x => x.address.toLowerCase() === address.toLowerCase())
    return p?.status ?? "none"
  }, [rewardsVersion]) // eslint-disable-line react-hooks/exhaustive-deps

  const verifyAttendance = useCallback((eventId: string, address: string) => {
    const key = participantsKey(eventId)
    const participants = load<LocalParticipant[]>(key, [])
    const updated = participants.map(p =>
      p.address.toLowerCase() === address.toLowerCase()
        ? { ...p, status: "confirmed" as AttendanceStatus }
        : p
    )
    save(key, updated)
    setRewardsVersion(v => v + 1)
  }, [])

  const disputeAttendance = useCallback((eventId: string, address: string) => {
    const key = participantsKey(eventId)
    const participants = load<LocalParticipant[]>(key, [])
    const updated = participants.map(p =>
      p.address.toLowerCase() === address.toLowerCase()
        ? { ...p, status: "rejected" as AttendanceStatus }
        : p
    )
    save(key, updated)
    setRewardsVersion(v => v + 1)
  }, [])

  // --- Finalize: distribute AZIST + mint NFT badge ---

  const finalizeAndDistribute = useCallback((eventId: string) => {
    const event = events.find(e => e.id === eventId)
    if (!event) return

    const participants = load<LocalParticipant[]>(participantsKey(eventId), [])
    const confirmed = participants.filter(p => p.status === "confirmed" || p.status === "arrived" || p.status === "leaving")

    const dateStr = new Date().toLocaleDateString("es-ES")

    for (const p of confirmed) {
      const azistReward = Math.round(event.baseReward * event.categoryMultiplier)
      const xpReward = Math.floor(azistReward * 10)
      const rewards = rewardsForUser(p.address)

      // Add AZIST tokens
      rewards.azistBalance += azistReward
      rewards.xp += xpReward

      // Mint NFT badge
      rewards.badges.push({
        eventId,
        eventName: event.title,
        category: event.category,
        date: event.date,
        azistEarned: azistReward,
      })

      // Add reward activity
      rewards.activities.unshift({
        id: `reward-${eventId}-${p.address}-${Date.now()}`,
        eventName: event.title,
        date: dateStr,
        azist: azistReward,
        xp: xpReward,
        status: "Completado",
        txHash: "",
        type: "reward",
      })

      // Mark participant as confirmed
      const key = participantsKey(eventId)
      const all = load<LocalParticipant[]>(key, [])
      save(key, all.map(x =>
        x.address.toLowerCase() === p.address.toLowerCase()
          ? { ...x, status: "confirmed" as AttendanceStatus }
          : x
      ))

      saveUserRewards(p.address, rewards)
    }

    // Update event status
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, status: "finalized" as EventStatus } : e
    ))

    setRewardsVersion(v => v + 1)
  }, [events])

  const getUserRewards = useCallback((address: string): LocalUserRewards => {
    return rewardsForUser(address)
  }, [rewardsVersion]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LocalEventsContext.Provider value={{
      events, addEvent, updateStatus,
      checkIn, checkOut, getParticipants, getAttendanceStatus,
      verifyAttendance, disputeAttendance,
      finalizeAndDistribute, getUserRewards,
    }}>
      {children}
    </LocalEventsContext.Provider>
  )
}

export function useLocalEvents() {
  const context = useContext(LocalEventsContext)
  if (!context) throw new Error("useLocalEvents must be used within LocalEventsProvider")
  return context
}
