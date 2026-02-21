"use client"

import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { MapPin, Shield, Trophy, Users, Zap, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [target])
  return <span>{count.toLocaleString()}{suffix}</span>
}

export function LandingPage() {
  const { setCurrentPage, connectWallet } = useApp()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <img 
              src="/logo.png" 
              alt="Azist logo"
              className="h-7 w-7 object-contain"
            />
          </div>
            <span className="font-display text-lg font-bold text-foreground">azist.me</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <button onClick={() => setCurrentPage("events")} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Eventos</button>
            <button onClick={() => setCurrentPage("rewards")} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Recompensas</button>
            <button onClick={() => setCurrentPage("activity")} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Actividad</button>
          </div>
          <Button onClick={connectWallet} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Conectar Wallet
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-primary)/0.08,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,var(--color-primary)/0.05,transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-32">
          <div className={`mx-auto max-w-3xl text-center transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Proof of Presence Protocol
            </div>
            <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl">
              <span className="text-balance">Asiste. Valida.</span>{" "}
              <span className="text-primary">Gana.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
              Gana AZIST tokens y recompensas reales por asistir a eventos. Tu nivel y racha aumentan tus recompensas.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                onClick={connectWallet}
                className="w-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
              >
                Activar recompensas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setCurrentPage("events")}
                className="w-full border-border text-foreground hover:bg-secondary sm:w-auto"
              >
                Explorar eventos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="relative border-t border-border/50 bg-secondary/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Como funciona</h2>
            <p className="mt-3 text-muted-foreground">Tres simples pasos para empezar a ganar</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: MapPin, title: "Asiste", desc: "Asiste a eventos fisicos verificados por la comunidad Web3.", step: "01" },
              { icon: Shield, title: "Valida", desc: "Tu presencia es verificada y tu duracion de asistencia determina tu recompensa.", step: "02" },
              { icon: Trophy, title: "Gana", desc: "Acumula AZIST tokens y XP. Tu nivel y racha aumentan tus ganancias.", step: "03" },
            ].map((item) => (
              <div key={item.step} className="group relative rounded-2xl border border-border/50 bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                <div className="mb-6 text-xs font-medium tracking-wider text-primary">{item.step}</div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      {/*}
      <section className="border-t border-border/50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: "Usuarios activos", value: 12500, suffix: "+" },
              { label: "Eventos verificados", value: 840, suffix: "" },
              { label: "AZIST distribuidos", value: 2400000, suffix: "" },
              { label: "Recompensas canjeadas", value: 15600, suffix: "" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-3xl font-bold text-foreground md:text-4xl">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      */} 

            {/* About Protocol */}
      <section className="border-t border-border/50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              ¿Qué es azist.me?
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              azist.me es un protocolo de <span className="text-primary font-medium">Proof of Presence (PoP) </span> 
              que recompensa tu participación real en eventos y actividades comunitarias.
              Registramos <span className="text-foreground font-medium">cuándo llegas</span>, 
              <span className="text-foreground font-medium"> cuánto tiempo permaneces</span> y 
              convertimos tu constancia en recompensas on-chain.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-border/50 bg-card p-8">
              <h3 className="mb-3 font-display text-xl font-semibold text-foreground">
                Presencia verificable
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                Cada check-in y check-out queda registrado en blockchain, generando
                un historial transparente y confiable de tu participación.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-8">
              <h3 className="mb-3 font-display text-xl font-semibold text-foreground">
                5 áreas de impacto
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                Ambiental, Comunidad, Educación, Salud y Cultura. 
                Cada área tiene multiplicadores que aumentan tus recompensas
                según tu nivel y tu racha de participación.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-8">
              <h3 className="mb-3 font-display text-xl font-semibold text-foreground">
                Recompensas dinámicas
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                Ganas tokens AZIST según los minutos que participes.
                Tu nivel, constancia y área elegida potencian tus ganancias,
                creando un sistema justo y gamificado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 bg-secondary/30 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Unete a la comunidad</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Miles de personas ya estan ganando recompensas por su presencia. Conecta tu wallet y empieza hoy.
          </p>
          <Button
            size="lg"
            onClick={connectWallet}
            className="mt-8 bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
          >
            Comenzar ahora
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <Zap className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">azist.me</span>
          </div>
          <p className="text-sm text-muted-foreground">2026 Proof of Presence. Construido en blockchain.</p>
        </div>
      </footer>
    </div>
  )
}
