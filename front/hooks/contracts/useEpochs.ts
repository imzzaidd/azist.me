"use client";

import { useMemo } from "react";
import { useReadContract, useReadContracts, useChainId } from "wagmi";
import {
  epochManagerAbi,
  areaRegistryAbi,
  getContractAddress,
  isContractDeployed,
} from "@/lib/contracts";
import {
  AREA_NAMES,
  EPOCH_STATE_MAP,
  AREA_IMAGES,
  type EventItem,
} from "@/lib/types";

export function useEpochs() {
  const chainId = useChainId();

  const deployed = isContractDeployed(chainId, "epochManager");

  // First, get the total count of epochs
  const { data: epochCount, isLoading: isLoadingCount } = useReadContract({
    address: getContractAddress(chainId, "epochManager"),
    abi: epochManagerAbi,
    functionName: "epochCount",
    query: { enabled: deployed },
  });

  // Build multicall contracts array for all epochs
  const epochContracts = useMemo(() => {
    if (!epochCount || epochCount === 0n) return [];

    const contracts = [];
    for (let i = 1n; i <= epochCount; i++) {
      contracts.push({
        address: getContractAddress(chainId, "epochManager"),
        abi: epochManagerAbi,
        functionName: "getEpoch" as const,
        args: [i],
      });
    }
    return contracts;
  }, [epochCount, chainId]);

  // Batch fetch all epochs
  const {
    data: epochsData,
    isLoading: isLoadingEpochs,
    error: epochsError,
    refetch,
  } = useReadContracts({
    contracts: epochContracts,
    query: {
      enabled: epochContracts.length > 0,
    },
  });

  // Extract unique area types from epochs
  const uniqueAreas = useMemo(() => {
    if (!epochsData) return [];
    const areas = new Set<number>();
    epochsData.forEach((result) => {
      if (result.status === "success" && result.result) {
        areas.add(result.result.area);
      }
    });
    return Array.from(areas);
  }, [epochsData]);

  // Build multicall for area configs
  const areaContracts = useMemo(() => {
    return uniqueAreas.map((area) => ({
      address: getContractAddress(chainId, "areaRegistry"),
      abi: areaRegistryAbi,
      functionName: "getAreaConfig" as const,
      args: [area],
    }));
  }, [uniqueAreas, chainId]);

  // Batch fetch all area configs
  const { data: areaConfigsData, isLoading: isLoadingAreas } =
    useReadContracts({
      contracts: areaContracts,
      query: {
        enabled: areaContracts.length > 0,
      },
    });

  // Transform on-chain data to UI EventItem format
  const events: EventItem[] = useMemo(() => {
    if (!epochsData || !areaConfigsData) return [];

    // Create area config lookup map
    const areaConfigMap = new Map();
    uniqueAreas.forEach((area, index) => {
      const configResult = areaConfigsData[index];
      if (configResult && configResult.status === "success") {
        areaConfigMap.set(area, configResult.result);
      }
    });

    return epochsData
      .map((result) => {
        if (result.status !== "success" || !result.result) return null;

        const epoch = result.result;
        const areaConfig = areaConfigMap.get(epoch.area);

        if (!areaConfig) return null;

        // Transform timestamps to date/time strings
        const startDate = new Date(Number(epoch.startTime) * 1000);
        const endDate = new Date(Number(epoch.endTime) * 1000);

        // Calculate duration in minutes
        const durationSeconds = Number(epoch.endTime) - Number(epoch.startTime);
        const durationMinutes = Math.floor(durationSeconds / 60);

        // Get area name
        const categoryName = AREA_NAMES[epoch.area] || "Desconocido";

        // Get status from state
        const status = EPOCH_STATE_MAP[epoch.state] || "upcoming";

        // Calculate base reward (1 AZIST per minute base rate)
        const baseReward = durationMinutes * 1;

        // Convert area config values
        const categoryMultiplier = Number(areaConfig.rewardMultiplier) / 10000;
        const minAttendance = Math.floor(Number(areaConfig.minStaySeconds) / 60);
        const maxRewardDuration = Math.floor(
          Number(areaConfig.maxRewardDuration) / 60
        );

        const eventItem: EventItem = {
          id: epoch.id.toString(),
          title: epoch.name,
          description: `Evento en ${epoch.location}`,
          category: categoryName,
          categoryMultiplier,
          startTimestamp: Number(epoch.startTime),
          date: startDate.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          time: startDate.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          endTime: endDate.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          location: epoch.location,
          image: AREA_IMAGES[categoryName] || "/placeholder.svg",
          baseReward,
          status,
          duration: durationMinutes,
          minAttendance,
          maxRewardDuration,
          attendees: Number(epoch.participantCount),
          maxParticipants: Number(epoch.maxParticipants),
        };

        return eventItem;
      })
      .filter((event): event is EventItem => event !== null);
  }, [epochsData, areaConfigsData, uniqueAreas]);

  const isLoading = isLoadingCount || isLoadingEpochs || isLoadingAreas;

  return {
    events,
    isLoading,
    error: epochsError,
    refetch,
  };
}
