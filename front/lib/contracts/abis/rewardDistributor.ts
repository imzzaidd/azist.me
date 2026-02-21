export const rewardDistributorAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_roleManager", type: "address", internalType: "address" },
      { name: "_token", type: "address", internalType: "address" },
      { name: "_epochManager", type: "address", internalType: "address" },
      { name: "_presenceRegistry", type: "address", internalType: "address" },
      { name: "_areaRegistry", type: "address", internalType: "address" },
      { name: "_levelSystem", type: "address", internalType: "address" },
      { name: "_streakTracker", type: "address", internalType: "address" },
      { name: "_badgeManager", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "BASIS_POINTS",
    inputs: [],
    outputs: [{ name: "", type: "uint16", internalType: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "BASE_RATE_PER_MINUTE",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rewarded",
    inputs: [
      { name: "", type: "uint256", internalType: "uint256" },
      { name: "", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calculateReward",
    inputs: [
      { name: "epochId", type: "uint256", internalType: "uint256" },
      { name: "participant", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "distributeReward",
    inputs: [
      { name: "epochId", type: "uint256", internalType: "uint256" },
      { name: "participant", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "batchDistribute",
    inputs: [
      { name: "epochId", type: "uint256", internalType: "uint256" },
      { name: "participants", type: "address[]", internalType: "address[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "RewardDistributed",
    inputs: [
      { name: "epochId", type: "uint256", indexed: true },
      { name: "participant", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "BadgeCheckCompleted",
    inputs: [
      { name: "participant", type: "address", indexed: true },
      { name: "badgesAwarded", type: "uint256", indexed: false },
    ],
  },
] as const;
