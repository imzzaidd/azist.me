"use client";

import { useMemo } from "react";
import { useChainId } from "wagmi";
import { useAzistBalance } from "./useAzistToken";
import { useTotalXp, useLevel, useLevelMultiplier } from "./useLevelSystem";
import { useCurrentStreak, useStreakMultiplier } from "./useStreakTracker";
import { useLocalEvents } from "@/lib/local-events";
import { isContractDeployed } from "@/lib/contracts";
import type { UserStats } from "@/lib/types";

export function useUserStats(address?: `0x${string}`) {
  const chainId = useChainId();
  const deployed = isContractDeployed(chainId, "levelSystem");
  const { getUserRewards } = useLocalEvents();

  const { balance, isLoading: isLoadingBalance } = useAzistBalance(address);
  const { totalXp, isLoading: isLoadingXp } = useTotalXp(address);
  const { level, isLoading: isLoadingLevel } = useLevel(address);
  const { levelMultiplier, isLoading: isLoadingLevelMult } =
    useLevelMultiplier(address);
  const { currentStreak, isLoading: isLoadingStreak } =
    useCurrentStreak(address);
  const { streakMultiplier, isLoading: isLoadingStreakMult } =
    useStreakMultiplier(address);

  const isLoading = deployed
    ? isLoadingBalance ||
      isLoadingXp ||
      isLoadingLevel ||
      isLoadingLevelMult ||
      isLoadingStreak ||
      isLoadingStreakMult
    : false;

  const stats: UserStats = useMemo(() => {
    if (!deployed && address) {
      const local = getUserRewards(address);
      const localLevel = Math.floor(Math.sqrt(local.xp / 100));
      const xpToNext = 100 * (localLevel + 1) ** 2;
      return {
        azistBalance: local.azistBalance,
        xp: local.xp,
        level: localLevel,
        xpToNextLevel: xpToNext,
        levelMultiplier: 1 + localLevel * 0.1,
        streak: local.badges.length,
        streakMultiplier: 1 + Math.min(local.badges.length, 30) * 0.02,
      };
    }

    const currentLevel = typeof level === "number" ? level : 0;
    const currentXp = typeof totalXp === "bigint" ? Number(totalXp) : 0;
    const xpToNextLevel = 100 * (currentLevel + 1) ** 2;

    return {
      azistBalance: balance,
      xp: currentXp,
      level: currentLevel,
      xpToNextLevel,
      levelMultiplier,
      streak: typeof currentStreak === "number" ? currentStreak : 0,
      streakMultiplier,
    };
  }, [deployed, address, getUserRewards, balance, totalXp, level, levelMultiplier, currentStreak, streakMultiplier]);

  return {
    stats,
    isLoading,
  };
}
