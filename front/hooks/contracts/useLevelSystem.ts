"use client";

import { useReadContract, useChainId } from "wagmi";
import { levelSystemAbi, getContractAddress, isContractDeployed } from "@/lib/contracts";

export function useTotalXp(address?: `0x${string}`) {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(chainId, "levelSystem"),
    abi: levelSystemAbi,
    functionName: "getTotalXp",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isContractDeployed(chainId, "levelSystem"),
    },
  });

  return {
    totalXp: data ?? 0n,
    isLoading,
    error,
    refetch,
  };
}

export function useLevel(address?: `0x${string}`) {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(chainId, "levelSystem"),
    abi: levelSystemAbi,
    functionName: "getLevel",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isContractDeployed(chainId, "levelSystem"),
    },
  });

  return {
    level: data ?? 0,
    isLoading,
    error,
    refetch,
  };
}

export function useLevelMultiplier(address?: `0x${string}`) {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(chainId, "levelSystem"),
    abi: levelSystemAbi,
    functionName: "getLevelMultiplier",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isContractDeployed(chainId, "levelSystem"),
    },
  });

  const multiplier = data ? Number(data) / 10000 : 1.0;

  return {
    levelMultiplier: multiplier,
    raw: data ?? 10000,
    isLoading,
    error,
    refetch,
  };
}
