import { type Address } from "viem";

export type ContractName =
  | "roleManager"
  | "azistToken"
  | "areaRegistry"
  | "epochManager"
  | "presenceRegistry"
  | "levelSystem"
  | "streakTracker"
  | "badgeManager"
  | "rewardDistributor";

type ContractAddresses = Record<ContractName, Address>;

const addresses: Record<number, ContractAddresses> = {
  // Sepolia testnet — fill after deployment with `forge script Deploy.s.sol`
  11155111: {
    roleManager: "0x0000000000000000000000000000000000000000",
    azistToken: "0x0000000000000000000000000000000000000000",
    areaRegistry: "0x0000000000000000000000000000000000000000",
    epochManager: "0x0000000000000000000000000000000000000000",
    presenceRegistry: "0x0000000000000000000000000000000000000000",
    levelSystem: "0x0000000000000000000000000000000000000000",
    streakTracker: "0x0000000000000000000000000000000000000000",
    badgeManager: "0x0000000000000000000000000000000000000000",
    rewardDistributor: "0x0000000000000000000000000000000000000000",
  },
};

export function getContractAddress(
  chainId: number,
  contract: ContractName
): Address {
  const chain = addresses[chainId];
  if (!chain)
    throw new Error(`No contract addresses configured for chain ${chainId}`);
  return chain[contract];
}
