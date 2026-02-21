// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {RoleManager} from "../../src/access/RoleManager.sol";
import {AzistToken} from "../../src/token/AzistToken.sol";
import {AreaRegistry} from "../../src/areas/AreaRegistry.sol";
import {EpochManager} from "../../src/core/EpochManager.sol";
import {PresenceRegistry} from "../../src/core/PresenceRegistry.sol";
import {LevelSystem} from "../../src/gamification/LevelSystem.sol";
import {StreakTracker} from "../../src/gamification/StreakTracker.sol";
import {BadgeManager} from "../../src/gamification/BadgeManager.sol";
import {RewardDistributor} from "../../src/core/RewardDistributor.sol";

contract FullFlowTest is Test {
    RoleManager public roleManager;
    AzistToken public token;
    AreaRegistry public areaRegistry;
    EpochManager public epochManager;
    PresenceRegistry public presenceRegistry;
    LevelSystem public levelSystem;
    StreakTracker public streakTracker;
    BadgeManager public badgeManager;
    RewardDistributor public distributor;

    address public admin;
    address public creator;
    address public validator;
    address public alice;
    address public bob;

    function setUp() public {
        admin = makeAddr("admin");
        creator = makeAddr("creator");
        validator = makeAddr("validator");
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        vm.startPrank(admin);
        roleManager = new RoleManager(admin);
        token = new AzistToken(address(roleManager));
        areaRegistry = new AreaRegistry(address(roleManager));
        epochManager = new EpochManager(address(roleManager), address(areaRegistry));
        presenceRegistry = new PresenceRegistry(address(roleManager), address(epochManager), address(areaRegistry));
        epochManager.setPresenceRegistry(address(presenceRegistry));
        levelSystem = new LevelSystem(address(roleManager));
        streakTracker = new StreakTracker(address(roleManager));
        badgeManager = new BadgeManager(address(roleManager));
        distributor = new RewardDistributor(
            address(roleManager),
            address(token),
            address(epochManager),
            address(presenceRegistry),
            address(areaRegistry),
            address(levelSystem),
            address(streakTracker),
            address(badgeManager)
        );

        roleManager.grantEpochCreator(creator);
        roleManager.grantValidator(validator);
        roleManager.grantRewardMinter(address(distributor));
        vm.stopPrank();

        // Start at a known time
        vm.warp(1000 days);
    }

    function test_FullFlow_CreateEpochCheckInCheckOutReward() public {
        // 1. Creator creates an Environmental epoch
        uint64 start = uint64(block.timestamp);
        uint64 end = uint64(block.timestamp + 8 hours);
        vm.prank(creator);
        uint256 epochId = epochManager.createEpoch(
            "Beach Cleanup CDMX", "Playa del Carmen", AreaRegistry.AreaType.Environmental, start, end, 50
        );

        // 2. Activate the epoch
        vm.prank(creator);
        epochManager.activateEpoch(epochId);
        assertTrue(epochManager.isEpochActive(epochId));

        // 3. Alice checks in and stays 2 hours
        vm.prank(alice);
        presenceRegistry.checkIn(epochId);
        vm.warp(block.timestamp + 2 hours);

        // 4. Bob checks in and stays 4 hours
        vm.prank(bob);
        presenceRegistry.checkIn(epochId);
        vm.warp(block.timestamp + 2 hours); // 2 more hours pass

        // 5. Alice checks out (stayed 4 hours total: 2 hours before Bob + 2 hours with Bob)
        vm.prank(alice);
        presenceRegistry.checkOut(epochId);
        assertEq(presenceRegistry.getPresenceDuration(epochId, alice), 4 hours);

        // 6. More time passes, Bob checks out (stayed 4 hours)
        vm.warp(block.timestamp + 2 hours);
        vm.prank(bob);
        presenceRegistry.checkOut(epochId);
        assertEq(presenceRegistry.getPresenceDuration(epochId, bob), 4 hours);

        // 7. Validator verifies Alice's presence
        vm.prank(validator);
        presenceRegistry.verifyPresence(epochId, alice);
        assertTrue(presenceRegistry.getPresenceState(epochId, alice) == PresenceRegistry.PresenceState.Verified);

        // 8. Close and finalize the epoch
        vm.startPrank(creator);
        epochManager.closeEpoch(epochId);
        epochManager.finalizeEpoch(epochId);
        vm.stopPrank();

        // 9. Both are reward eligible
        assertTrue(presenceRegistry.isRewardEligible(epochId, alice));
        assertTrue(presenceRegistry.isRewardEligible(epochId, bob));

        // 10. Distribute rewards
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;
        vm.prank(admin);
        distributor.batchDistribute(epochId, participants);

        // 11. Verify rewards (both stayed 4 hours = 240 min)
        // 240 min * 1 ether * 1.5 (env) = 360 ether
        assertEq(token.balanceOf(alice), 360 ether);
        assertEq(token.balanceOf(bob), 360 ether);

        // 12. Verify XP was added (240 min * 15 xp/min = 3600 XP)
        assertEq(levelSystem.getTotalXP(alice), 3600);
        assertEq(levelSystem.getTotalXP(bob), 3600);

        // 13. Verify levels (3600 XP = level 5, since xpForLevel(6) = 3600, so level 6)
        assertEq(levelSystem.getLevel(alice), 6); // sqrt(3600/100) = 6
        assertEq(levelSystem.getLevel(bob), 6);

        // 14. Verify streaks
        assertEq(streakTracker.getCurrentStreak(alice), 1);
        assertEq(streakTracker.getCurrentStreak(bob), 1);

        // 15. Verify participant count
        assertEq(presenceRegistry.getEpochParticipantCount(epochId), 2);
    }

    function test_FullFlow_DisputedPresence_NoReward() public {
        uint64 start = uint64(block.timestamp);
        uint64 end = uint64(block.timestamp + 8 hours);
        vm.prank(creator);
        uint256 epochId = epochManager.createEpoch(
            "Community Service", "Centro CDMX", AreaRegistry.AreaType.Community, start, end, 50
        );
        vm.prank(creator);
        epochManager.activateEpoch(epochId);

        // Alice checks in and stays 1 hour
        vm.prank(alice);
        presenceRegistry.checkIn(epochId);
        vm.warp(block.timestamp + 1 hours);
        vm.prank(alice);
        presenceRegistry.checkOut(epochId);

        // Validator disputes Alice's presence
        vm.prank(validator);
        presenceRegistry.disputePresence(epochId, alice, "Not actually present");

        // Finalize
        vm.startPrank(creator);
        epochManager.closeEpoch(epochId);
        epochManager.finalizeEpoch(epochId);
        vm.stopPrank();

        // Alice should NOT be eligible
        assertFalse(presenceRegistry.isRewardEligible(epochId, alice));
        assertEq(distributor.calculateReward(epochId, alice), 0);
    }

    function test_FullFlow_MultipleAreasRewarded() public {
        // Create epochs in different areas
        uint64 start = uint64(block.timestamp);
        uint64 end = uint64(block.timestamp + 8 hours);

        vm.startPrank(creator);
        uint256 envEpoch =
            epochManager.createEpoch("Cleanup", "Beach", AreaRegistry.AreaType.Environmental, start, end, 50);
        uint256 eduEpoch =
            epochManager.createEpoch("Workshop", "School", AreaRegistry.AreaType.Education, start, end, 50);
        epochManager.activateEpoch(envEpoch);
        epochManager.activateEpoch(eduEpoch);
        vm.stopPrank();

        // Alice participates in Environmental (1 hour)
        vm.prank(alice);
        presenceRegistry.checkIn(envEpoch);
        vm.warp(block.timestamp + 1 hours);
        vm.prank(alice);
        presenceRegistry.checkOut(envEpoch);

        // Alice participates in Education (1 hour)
        vm.prank(alice);
        presenceRegistry.checkIn(eduEpoch);
        vm.warp(block.timestamp + 1 hours);
        vm.prank(alice);
        presenceRegistry.checkOut(eduEpoch);

        // Finalize both
        vm.startPrank(creator);
        epochManager.closeEpoch(envEpoch);
        epochManager.finalizeEpoch(envEpoch);
        epochManager.closeEpoch(eduEpoch);
        epochManager.finalizeEpoch(eduEpoch);
        vm.stopPrank();

        // Distribute rewards for both
        vm.startPrank(admin);
        distributor.distributeReward(envEpoch, alice);
        distributor.distributeReward(eduEpoch, alice);
        vm.stopPrank();

        // Environmental: 60 min * 1 ether * 1.5 = 90 ether
        // Education: 60 min * 1 ether * 1.2 = 72 ether
        // After env reward: level goes up from XP, so edu reward will have slightly higher level multiplier
        uint256 totalBalance = token.balanceOf(alice);
        assertTrue(totalBalance > 0);

        // XP: env = 60*15=900, edu = 60*10=600 => total = 1500
        assertEq(levelSystem.getTotalXP(alice), 1500);
        assertEq(levelSystem.getAreaXP(alice, AreaRegistry.AreaType.Environmental), 900);
        assertEq(levelSystem.getAreaXP(alice, AreaRegistry.AreaType.Education), 600);

        // Total check-ins = 2
        assertEq(presenceRegistry.totalCheckIns(alice), 2);
    }

    function test_FullFlow_ForceCheckOut_StillEligible() public {
        uint64 start = uint64(block.timestamp);
        uint64 end = uint64(block.timestamp + 8 hours);
        vm.prank(creator);
        uint256 epochId = epochManager.createEpoch("Health Day", "Gym", AreaRegistry.AreaType.Health, start, end, 50);
        vm.prank(creator);
        epochManager.activateEpoch(epochId);

        // Alice checks in but forgets to check out
        vm.prank(alice);
        presenceRegistry.checkIn(epochId);
        vm.warp(block.timestamp + 2 hours);

        // Validator force checks out Alice
        vm.prank(validator);
        presenceRegistry.forceCheckOut(epochId, alice);

        // Finalize
        vm.startPrank(creator);
        epochManager.closeEpoch(epochId);
        epochManager.finalizeEpoch(epochId);
        vm.stopPrank();

        // Alice should be eligible (2 hours > 15 min minimum for Health)
        assertTrue(presenceRegistry.isRewardEligible(epochId, alice));

        vm.prank(admin);
        distributor.distributeReward(epochId, alice);
        assertTrue(token.balanceOf(alice) > 0);
    }
}
