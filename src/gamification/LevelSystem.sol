// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {RoleManager} from "../access/RoleManager.sol";
import {AreaRegistry} from "../areas/AreaRegistry.sol";

contract LevelSystem {
    uint8 public constant MAX_LEVEL = 100;
    uint16 public constant BASIS_POINTS = 10_000;

    RoleManager public immutable ROLE_MANAGER;

    mapping(address => mapping(AreaRegistry.AreaType => uint256)) public areaXP;
    mapping(address => uint256) public totalXP;
    mapping(address => uint8) public level;

    event XPAdded(address indexed participant, AreaRegistry.AreaType indexed area, uint256 amount, uint256 newTotal);
    event LevelUp(address indexed participant, uint8 oldLevel, uint8 newLevel);

    error Unauthorized();
    error ZeroAmount();

    constructor(address _roleManager) {
        ROLE_MANAGER = RoleManager(_roleManager);
    }

    function addXP(address participant, AreaRegistry.AreaType area, uint256 amount) external {
        if (amount == 0) revert ZeroAmount();

        areaXP[participant][area] += amount;
        totalXP[participant] += amount;

        emit XPAdded(participant, area, amount, totalXP[participant]);

        uint8 newLevel = _calculateLevel(totalXP[participant]);
        if (newLevel > level[participant]) {
            uint8 oldLevel = level[participant];
            level[participant] = newLevel;
            emit LevelUp(participant, oldLevel, newLevel);
        }
    }

    function getLevel(address participant) external view returns (uint8) {
        return level[participant];
    }

    function getLevelMultiplier(address participant) external view returns (uint16) {
        uint8 lvl = level[participant];
        // Level 0 = 10000 (1.0x), each level adds 100bp (0.01x)
        // Level 10 = 11000 (1.1x), Level 50 = 15000 (1.5x), Level 100 = 20000 (2.0x)
        return uint16(BASIS_POINTS + (uint16(lvl) * 100));
    }

    function getAreaXP(address participant, AreaRegistry.AreaType area) external view returns (uint256) {
        return areaXP[participant][area];
    }

    function getTotalXP(address participant) external view returns (uint256) {
        return totalXP[participant];
    }

    function xpForLevel(uint8 lvl) public pure returns (uint256) {
        return 100 * uint256(lvl) * uint256(lvl);
    }

    function _calculateLevel(uint256 xp) internal pure returns (uint8) {
        uint8 lvl = 0;
        while (lvl < MAX_LEVEL && xp >= xpForLevel(lvl + 1)) {
            lvl++;
        }
        return lvl;
    }
}
