"use client";

import { useReadContract, useChainId } from "wagmi";
import { badgeManagerAbi, getContractAddress, isContractDeployed } from "@/lib/contracts";

export function useBadgeCount(address?: `0x${string}`) {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(chainId, "badgeManager"),
    abi: badgeManagerAbi,
    functionName: "getBadgeCount",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isContractDeployed(chainId, "badgeManager"),
    },
  });

  return {
    badgeCount: data ?? 0n,
    isLoading,
    error,
    refetch,
  };
}
