export const presenceRegistryAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_roleManager", type: "address", internalType: "address" },
      { name: "_epochManager", type: "address", internalType: "address" },
      { name: "_areaRegistry", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "totalCheckIns",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPresence",
    inputs: [
      { name: "epochId", type: "uint256", internalType: "uint256" },
      { name: "participant", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct PresenceRegistry.PresenceRecord",
        components: [
          { name: "epochId", type: "uint256", internalType: "uint256" },
          { name: "participant", type: "address", internalType: "address" },
          { name: "checkInTime", type: "uint64", internalType: "uint64" },
          { name: "checkOutTime", type: "uint64", internalType: "uint64" },
          { name: "state", type: "uint8", internalType: "enum PresenceRegistry.PresenceState" },
          { name: "validatorVerified", type: "bool", internalType: "bool" },
          { name: "duration", type: "uint64", internalType: "uint64" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPresenceState",
    inputs: [
      { name: "epochId", type: "uint256", internalType: "uint256" },
      { name: "participant", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint8", internalType: "enum PresenceRegistry.PresenceState" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEpochParticipants",
    inputs: [{ name: "epochId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isRewardEligible",
    inputs: [
      { name: "epochId", type: "uint256", internalType: "uint256" },
      { name: "participant", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "checkIn",
    inputs: [{ name: "epochId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "checkOut",
    inputs: [{ name: "epochId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "verifyPresence",
    inputs: [
      { name: "epochId", type: "uint256", internalType: "uint256" },
      { name: "participant", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "disputePresence",
    inputs: [
      { name: "epochId", type: "uint256", internalType: "uint256" },
      { name: "participant", type: "address", internalType: "address" },
      { name: "reason", type: "string", internalType: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "CheckedIn",
    inputs: [
      { name: "epochId", type: "uint256", indexed: true },
      { name: "participant", type: "address", indexed: true },
      { name: "checkInTime", type: "uint64", indexed: false },
    ],
  },
  {
    type: "event",
    name: "CheckedOut",
    inputs: [
      { name: "epochId", type: "uint256", indexed: true },
      { name: "participant", type: "address", indexed: true },
      { name: "checkOutTime", type: "uint64", indexed: false },
      { name: "duration", type: "uint64", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PresenceVerified",
    inputs: [
      { name: "epochId", type: "uint256", indexed: true },
      { name: "participant", type: "address", indexed: true },
      { name: "validator", type: "address", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PresenceDisputed",
    inputs: [
      { name: "epochId", type: "uint256", indexed: true },
      { name: "participant", type: "address", indexed: true },
      { name: "validator", type: "address", indexed: false },
      { name: "reason", type: "string", indexed: false },
    ],
  },
] as const;
