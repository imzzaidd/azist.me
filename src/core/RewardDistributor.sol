// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {RoleManager} from "../access/RoleManager.sol";
import {AzistToken} from "../token/AzistToken.sol";
import {EpochManager} from "./EpochManager.sol";
import {PresenceRegistry} from "./PresenceRegistry.sol";
import {AreaRegistry} from "../areas/AreaRegistry.sol";
import {LevelSystem} from "../gamification/LevelSystem.sol";
import {StreakTracker} from "../gamification/StreakTracker.sol";
import {BadgeManager} from "../gamification/BadgeManager.sol";

contract RewardDistributor {
    uint16 public constant BASIS_POINTS = 10_000;
    uint256 public constant BASE_RATE_PER_MINUTE = 1 ether; // 1 AZIST per minute base

    RoleManager public immutable ROLE_MANAGER;
    AzistToken public immutable TOKEN;
    EpochManager public immutable EPOCH_MANAGER;
    PresenceRegistry public immutable PRESENCE_REGISTRY;
    AreaRegistry public immutable AREA_REGISTRY;
    LevelSystem public immutable LEVEL_SYSTEM;
    StreakTracker public immutable STREAK_TRACKER;
    BadgeManager public immutable BADGE_MANAGER;

    // epochId => participant => rewarded
    mapping(uint256 => mapping(address => bool)) public rewarded;

    event RewardDistributed(uint256 indexed epochId, address indexed participant, uint256 amount);
    event BadgeCheckCompleted(address indexed participant, uint256 badgesAwarded);

    error AlreadyRewarded();
    error NotEligible();
    error Unauthorized();
    error EpochNotFinalized();

    modifier onlyAdmin() {
        _checkAdmin();
        _;
    }

    constructor(
        address _roleManager,
        address _token,
        address _epochManager,
        address _presenceRegistry,
        address _areaRegistry,
        address _levelSystem,
        address _streakTracker,
        address _badgeManager
    ) {
        ROLE_MANAGER = RoleManager(_roleManager);
        TOKEN = AzistToken(_token);
        EPOCH_MANAGER = EpochManager(_epochManager);
        PRESENCE_REGISTRY = PresenceRegistry(_presenceRegistry);
        AREA_REGISTRY = AreaRegistry(_areaRegistry);
        LEVEL_SYSTEM = LevelSystem(_levelSystem);
        STREAK_TRACKER = StreakTracker(_streakTracker);
        BADGE_MANAGER = BadgeManager(_badgeManager);
    }

    function calculateReward(uint256 epochId, address participant) public view returns (uint256) {
        if (!PRESENCE_REGISTRY.isRewardEligible(epochId, participant)) return 0;

        uint64 duration = PRESENCE_REGISTRY.getPresenceDuration(epochId, participant);
        AreaRegistry.AreaType area = EPOCH_MANAGER.getEpochArea(epochId);

        uint256 durationMinutes = uint256(duration) / 60;
        uint256 baseDurationReward = durationMinutes * BASE_RATE_PER_MINUTE;

        uint16 areaMultiplier = AREA_REGISTRY.getRewardMultiplier(area);
        uint16 levelMultiplier = LEVEL_SYSTEM.getLevelMultiplier(participant);
        uint16 streakMultiplier = STREAK_TRACKER.getStreakMultiplier(participant);

        // reward = base * areaMultiplier * levelMultiplier * streakMultiplier / (BP^3)
        uint256 reward = baseDurationReward;
        reward = (reward * uint256(areaMultiplier)) / BASIS_POINTS;
        reward = (reward * uint256(levelMultiplier)) / BASIS_POINTS;
        reward = (reward * uint256(streakMultiplier)) / BASIS_POINTS;

        return reward;
    }

    function distributeReward(uint256 epochId, address participant) public onlyAdmin {
        EpochManager.EpochState state = EPOCH_MANAGER.getEpochState(epochId);
        if (state != EpochManager.EpochState.Finalized) revert EpochNotFinalized();
        if (rewarded[epochId][participant]) revert AlreadyRewarded();
        if (!PRESENCE_REGISTRY.isRewardEligible(epochId, participant)) revert NotEligible();

        rewarded[epochId][participant] = true;

        // Calculate reward BEFORE state updates so current multipliers apply
        uint256 reward = calculateReward(epochId, participant);

        // Update gamification state
        _addXP(epochId, participant);
        STREAK_TRACKER.recordParticipation(participant);

        // Mint reward
        if (reward > 0) {
            TOKEN.mint(participant, reward);
        }

        // Check and award badges
        uint256 badgesAwarded = _checkBadges(participant, epochId);

        emit RewardDistributed(epochId, participant, reward);
        if (badgesAwarded > 0) {
            emit BadgeCheckCompleted(participant, badgesAwarded);
        }
    }

    function batchDistribute(uint256 epochId, address[] calldata participants) external onlyAdmin {
        for (uint256 i = 0; i < participants.length; i++) {
            if (
                !rewarded[epochId][participants[i]]
                    && PRESENCE_REGISTRY.isRewardEligible(epochId, participants[i])
            ) {
                distributeReward(epochId, participants[i]);
            }
        }
    }

    function _addXP(uint256 epochId, address participant) internal {
        uint64 duration = PRESENCE_REGISTRY.getPresenceDuration(epochId, participant);
        AreaRegistry.AreaType area = EPOCH_MANAGER.getEpochArea(epochId);
        uint256 xpPerMinute = AREA_REGISTRY.getXpPerMinute(area);

        uint256 durationMinutes = uint256(duration) / 60;
        uint256 xpEarned = durationMinutes * xpPerMinute;

        if (xpEarned > 0) {
            LEVEL_SYSTEM.addXP(participant, area, xpEarned);
        }
    }

    function _checkBadges(address participant, uint256 epochId) internal returns (uint256 badgesAwarded) {
        // Streak badges
        uint32 streak = STREAK_TRACKER.getCurrentStreak(participant);
        if (streak >= 7 && !BADGE_MANAGER.hasBadge(participant, BADGE_MANAGER.BADGE_WEEK_WARRIOR())) {
            BADGE_MANAGER.awardBadge(participant, BADGE_MANAGER.BADGE_WEEK_WARRIOR());
            badgesAwarded++;
        }
        if (streak >= 30 && !BADGE_MANAGER.hasBadge(participant, BADGE_MANAGER.BADGE_MONTH_MASTER())) {
            BADGE_MANAGER.awardBadge(participant, BADGE_MANAGER.BADGE_MONTH_MASTER());
            badgesAwarded++;
        }

        // Level badges
        uint8 lvl = LEVEL_SYSTEM.getLevel(participant);
        if (lvl >= 5 && !BADGE_MANAGER.hasBadge(participant, BADGE_MANAGER.BADGE_RISING_STAR())) {
            BADGE_MANAGER.awardBadge(participant, BADGE_MANAGER.BADGE_RISING_STAR());
            badgesAwarded++;
        }
        if (lvl >= 20 && !BADGE_MANAGER.hasBadge(participant, BADGE_MANAGER.BADGE_VETERAN())) {
            BADGE_MANAGER.awardBadge(participant, BADGE_MANAGER.BADGE_VETERAN());
            badgesAwarded++;
        }
        if (lvl >= 50 && !BADGE_MANAGER.hasBadge(participant, BADGE_MANAGER.BADGE_LEGEND())) {
            BADGE_MANAGER.awardBadge(participant, BADGE_MANAGER.BADGE_LEGEND());
            badgesAwarded++;
        }

        // Dedication badge (100 total check-ins)
        uint256 checkIns = PRESENCE_REGISTRY.totalCheckIns(participant);
        if (checkIns >= 100 && !BADGE_MANAGER.hasBadge(participant, BADGE_MANAGER.BADGE_DEDICATED())) {
            BADGE_MANAGER.awardBadge(participant, BADGE_MANAGER.BADGE_DEDICATED());
            badgesAwarded++;
        }

        // Area duration badges (50 hours = 180000 seconds)
        uint256 fiftyHours = 180_000;
        AreaRegistry.AreaType area = EPOCH_MANAGER.getEpochArea(epochId);

        if (
            area == AreaRegistry.AreaType.Environmental
                && PRESENCE_REGISTRY.areaDuration(participant, AreaRegistry.AreaType.Environmental) >= fiftyHours
                && !BADGE_MANAGER.hasBadge(participant, BADGE_MANAGER.BADGE_ENVIRONMENTAL_GUARDIAN())
        ) {
            BADGE_MANAGER.awardBadge(participant, BADGE_MANAGER.BADGE_ENVIRONMENTAL_GUARDIAN());
            badgesAwarded++;
        }
        if (
            area == AreaRegistry.AreaType.Community
                && PRESENCE_REGISTRY.areaDuration(participant, AreaRegistry.AreaType.Community) >= fiftyHours
                && !BADGE_MANAGER.hasBadge(participant, BADGE_MANAGER.BADGE_COMMUNITY_HERO())
        ) {
            BADGE_MANAGER.awardBadge(participant, BADGE_MANAGER.BADGE_COMMUNITY_HERO());
            badgesAwarded++;
        }
        if (
            area == AreaRegistry.AreaType.Education
                && PRESENCE_REGISTRY.areaDuration(participant, AreaRegistry.AreaType.Education) >= fiftyHours
                && !BADGE_MANAGER.hasBadge(participant, BADGE_MANAGER.BADGE_SCHOLAR())
        ) {
            BADGE_MANAGER.awardBadge(participant, BADGE_MANAGER.BADGE_SCHOLAR());
            badgesAwarded++;
        }
        if (
            area == AreaRegistry.AreaType.Health
                && PRESENCE_REGISTRY.areaDuration(participant, AreaRegistry.AreaType.Health) >= fiftyHours
                && !BADGE_MANAGER.hasBadge(participant, BADGE_MANAGER.BADGE_WELLNESS_CHAMPION())
        ) {
            BADGE_MANAGER.awardBadge(participant, BADGE_MANAGER.BADGE_WELLNESS_CHAMPION());
            badgesAwarded++;
        }
        if (
            area == AreaRegistry.AreaType.Cultural
                && PRESENCE_REGISTRY.areaDuration(participant, AreaRegistry.AreaType.Cultural) >= fiftyHours
                && !BADGE_MANAGER.hasBadge(participant, BADGE_MANAGER.BADGE_CULTURE_KEEPER())
        ) {
            BADGE_MANAGER.awardBadge(participant, BADGE_MANAGER.BADGE_CULTURE_KEEPER());
            badgesAwarded++;
        }
    }

    function _checkAdmin() internal view {
        if (!ROLE_MANAGER.hasRole(ROLE_MANAGER.DEFAULT_ADMIN_ROLE(), msg.sender)) {
            revert Unauthorized();
        }
    }
}
