# azist.me — Proof of Presence (PoP)

On-chain proof of **when** you arrived, **how long** you stayed, and **rewards** for sustained participation across 5 societal areas.

Built for **Monad Blitz CDMX** hackathon. Inspired by [7aychain](https://github.com/7ayLabs/7aychain) and [7ay-presence](https://github.com/7ayLabs/7ay-presence).

## Architecture

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

## Tech Stack

- **Solidity** ^0.8.26 (Cancun EVM)
- **Foundry** (Forge, Cast, Anvil)
- **OpenZeppelin** v5.5.0 (AccessControl, ERC20, ERC1155)

## License

MIT
