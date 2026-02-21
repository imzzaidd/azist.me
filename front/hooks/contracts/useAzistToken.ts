"use client";

import { useReadContract, useChainId } from "wagmi";
import { formatEther } from "viem";
import { azistTokenAbi, getContractAddress } from "@/lib/contracts";

export function useAzistBalance(address?: `0x${string}`) {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(chainId, "azistToken"),
    abi: azistTokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const raw = data ?? 0n;
  const balance = parseFloat(formatEther(raw));

  return {
    balance,
    raw,
    isLoading,
    error,
    refetch,
  };
}
