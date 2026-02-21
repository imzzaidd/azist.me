// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {RoleManager} from "../../src/access/RoleManager.sol";
import {BadgeManager} from "../../src/gamification/BadgeManager.sol";

contract BadgeManagerTest is Test {
    RoleManager public roleManager;
    BadgeManager public badgeManager;
    address public admin;
    address public caller;
    address public user;
    address public recipient;

    function setUp() public {
        admin = makeAddr("admin");
        caller = makeAddr("caller");
        user = makeAddr("user");
        recipient = makeAddr("recipient");

        vm.prank(admin);
        roleManager = new RoleManager(admin);
        badgeManager = new BadgeManager(address(roleManager));
    }

    // --- Positive Tests: Award ---

    function test_AwardBadge_MintsBadge() public {
        badgeManager.awardBadge(user, badgeManager.BADGE_WEEK_WARRIOR());
        assertEq(badgeManager.balanceOf(user, badgeManager.BADGE_WEEK_WARRIOR()), 1);
    }

    function test_AwardBadge_SetsHasBadge() public {
        badgeManager.awardBadge(user, badgeManager.BADGE_RISING_STAR());
        assertTrue(badgeManager.hasBadge(user, badgeManager.BADGE_RISING_STAR()));
    }

    function test_AwardBadge_IncrementsBadgeCount() public {
        badgeManager.awardBadge(user, badgeManager.BADGE_WEEK_WARRIOR());
        badgeManager.awardBadge(user, badgeManager.BADGE_RISING_STAR());
        assertEq(badgeManager.getBadgeCount(user), 2);
    }

    function test_AwardBadge_EmitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit BadgeManager.BadgeAwarded(user, badgeManager.BADGE_DEDICATED(), "Dedicated");
        badgeManager.awardBadge(user, badgeManager.BADGE_DEDICATED());
    }

    function test_AwardAllBadges() public {
        for (uint256 i = 1; i <= badgeManager.TOTAL_BADGES(); i++) {
            badgeManager.awardBadge(user, i);
        }
        assertEq(badgeManager.getBadgeCount(user), 12);
    }

    // --- Positive Tests: Badge Names ---

    function test_BadgeName_WeekWarrior() public view {
        assertEq(badgeManager.getBadgeName(badgeManager.BADGE_WEEK_WARRIOR()), "Week Warrior");
    }

    function test_BadgeName_Renaissance() public view {
        assertEq(badgeManager.getBadgeName(badgeManager.BADGE_RENAISSANCE()), "Renaissance");
    }

    // --- Soulbound Tests ---

    function test_Transfer_RevertsWhen_SoulboundTransfer() public {
        uint256 badgeId = badgeManager.BADGE_WEEK_WARRIOR();
        badgeManager.awardBadge(user, badgeId);

        vm.prank(user);
        vm.expectRevert(BadgeManager.SoulboundTransfer.selector);
        badgeManager.safeTransferFrom(user, recipient, badgeId, 1, "");
    }

    function test_BatchTransfer_RevertsWhen_SoulboundTransfer() public {
        badgeManager.awardBadge(user, badgeManager.BADGE_WEEK_WARRIOR());

        uint256[] memory ids = new uint256[](1);
        ids[0] = badgeManager.BADGE_WEEK_WARRIOR();
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1;

        vm.prank(user);
        vm.expectRevert(BadgeManager.SoulboundTransfer.selector);
        badgeManager.safeBatchTransferFrom(user, recipient, ids, amounts, "");
    }

    // --- Reverse Tests ---

    function test_AwardBadge_RevertsWhen_InvalidBadgeId_Zero() public {
        vm.expectRevert(BadgeManager.InvalidBadgeId.selector);
        badgeManager.awardBadge(user, 0);
    }

    function test_AwardBadge_RevertsWhen_InvalidBadgeId_TooHigh() public {
        vm.expectRevert(BadgeManager.InvalidBadgeId.selector);
        badgeManager.awardBadge(user, 13);
    }

    function test_AwardBadge_RevertsWhen_AlreadyAwarded() public {
        uint256 badgeId = badgeManager.BADGE_WEEK_WARRIOR();
        badgeManager.awardBadge(user, badgeId);
        vm.expectRevert(BadgeManager.BadgeAlreadyAwarded.selector);
        badgeManager.awardBadge(user, badgeId);
    }

    // --- Badge Constants ---

    function test_TotalBadges_Is12() public view {
        assertEq(badgeManager.TOTAL_BADGES(), 12);
    }
}
