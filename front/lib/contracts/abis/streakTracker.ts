export const streakTrackerAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_roleManager", type: "address", internalType: "address" }],
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
    name: "currentStreak",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint32", internalType: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "longestStreak",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint32", internalType: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCurrentStreak",
    inputs: [{ name: "participant", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint32", internalType: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLongestStreak",
    inputs: [{ name: "participant", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint32", internalType: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getStreakMultiplier",
    inputs: [{ name: "participant", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint16", internalType: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "StreakUpdated",
    inputs: [
      { name: "participant", type: "address", indexed: true },
      { name: "newStreak", type: "uint32", indexed: false },
    ],
  },
  {
    type: "event",
    name: "StreakReset",
    inputs: [{ name: "participant", type: "address", indexed: true }],
  },
  {
    type: "event",
    name: "NewLongestStreak",
    inputs: [
      { name: "participant", type: "address", indexed: true },
      { name: "streak", type: "uint32", indexed: false },
    ],
  },
] as const;
