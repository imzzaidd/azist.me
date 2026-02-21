"use client";

import { useReadContract, useChainId } from "wagmi";
import { keccak256, toHex } from "viem";
import { roleManagerAbi, getContractAddress } from "@/lib/contracts";

const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;
const EPOCH_CREATOR_ROLE = keccak256(toHex("EPOCH_CREATOR_ROLE"));
const VALIDATOR_ROLE = keccak256(toHex("VALIDATOR_ROLE"));

export function useIsAdmin(address?: `0x${string}`) {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(chainId, "roleManager"),
    abi: roleManagerAbi,
    functionName: "hasRole",
    args: address ? [DEFAULT_ADMIN_ROLE, address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    isAdmin: data ?? false,
    isLoading,
    error,
    refetch,
  };
}

export function useIsEpochCreator(address?: `0x${string}`) {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(chainId, "roleManager"),
    abi: roleManagerAbi,
    functionName: "hasRole",
    args: address ? [EPOCH_CREATOR_ROLE, address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    isEpochCreator: data ?? false,
    isLoading,
    error,
    refetch,
  };
}

export function useIsValidator(address?: `0x${string}`) {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(chainId, "roleManager"),
    abi: roleManagerAbi,
    functionName: "hasRole",
    args: address ? [VALIDATOR_ROLE, address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    isValidator: data ?? false,
    isLoading,
    error,
    refetch,
  };
}
