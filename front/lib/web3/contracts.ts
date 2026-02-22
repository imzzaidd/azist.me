import { type Address, zeroAddress } from "viem";

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

const DEFAULT_CHAIN_ID = 11155111; // Sepolia

export function getContractAddress(
  chainId: number | undefined,
  contract: ContractName
): Address {
  const chain = addresses[chainId ?? DEFAULT_CHAIN_ID] ?? addresses[DEFAULT_CHAIN_ID];
  return chain[contract];
}

export function isContractDeployed(
  chainId: number | undefined,
  contract: ContractName
): boolean {
  return getContractAddress(chainId, contract) !== zeroAddress;
}
