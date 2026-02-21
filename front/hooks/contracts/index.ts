/**
 * Contract Hooks - Azist Frontend
 *
 * Barrel export for all contract integration hooks.
 * Import from here for cleaner code organization.
 */

// Token hooks
export { useAzistBalance } from "./useAzistToken";

// Gamification hooks
export { useTotalXp, useLevel, useLevelMultiplier } from "./useLevelSystem";
export { useCurrentStreak, useStreakMultiplier } from "./useStreakTracker";
export { useBadgeCount } from "./useBadgeManager";

// Access control hooks
export { useIsAdmin, useIsEpochCreator, useIsValidator } from "./useRoleManager";

// Aggregated stats
export { useUserStats } from "./useUserStats";

// Presence/Attendance hooks
export {
  usePresence,
  useTotalCheckIns,
  useEpochParticipants,
  useIsRewardEligible,
  useCheckIn,
  useCheckOut,
  useVerifyPresence,
  useDisputePresence,
} from "./usePresenceRegistry";

// Epoch management hooks
export {
  useEpochCount,
  useEpoch,
  useCreateEpoch,
  useActivateEpoch,
  useCloseEpoch,
  useFinalizeEpoch,
} from "./useEpochManager";

// Batch epoch fetching
export { useEpochs } from "./useEpochs";

// Reward distribution hooks
export { useCalculateReward, useBatchDistribute } from "./useRewardDistributor";

// Activity logs
export { useActivityLogs } from "./useActivityLogs";
