"use client"

import { useApp, type WalletState } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Wallet, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

function WalletStepContent({ state, onConnect, onRetry, onClose }: {
  state: WalletState
  onConnect: () => void
  onRetry: () => void
  onClose: () => void
}) {
  switch (state) {
    case "not-detected":
      return (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
            <AlertTriangle className="h-8 w-8 text-warning" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">Wallet no detectada</h3>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            No se detecto una wallet compatible. Instala MetaMask u otra wallet compatible con Web3.
          </p>
          <Button variant="outline" onClick={onClose} className="border-border text-foreground">Cerrar</Button>
        </div>
      )
    case "disconnected":
      return (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">Conecta tu wallet</h3>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Conecta tu wallet para empezar a ganar recompensas por tu presencia en eventos.
          </p>
          <Button onClick={onConnect} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Wallet className="mr-2 h-4 w-4" />
            Conectar wallet
          </Button>
        </div>
      )
    case "connecting":
      return (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">Conectando...</h3>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Aprueba la conexion en tu wallet para continuar.
          </p>
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-primary"
                style={{ animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        </div>
      )
    case "signing":
      return (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">Firma requerida</h3>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Firma el mensaje en tu wallet para verificar tu identidad.
          </p>
          {/* Skeleton loader */}
          <div className="w-full max-w-xs space-y-2">
            <div className="h-3 animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-3/4 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      )
    case "connected":
      return (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">Conectado</h3>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Tu wallet esta conectada exitosamente. Ya puedes empezar a ganar recompensas.
          </p>
        </div>
      )
    case "error":
      return (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">Error de conexion</h3>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Hubo un error al conectar tu wallet. Intenta de nuevo.
          </p>
          <Button onClick={onRetry} className="bg-primary text-primary-foreground hover:bg-primary/90">Reintentar</Button>
        </div>
      )
  }
}

export function WalletModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { walletState, connectWallet, setCurrentPage } = useApp()

  if (!open) return null

  const handleConnect = () => {
    connectWallet()
    setTimeout(() => {
      setCurrentPage("dashboard")
      onClose()
    }, 3500)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md animate-slide-up rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Cerrar"
        >
          <XCircle className="h-5 w-5" />
        </button>
        <WalletStepContent
          state={walletState}
          onConnect={handleConnect}
          onRetry={handleConnect}
          onClose={onClose}
        />
      </div>
    </div>
  )
}
