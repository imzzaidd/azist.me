"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, mainnet } from "wagmi/chains";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: "Azist PoP",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "placeholder",
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.drpc.org"
    ),
    [mainnet.id]: http(),
  },
  ssr: true,
});
