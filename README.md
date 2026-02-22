# azist.me — Proof of Presence (PoP)

On-chain proof of **when** you arrived, **how long** you stayed, and **rewards** for sustained participation across 5 societal areas.

Built for **Monad Blitz CDMX** hackathon. Inspired by [7aychain](https://github.com/7ayLabs/7aychain) and [7ay-presence](https://github.com/7ayLabs/7ay-presence).

## Architecture

### Smart Contracts

```
src/
├── access/RoleManager.sol              — Role-based access control (4 roles)
├── token/AzistToken.sol                — ERC20 reward token (AZIST)
├── areas/AreaRegistry.sol              — 5 societal areas with configurable params
├── core/
│   ├── EpochManager.sol                — Epoch lifecycle (Scheduled → Active → Closed → Finalized)
│   ├── PresenceRegistry.sol            — Check-in/check-out with duration tracking
│   └── RewardDistributor.sol           — Duration-based reward calculation & distribution
└── gamification/
    ├── LevelSystem.sol                 — XP & level progression (100 × n² curve)
    ├── StreakTracker.sol               — Consecutive participation streaks
    └── BadgeManager.sol                — 12 soulbound ERC1155 achievement badges
```

### Frontend

```
front/
├── app/
│   ├── layout.tsx                      — Root layout with Web3Provider + RainbowKit
│   └── page.tsx                        — Client-side page router
├── components/
│   ├── navbar.tsx                      — Shared navigation bar
│   ├── landing-page.tsx                — Public landing page
│   ├── dashboard.tsx                   — User dashboard (balance, XP, streak, activity)
│   ├── admin-page.tsx                  — Admin overview with on-chain metrics
│   ├── create-event-page.tsx           — Create epoch form (on-chain tx)
│   ├── manage-events-page.tsx          — Epoch lifecycle + attendance verification
│   └── metrics-page.tsx                — Charts and stats from on-chain data
├── hooks/contracts/
│   ├── useAzistToken.ts                — Token balance reads
│   ├── useEpochs.ts                    — Multicall epoch + area config fetching
│   ├── useEpochManager.ts             — Create/activate/close/finalize epochs
│   ├── usePresenceRegistry.ts          — Check-in/out + verify/dispute presence
│   ├── useRewardDistributor.ts         — Batch reward distribution
│   ├── useRoleManager.ts              — Admin/creator/validator role checks
│   ├── useLevelSystem.ts              — XP, level, level multiplier
│   ├── useStreakTracker.ts            — Streak count and multiplier
│   ├── useUserStats.ts               — Aggregated user stats from all contracts
│   ├── useActivityLogs.ts            — On-chain event log queries
│   └── useAdminMetrics.ts            — Derived admin metrics from epoch data
└── lib/
    ├── web3/config.ts                  — wagmi + RainbowKit config (Sepolia)
    ├── web3/providers.tsx              — WagmiProvider + QueryClient + RainbowKit
    ├── web3/contracts.ts               — Contract addresses per chain
    ├── contracts/abis/                 — 9 ABI files extracted from Forge output
    └── types.ts                        — Shared TypeScript types
```

## Areas

| Area | Multiplier | Min Stay | Max Duration | XP/min |
|------|-----------|----------|-------------|--------|
| Environmental | 1.5x | 30 min | 6 hours | 15 |
| Community | 1.3x | 20 min | 8 hours | 12 |
| Education | 1.2x | 45 min | 4 hours | 10 |
| Health | 1.1x | 15 min | 3 hours | 8 |
| Cultural | 1.4x | 30 min | 5 hours | 13 |

## Reward Formula

```
reward = (minutes × 1 AZIST) × areaMultiplier × levelMultiplier × streakMultiplier
```

## Quick Start

### Contracts

```shell
# Build
forge build

# Test (176 tests)
forge test

# Test with verbose output
forge test -vvv

# Gas report
forge test --gas-report

# Format
forge fmt

# Deploy (dry run)
forge script script/Deploy.s.sol --fork-url <rpc_url>
```

### Frontend

```shell
cd front

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your WalletConnect project ID and RPC URL

# Development
npm run dev

# Build
npm run build
```

**Environment variables** (`.env.local`):

```
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.drpc.org
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Tech Stack

- **Solidity** ^0.8.26 (Cancun EVM)
- **Foundry** (Forge, Cast, Anvil)
- **OpenZeppelin** v5.5.0 (AccessControl, ERC20, ERC1155)
- **Next.js** 16 + React 19 + TypeScript
- **wagmi** v2 + **viem** v2 + **@tanstack/react-query**
- **RainbowKit** — Wallet connection UI
- **Tailwind CSS** v4 + **shadcn/ui**
- **Recharts** — Admin metrics charts
- **Sepolia** testnet (chain ID 11155111)

## License

MIT
