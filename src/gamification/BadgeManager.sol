// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {RoleManager} from "../access/RoleManager.sol";

contract BadgeManager is ERC1155 {
    // Badge IDs
    uint256 public constant BADGE_WEEK_WARRIOR = 1; // 7-day streak
    uint256 public constant BADGE_MONTH_MASTER = 2; // 30-day streak
    uint256 public constant BADGE_RISING_STAR = 3; // Level 5
    uint256 public constant BADGE_VETERAN = 4; // Level 20
    uint256 public constant BADGE_LEGEND = 5; // Level 50
    uint256 public constant BADGE_DEDICATED = 6; // 100 total check-ins
    uint256 public constant BADGE_ENVIRONMENTAL_GUARDIAN = 7; // 50 hours environmental
    uint256 public constant BADGE_COMMUNITY_HERO = 8; // 50 hours community
    uint256 public constant BADGE_SCHOLAR = 9; // 50 hours education
    uint256 public constant BADGE_WELLNESS_CHAMPION = 10; // 50 hours health
    uint256 public constant BADGE_CULTURE_KEEPER = 11; // 50 hours cultural
    uint256 public constant BADGE_RENAISSANCE = 12; // All 5 areas participated

    uint256 public constant TOTAL_BADGES = 12;

    RoleManager public immutable ROLE_MANAGER;

    // Track which badges have been awarded
    mapping(address => mapping(uint256 => bool)) public hasBadge;
    mapping(address => uint256) public badgeCount;

    // Badge metadata
    mapping(uint256 => string) public badgeNames;

    event BadgeAwarded(address indexed participant, uint256 indexed badgeId, string badgeName);

    error Unauthorized();
    error SoulboundTransfer();
    error BadgeAlreadyAwarded();
    error InvalidBadgeId();

    constructor(
        address _roleManager
    ) ERC1155("") {
        ROLE_MANAGER = RoleManager(_roleManager);
        _initBadgeNames();
    }

    function awardBadge(
        address participant,
        uint256 badgeId
    ) external {
        if (!ROLE_MANAGER.hasRole(ROLE_MANAGER.REWARD_MINTER_ROLE(), msg.sender)) revert Unauthorized();
        if (badgeId == 0 || badgeId > TOTAL_BADGES) revert InvalidBadgeId();
        if (hasBadge[participant][badgeId]) revert BadgeAlreadyAwarded();

        hasBadge[participant][badgeId] = true;
        badgeCount[participant]++;
        _mint(participant, badgeId, 1, "");

        emit BadgeAwarded(participant, badgeId, badgeNames[badgeId]);
    }

    function getBadgeCount(
        address participant
    ) external view returns (uint256) {
        return badgeCount[participant];
    }

    function getBadgeName(
        uint256 badgeId
    ) external view returns (string memory) {
        return badgeNames[badgeId];
    }

    // Soulbound: prevent transfers
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override {
        if (from != address(0) && to != address(0)) {
            revert SoulboundTransfer();
        }
        super._update(from, to, ids, values);
    }

    function _initBadgeNames() internal {
        badgeNames[BADGE_WEEK_WARRIOR] = "Week Warrior";
        badgeNames[BADGE_MONTH_MASTER] = "Month Master";
        badgeNames[BADGE_RISING_STAR] = "Rising Star";
        badgeNames[BADGE_VETERAN] = "Veteran";
        badgeNames[BADGE_LEGEND] = "Legend";
        badgeNames[BADGE_DEDICATED] = "Dedicated";
        badgeNames[BADGE_ENVIRONMENTAL_GUARDIAN] = "Environmental Guardian";
        badgeNames[BADGE_COMMUNITY_HERO] = "Community Hero";
        badgeNames[BADGE_SCHOLAR] = "Scholar";
        badgeNames[BADGE_WELLNESS_CHAMPION] = "Wellness Champion";
        badgeNames[BADGE_CULTURE_KEEPER] = "Culture Keeper";
        badgeNames[BADGE_RENAISSANCE] = "Renaissance";
    }
}
