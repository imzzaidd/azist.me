"use client";

import { useReadContract, useChainId } from "wagmi";
import { streakTrackerAbi, getContractAddress } from "@/lib/contracts";

export function useCurrentStreak(address?: `0x${string}`) {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(chainId, "streakTracker"),
    abi: streakTrackerAbi,
    functionName: "getCurrentStreak",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    currentStreak: data ?? 0,
    isLoading,
    error,
    refetch,
  };
}

export function useStreakMultiplier(address?: `0x${string}`) {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(chainId, "streakTracker"),
    abi: streakTrackerAbi,
    functionName: "getStreakMultiplier",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const multiplier = data ? Number(data) / 10000 : 1.0;

  return {
    streakMultiplier: multiplier,
    raw: data ?? 10000,
    isLoading,
    error,
    refetch,
  };
}
