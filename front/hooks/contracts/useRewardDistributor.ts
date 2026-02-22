"use client";

import { useReadContract, useChainId } from "wagmi";
import { formatEther } from "viem";
import { rewardDistributorAbi, getContractAddress, isContractDeployed } from "@/lib/contracts";
import { useContractTransaction } from "../useContractTransaction";

// READ HOOKS

export function useCalculateReward(epochId: bigint, address?: `0x${string}`) {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(chainId, "rewardDistributor"),
    abi: rewardDistributorAbi,
    functionName: "calculateReward",
    args: [epochId, address!],
    query: {
      enabled: !!address && isContractDeployed(chainId, "rewardDistributor"),
    },
  });

  const raw = data ?? 0n;
  const reward = parseFloat(formatEther(raw));

  return {
    reward,
    raw,
    isLoading,
    error,
    refetch,
  };
}

// WRITE HOOKS

export function useBatchDistribute() {
  const chainId = useChainId();
  const { write, isPending, hash } = useContractTransaction();

  const batchDistribute = async (
    epochId: bigint,
    participants: `0x${string}`[]
  ) => {
    return write({
      address: getContractAddress(chainId, "rewardDistributor"),
      abi: rewardDistributorAbi,
      functionName: "batchDistribute",
      args: [epochId, participants],
    });
  };

  return {
    batchDistribute,
    isPending,
    hash,
  };
}
