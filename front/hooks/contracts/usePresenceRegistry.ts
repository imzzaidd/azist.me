"use client";

import { useReadContract, useChainId } from "wagmi";
import { presenceRegistryAbi, getContractAddress, isContractDeployed } from "@/lib/contracts";
import { useContractTransaction } from "../useContractTransaction";

// READ HOOKS

export function usePresence(epochId: bigint, address?: `0x${string}`) {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(chainId, "presenceRegistry"),
    abi: presenceRegistryAbi,
    functionName: "getPresence",
    args: [epochId, address!],
    query: {
      enabled: !!address && isContractDeployed(chainId, "presenceRegistry"),
    },
  });

  return {
    presence: data,
    isLoading,
    error,
    refetch,
  };
}

export function useTotalCheckIns(address?: `0x${string}`) {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(chainId, "presenceRegistry"),
    abi: presenceRegistryAbi,
    functionName: "totalCheckIns",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isContractDeployed(chainId, "presenceRegistry"),
    },
  });

  return {
    totalCheckIns: data ?? 0n,
    isLoading,
    error,
    refetch,
  };
}

export function useEpochParticipants(epochId: bigint) {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(chainId, "presenceRegistry"),
    abi: presenceRegistryAbi,
    functionName: "getEpochParticipants",
    args: [epochId],
    query: { enabled: isContractDeployed(chainId, "presenceRegistry") },
  });

  return {
    participants: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

export function useIsRewardEligible(epochId: bigint, address?: `0x${string}`) {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(chainId, "presenceRegistry"),
    abi: presenceRegistryAbi,
    functionName: "isRewardEligible",
    args: [epochId, address!],
    query: {
      enabled: !!address && isContractDeployed(chainId, "presenceRegistry"),
    },
  });

  return {
    isEligible: data ?? false,
    isLoading,
    error,
    refetch,
  };
}

// WRITE HOOKS

export function useCheckIn() {
  const chainId = useChainId();
  const { write, isPending, hash } = useContractTransaction();

  const checkIn = async (epochId: bigint) => {
    return write({
      address: getContractAddress(chainId, "presenceRegistry"),
      abi: presenceRegistryAbi,
      functionName: "checkIn",
      args: [epochId],
    });
  };

  return {
    checkIn,
    isPending,
    hash,
  };
}

export function useCheckOut() {
  const chainId = useChainId();
  const { write, isPending, hash } = useContractTransaction();

  const checkOut = async (epochId: bigint) => {
    return write({
      address: getContractAddress(chainId, "presenceRegistry"),
      abi: presenceRegistryAbi,
      functionName: "checkOut",
      args: [epochId],
    });
  };

  return {
    checkOut,
    isPending,
    hash,
  };
}

export function useVerifyPresence() {
  const chainId = useChainId();
  const { write, isPending, hash } = useContractTransaction();

  const verify = async (epochId: bigint, participant: `0x${string}`) => {
    return write({
      address: getContractAddress(chainId, "presenceRegistry"),
      abi: presenceRegistryAbi,
      functionName: "verifyPresence",
      args: [epochId, participant],
    });
  };

  return {
    verify,
    isPending,
    hash,
  };
}

export function useDisputePresence() {
  const chainId = useChainId();
  const { write, isPending, hash } = useContractTransaction();

  const dispute = async (
    epochId: bigint,
    participant: `0x${string}`,
    reason: string
  ) => {
    return write({
      address: getContractAddress(chainId, "presenceRegistry"),
      abi: presenceRegistryAbi,
      functionName: "disputePresence",
      args: [epochId, participant, reason],
    });
  };

  return {
    dispute,
    isPending,
    hash,
  };
}
