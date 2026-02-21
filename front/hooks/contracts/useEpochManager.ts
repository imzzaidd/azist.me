"use client";

import { useReadContract, useChainId } from "wagmi";
import { epochManagerAbi, getContractAddress } from "@/lib/contracts";
import { useContractTransaction } from "../useContractTransaction";

// READ HOOKS

export function useEpochCount() {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(chainId, "epochManager"),
    abi: epochManagerAbi,
    functionName: "epochCount",
  });

  return {
    epochCount: data ?? 0n,
    isLoading,
    error,
    refetch,
  };
}

export function useEpoch(epochId: bigint) {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(chainId, "epochManager"),
    abi: epochManagerAbi,
    functionName: "getEpoch",
    args: [epochId],
    query: {
      enabled: epochId > 0n,
    },
  });

  return {
    epoch: data,
    isLoading,
    error,
    refetch,
  };
}

// WRITE HOOKS

export function useCreateEpoch() {
  const chainId = useChainId();
  const { write, isPending, hash } = useContractTransaction();

  const createEpoch = async (
    name: string,
    location: string,
    area: number,
    startTime: bigint,
    endTime: bigint,
    maxParticipants: number
  ) => {
    return write({
      address: getContractAddress(chainId, "epochManager"),
      abi: epochManagerAbi,
      functionName: "createEpoch",
      args: [name, location, area, startTime, endTime, maxParticipants],
    });
  };

  return {
    createEpoch,
    isPending,
    hash,
  };
}

export function useActivateEpoch() {
  const chainId = useChainId();
  const { write, isPending, hash } = useContractTransaction();

  const activateEpoch = async (epochId: bigint) => {
    return write({
      address: getContractAddress(chainId, "epochManager"),
      abi: epochManagerAbi,
      functionName: "activateEpoch",
      args: [epochId],
    });
  };

  return {
    activateEpoch,
    isPending,
    hash,
  };
}

export function useCloseEpoch() {
  const chainId = useChainId();
  const { write, isPending, hash } = useContractTransaction();

  const closeEpoch = async (epochId: bigint) => {
    return write({
      address: getContractAddress(chainId, "epochManager"),
      abi: epochManagerAbi,
      functionName: "closeEpoch",
      args: [epochId],
    });
  };

  return {
    closeEpoch,
    isPending,
    hash,
  };
}

export function useFinalizeEpoch() {
  const chainId = useChainId();
  const { write, isPending, hash } = useContractTransaction();

  const finalizeEpoch = async (epochId: bigint) => {
    return write({
      address: getContractAddress(chainId, "epochManager"),
      abi: epochManagerAbi,
      functionName: "finalizeEpoch",
      args: [epochId],
    });
  };

  return {
    finalizeEpoch,
    isPending,
    hash,
  };
}
