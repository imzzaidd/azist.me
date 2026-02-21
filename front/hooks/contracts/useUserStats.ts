"use client";

import { useMemo } from "react";
import { useAzistBalance } from "./useAzistToken";
import { useTotalXp, useLevel, useLevelMultiplier } from "./useLevelSystem";
import { useCurrentStreak, useStreakMultiplier } from "./useStreakTracker";
import type { UserStats } from "@/lib/types";

export function useUserStats(address?: `0x${string}`) {
  const { balance, isLoading: isLoadingBalance } = useAzistBalance(address);
  const { totalXp, isLoading: isLoadingXp } = useTotalXp(address);
  const { level, isLoading: isLoadingLevel } = useLevel(address);
  const { levelMultiplier, isLoading: isLoadingLevelMult } =
    useLevelMultiplier(address);
  const { currentStreak, isLoading: isLoadingStreak } =
    useCurrentStreak(address);
  const { streakMultiplier, isLoading: isLoadingStreakMult } =
    useStreakMultiplier(address);

  const isLoading =
    isLoadingBalance ||
    isLoadingXp ||
    isLoadingLevel ||
    isLoadingLevelMult ||
    isLoadingStreak ||
    isLoadingStreakMult;

  const stats: UserStats = useMemo(() => {
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
  }, [balance, totalXp, level, levelMultiplier, currentStreak, streakMultiplier]);

  return {
    stats,
    isLoading,
  };
}
