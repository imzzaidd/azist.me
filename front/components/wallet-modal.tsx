"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: { opacity: 0, pointerEvents: "none" as const, userSelect: "none" as const },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Conectar Wallet
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground"
                  >
                    Red incorrecta
                  </button>
                )
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openAccountModal}
                    className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5 transition-colors hover:bg-secondary"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="font-mono text-xs text-foreground">
                      {account.displayName}
                    </span>
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
