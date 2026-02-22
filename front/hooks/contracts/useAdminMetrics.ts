"use client"

import { useMemo } from "react"
import { useEpochs } from "./useEpochs"

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export function useAdminMetrics() {
  const { events, isLoading } = useEpochs()

  const metrics = useMemo(() => {
    if (!events.length) {
      return {
        totalAttendees: 0,
        averageDuration: 0,
        totalEvents: 0,
        finalizedEvents: 0,
        chartData: [] as { name: string; attendees: number; azist: number }[],
      }
    }

    const totalAttendees = events.reduce((sum, e) => sum + e.attendees, 0)
    const averageDuration = Math.round(events.reduce((sum, e) => sum + e.duration, 0) / events.length)
    const totalEvents = events.length
    const finalizedEvents = events.filter(e => e.status === "finalized").length

    // Group events by month for chart data
    const byMonth = new Map<string, { attendees: number; azist: number }>()
    for (const event of events) {
      const date = new Date(event.startTimestamp * 1000)
      const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`
      const label = MONTH_NAMES[date.getMonth()]
      const existing = byMonth.get(key) || { attendees: 0, azist: 0, label }
      existing.attendees += event.attendees
      existing.azist += event.baseReward * event.attendees
      byMonth.set(key, { ...existing, label } as { attendees: number; azist: number })
    }

    const chartData = Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => {
        const month = parseInt(key.split("-")[1])
        return {
          name: MONTH_NAMES[month],
          attendees: data.attendees,
          azist: data.azist,
        }
      })

    return { totalAttendees, averageDuration, totalEvents, finalizedEvents, chartData }
  }, [events])

  return { metrics, isLoading }
}
