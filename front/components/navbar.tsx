"use client"

import { useApp } from "@/lib/app-context"
import { useAccount } from "wagmi"
import { useIsAdmin } from "@/hooks/contracts/useRoleManager"
import { WalletButton } from "@/components/wallet-modal"
import { Zap, Menu, X } from "lucide-react"
import { useState } from "react"

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "admin", label: "Admin", adminOnly: true },
  { id: "create", label: "Crear Evento" },
  { id: "manage", label: "Gestionar Eventos" },
  { id: "metrics", label: "Metricas" },
]

export function Navbar({ activePage }: { activePage: string }) {
  const { setCurrentPage } = useApp()
  const { address } = useAccount()
  const { isAdmin } = useIsAdmin(address)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin)

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <button onClick={() => setCurrentPage("dashboard")} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">PoP</span>
        </button>

        <div className="hidden items-center gap-6 md:flex">
          {visibleItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`text-sm transition-colors ${
                activePage === item.id
                  ? "font-medium text-foreground"
                  : item.adminOnly
                    ? "text-primary hover:text-primary/80"
                    : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <WalletButton />
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border/50 bg-background p-4 md:hidden">
          <div className="flex flex-col gap-3">
            {visibleItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setCurrentPage(item.id); setMobileMenuOpen(false) }}
                className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activePage === item.id
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="mt-2 border-t border-border pt-3">
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
