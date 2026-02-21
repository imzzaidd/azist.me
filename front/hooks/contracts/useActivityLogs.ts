"use client";

import { useState, useEffect } from "react";
import { usePublicClient, useChainId } from "wagmi";
import { formatEther } from "viem";
import {
  rewardDistributorAbi,
  presenceRegistryAbi,
  getContractAddress,
} from "@/lib/contracts";
import type { Activity } from "@/lib/types";

export function useActivityLogs(address?: `0x${string}`) {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address || !publicClient) {
      setActivities([]);
      return;
    }

    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const rewardDistributorAddress = getContractAddress(
          chainId,
          "rewardDistributor"
        );
        const presenceRegistryAddress = getContractAddress(
          chainId,
          "presenceRegistry"
        );

        // Fetch RewardDistributed events
        const rewardLogs = await publicClient.getLogs({
          address: rewardDistributorAddress,
          event: {
            type: "event",
            name: "RewardDistributed",
            inputs: [
              { name: "epochId", type: "uint256", indexed: true },
              { name: "participant", type: "address", indexed: true },
              { name: "amount", type: "uint256", indexed: false },
            ],
          },
          args: {
            participant: address,
          },
          fromBlock: "earliest",
          toBlock: "latest",
        });

        // Fetch CheckedIn events
        const checkInLogs = await publicClient.getLogs({
          address: presenceRegistryAddress,
          event: {
            type: "event",
            name: "CheckedIn",
            inputs: [
              { name: "epochId", type: "uint256", indexed: true },
              { name: "participant", type: "address", indexed: true },
              { name: "checkInTime", type: "uint64", indexed: false },
            ],
          },
          args: {
            participant: address,
          },
          fromBlock: "earliest",
          toBlock: "latest",
        });

        // Fetch CheckedOut events
        const checkOutLogs = await publicClient.getLogs({
          address: presenceRegistryAddress,
          event: {
            type: "event",
            name: "CheckedOut",
            inputs: [
              { name: "epochId", type: "uint256", indexed: true },
              { name: "participant", type: "address", indexed: true },
              { name: "checkOutTime", type: "uint64", indexed: false },
              { name: "duration", type: "uint64", indexed: false },
            ],
          },
          args: {
            participant: address,
          },
          fromBlock: "earliest",
          toBlock: "latest",
        });

        // Transform logs to Activity objects
        const activitiesArray: Activity[] = [];

        // Process reward logs
        for (const log of rewardLogs) {
          const block = await publicClient.getBlock({
            blockNumber: log.blockNumber,
          });

          const amount = log.args.amount ?? 0n;
          const azistAmount = parseFloat(formatEther(amount));

          activitiesArray.push({
            id: log.transactionHash || `reward-${log.logIndex}`,
            eventName: `Evento #${log.args.epochId?.toString() || "?"}`,
            date: new Date(Number(block.timestamp) * 1000).toLocaleDateString(
              "es-ES"
            ),
            azist: azistAmount,
            xp: Math.floor(azistAmount * 10), // Approximate XP calculation
            status: "Completado",
            txHash: log.transactionHash || "",
            type: "reward",
          });
        }

        // Process check-in logs
        for (const log of checkInLogs) {
          const block = await publicClient.getBlock({
            blockNumber: log.blockNumber,
          });

          activitiesArray.push({
            id: log.transactionHash || `checkin-${log.logIndex}`,
            eventName: `Check-In Evento #${log.args.epochId?.toString() || "?"}`,
            date: new Date(Number(block.timestamp) * 1000).toLocaleDateString(
              "es-ES"
            ),
            azist: 0,
            xp: 0,
            status: "Registrado",
            txHash: log.transactionHash || "",
            type: "checkin",
          });
        }

        // Process check-out logs
        for (const log of checkOutLogs) {
          const block = await publicClient.getBlock({
            blockNumber: log.blockNumber,
          });

          const duration = log.args.duration ?? 0n;
          const durationMinutes = Number(duration) / 60;

          activitiesArray.push({
            id: log.transactionHash || `checkout-${log.logIndex}`,
            eventName: `Check-Out Evento #${log.args.epochId?.toString() || "?"} (${Math.floor(durationMinutes)}min)`,
            date: new Date(Number(block.timestamp) * 1000).toLocaleDateString(
              "es-ES"
            ),
            azist: 0,
            xp: 0,
            status: "Completado",
            txHash: log.transactionHash || "",
            type: "checkout",
          });
        }

        // Sort by block number descending (most recent first)
        activitiesArray.sort((a, b) => {
          const aLog =
            rewardLogs.find((l) => l.transactionHash === a.txHash) ||
            checkInLogs.find((l) => l.transactionHash === a.txHash) ||
            checkOutLogs.find((l) => l.transactionHash === a.txHash);
          const bLog =
            rewardLogs.find((l) => l.transactionHash === b.txHash) ||
            checkInLogs.find((l) => l.transactionHash === b.txHash) ||
            checkOutLogs.find((l) => l.transactionHash === b.txHash);

          if (!aLog || !bLog) return 0;
          return Number(bLog.blockNumber) - Number(aLog.blockNumber);
        });

        setActivities(activitiesArray);
      } catch (err) {
        console.error("Error fetching activity logs:", err);
        setError(
          err instanceof Error ? err : new Error("Error desconocido")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [address, publicClient, chainId]);

  return {
    activities,
    isLoading,
    error,
  };
}
