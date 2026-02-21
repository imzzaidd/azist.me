// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {RoleManager} from "../access/RoleManager.sol";

contract AreaRegistry {
    enum AreaType {
        Environmental,
        Community,
        Education,
        Health,
        Cultural
    }

    struct AreaConfig {
        uint16 rewardMultiplier; // basis points (10000 = 1x, 15000 = 1.5x)
        uint64 minStaySeconds;
        uint64 maxRewardDuration;
        uint256 xpPerMinute;
        bool active;
    }

    uint16 public constant BASIS_POINTS = 10_000;
    uint8 public constant AREA_COUNT = 5;

    RoleManager public immutable ROLE_MANAGER;

    mapping(AreaType => AreaConfig) public areaConfigs;

    event AreaConfigUpdated(AreaType indexed area, uint16 rewardMultiplier, uint64 minStay, uint64 maxDuration);
    event AreaToggled(AreaType indexed area, bool active);

    error Unauthorized();
    error InvalidMultiplier();
    error InvalidDuration();

    modifier onlyAdmin() {
        _checkAdmin();
        _;
    }

    constructor(address _roleManager) {
        ROLE_MANAGER = RoleManager(_roleManager);
        _initializeDefaults();
    }

    function updateAreaConfig(
        AreaType area,
        uint16 rewardMultiplier,
        uint64 minStaySeconds,
        uint64 maxRewardDuration,
        uint256 xpPerMinute
    ) external onlyAdmin {
        if (rewardMultiplier == 0) revert InvalidMultiplier();
        if (maxRewardDuration <= minStaySeconds) revert InvalidDuration();

        areaConfigs[area] = AreaConfig({
            rewardMultiplier: rewardMultiplier,
            minStaySeconds: minStaySeconds,
            maxRewardDuration: maxRewardDuration,
            xpPerMinute: xpPerMinute,
            active: areaConfigs[area].active
        });

        emit AreaConfigUpdated(area, rewardMultiplier, minStaySeconds, maxRewardDuration);
    }

    function toggleArea(AreaType area, bool active) external onlyAdmin {
        areaConfigs[area].active = active;
        emit AreaToggled(area, active);
    }

    function getAreaConfig(AreaType area) external view returns (AreaConfig memory) {
        return areaConfigs[area];
    }

    function isAreaActive(AreaType area) external view returns (bool) {
        return areaConfigs[area].active;
    }

    function getRewardMultiplier(AreaType area) external view returns (uint16) {
        return areaConfigs[area].rewardMultiplier;
    }

    function getMinStay(AreaType area) external view returns (uint64) {
        return areaConfigs[area].minStaySeconds;
    }

    function getMaxDuration(AreaType area) external view returns (uint64) {
        return areaConfigs[area].maxRewardDuration;
    }

    function getXpPerMinute(AreaType area) external view returns (uint256) {
        return areaConfigs[area].xpPerMinute;
    }

    function _initializeDefaults() internal {
        // Environmental: cleanups, tree planting, conservation
        areaConfigs[AreaType.Environmental] = AreaConfig({
            rewardMultiplier: 15_000, // 1.5x
            minStaySeconds: 1800, // 30 min
            maxRewardDuration: 21_600, // 6 hours
            xpPerMinute: 15,
            active: true
        });

        // Community: volunteering, food banks, shelters
        areaConfigs[AreaType.Community] = AreaConfig({
            rewardMultiplier: 13_000, // 1.3x
            minStaySeconds: 1200, // 20 min
            maxRewardDuration: 28_800, // 8 hours
            xpPerMinute: 12,
            active: true
        });

        // Education: workshops, tutoring, mentoring
        areaConfigs[AreaType.Education] = AreaConfig({
            rewardMultiplier: 12_000, // 1.2x
            minStaySeconds: 2700, // 45 min
            maxRewardDuration: 14_400, // 4 hours
            xpPerMinute: 10,
            active: true
        });

        // Health: wellness activities, sports, health drives
        areaConfigs[AreaType.Health] = AreaConfig({
            rewardMultiplier: 11_000, // 1.1x
            minStaySeconds: 900, // 15 min
            maxRewardDuration: 10_800, // 3 hours
            xpPerMinute: 8,
            active: true
        });

        // Cultural: heritage preservation, art, cultural events
        areaConfigs[AreaType.Cultural] = AreaConfig({
            rewardMultiplier: 14_000, // 1.4x
            minStaySeconds: 1800, // 30 min
            maxRewardDuration: 18_000, // 5 hours
            xpPerMinute: 13,
            active: true
        });
    }

    function _checkAdmin() internal view {
        if (!ROLE_MANAGER.hasRole(ROLE_MANAGER.DEFAULT_ADMIN_ROLE(), msg.sender)) {
            revert Unauthorized();
        }
    }
}
