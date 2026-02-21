// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {StreakTracker} from "../../src/gamification/StreakTracker.sol";

contract StreakTrackerTest is Test {
    StreakTracker public streakTracker;
    address public user;

    function setUp() public {
        streakTracker = new StreakTracker();
        user = makeAddr("user");
        // Start at a known timestamp (day 1000)
        vm.warp(1000 days);
    }

    // --- Positive Tests: Basic Participation ---

    function test_RecordParticipation_SetsStreak1() public {
        streakTracker.recordParticipation(user);
        assertEq(streakTracker.getCurrentStreak(user), 1);
    }

    function test_RecordParticipation_SameDay_NoChange() public {
        streakTracker.recordParticipation(user);
        streakTracker.recordParticipation(user);
        assertEq(streakTracker.getCurrentStreak(user), 1);
    }

    function test_RecordParticipation_ConsecutiveDay_IncrementsStreak() public {
        streakTracker.recordParticipation(user);
        vm.warp(block.timestamp + 1 days);
        streakTracker.recordParticipation(user);
        assertEq(streakTracker.getCurrentStreak(user), 2);
    }

    function test_RecordParticipation_7DayStreak() public {
        for (uint256 i = 0; i < 7; i++) {
            streakTracker.recordParticipation(user);
            if (i < 6) vm.warp(block.timestamp + 1 days);
        }
        assertEq(streakTracker.getCurrentStreak(user), 7);
    }

    function test_RecordParticipation_Gap_ResetsStreak() public {
        streakTracker.recordParticipation(user);
        vm.warp(block.timestamp + 1 days);
        streakTracker.recordParticipation(user);
        // Skip a day
        vm.warp(block.timestamp + 2 days);
        streakTracker.recordParticipation(user);
        assertEq(streakTracker.getCurrentStreak(user), 1);
    }

    function test_LongestStreak_UpdatesCorrectly() public {
        // Build 5-day streak
        for (uint256 i = 0; i < 5; i++) {
            streakTracker.recordParticipation(user);
            if (i < 4) vm.warp(block.timestamp + 1 days);
        }
        assertEq(streakTracker.getLongestStreak(user), 5);

        // Break and start new streak (only 2 days)
        vm.warp(block.timestamp + 3 days);
        streakTracker.recordParticipation(user);
        vm.warp(block.timestamp + 1 days);
        streakTracker.recordParticipation(user);

        // Longest should still be 5
        assertEq(streakTracker.getLongestStreak(user), 5);
        assertEq(streakTracker.getCurrentStreak(user), 2);
    }

    // --- Positive Tests: Multipliers ---

    function test_StreakMultiplier_NoStreak_Returns10000() public view {
        assertEq(streakTracker.getStreakMultiplier(user), 10_000);
    }

    function test_StreakMultiplier_1Day_Returns10000() public {
        streakTracker.recordParticipation(user);
        assertEq(streakTracker.getStreakMultiplier(user), 10_000);
    }

    function test_StreakMultiplier_3Day_Returns11000() public {
        for (uint256 i = 0; i < 3; i++) {
            streakTracker.recordParticipation(user);
            if (i < 2) vm.warp(block.timestamp + 1 days);
        }
        assertEq(streakTracker.getStreakMultiplier(user), 11_000);
    }

    function test_StreakMultiplier_7Day_Returns12500() public {
        for (uint256 i = 0; i < 7; i++) {
            streakTracker.recordParticipation(user);
            if (i < 6) vm.warp(block.timestamp + 1 days);
        }
        assertEq(streakTracker.getStreakMultiplier(user), 12_500);
    }

    function test_StreakMultiplier_14Day_Returns13500() public {
        for (uint256 i = 0; i < 14; i++) {
            streakTracker.recordParticipation(user);
            if (i < 13) vm.warp(block.timestamp + 1 days);
        }
        assertEq(streakTracker.getStreakMultiplier(user), 13_500);
    }

    function test_StreakMultiplier_30Day_Returns15000() public {
        for (uint256 i = 0; i < 30; i++) {
            streakTracker.recordParticipation(user);
            if (i < 29) vm.warp(block.timestamp + 1 days);
        }
        assertEq(streakTracker.getStreakMultiplier(user), 15_000);
    }

    // --- Events ---

    function test_RecordParticipation_EmitsStreakUpdated() public {
        vm.expectEmit(true, false, false, true);
        emit StreakTracker.StreakUpdated(user, 1);
        streakTracker.recordParticipation(user);
    }

    function test_RecordParticipation_EmitsNewLongestStreak() public {
        vm.expectEmit(true, false, false, true);
        emit StreakTracker.NewLongestStreak(user, 1);
        streakTracker.recordParticipation(user);
    }

    // --- Boundary Tests ---

    function test_StreakMultiplier_2Day_Returns10000() public {
        streakTracker.recordParticipation(user);
        vm.warp(block.timestamp + 1 days);
        streakTracker.recordParticipation(user);
        assertEq(streakTracker.getStreakMultiplier(user), 10_000); // below 3-day threshold
    }

    function test_StreakMultiplier_6Day_Returns11000() public {
        for (uint256 i = 0; i < 6; i++) {
            streakTracker.recordParticipation(user);
            if (i < 5) vm.warp(block.timestamp + 1 days);
        }
        assertEq(streakTracker.getStreakMultiplier(user), 11_000); // 3+ but below 7
    }
}
