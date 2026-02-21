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

contract RewardDistributorTest is Test {
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
    address public user1;
    address public user2;
    address public attacker;

    uint256 public epochId;

    function setUp() public {
        admin = makeAddr("admin");
        creator = makeAddr("creator");
        validator = makeAddr("validator");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        attacker = makeAddr("attacker");

        vm.warp(1000 days);

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

        // Create, activate epoch (Environmental area)
        uint64 start = uint64(block.timestamp + 1 hours);
        uint64 end = uint64(block.timestamp + 10 hours);
        vm.prank(creator);
        epochId = epochManager.createEpoch(
            "Beach Cleanup", "Playa del Carmen", AreaRegistry.AreaType.Environmental, start, end, 100
        );
        vm.prank(creator);
        epochManager.activateEpoch(epochId);
    }

    function _checkInAndOut(
        address user,
        uint256 _epochId,
        uint256 stayDuration
    ) internal {
        vm.prank(user);
        presenceRegistry.checkIn(_epochId);
        vm.warp(block.timestamp + stayDuration);
        vm.prank(user);
        presenceRegistry.checkOut(_epochId);
    }

    function _finalizeEpoch(
        uint256 _epochId
    ) internal {
        vm.startPrank(creator);
        epochManager.closeEpoch(_epochId);
        epochManager.finalizeEpoch(_epochId);
        vm.stopPrank();
    }

    // --- Positive Tests: Reward Calculation ---

    function test_CalculateReward_BasicReward() public {
        _checkInAndOut(user1, epochId, 1 hours);
        _finalizeEpoch(epochId);

        uint256 reward = distributor.calculateReward(epochId, user1);
        // 60 min * 1 ether * 15000/10000 (env) * 10000/10000 (lvl0) * 10000/10000 (no streak)
        // = 60 * 1e18 * 1.5 = 90 ether
        assertEq(reward, 90 ether);
    }

    function test_CalculateReward_LongerStayHigherReward() public {
        _checkInAndOut(user1, epochId, 2 hours);
        _finalizeEpoch(epochId);

        uint256 reward = distributor.calculateReward(epochId, user1);
        // 120 min * 1 ether * 1.5 = 180 ether
        assertEq(reward, 180 ether);
    }

    function test_CalculateReward_ZeroWhenNotEligible() public {
        // Stay below min (30 min for environmental)
        _checkInAndOut(user1, epochId, 10 minutes);
        _finalizeEpoch(epochId);

        assertEq(distributor.calculateReward(epochId, user1), 0);
    }

    // --- Positive Tests: Distribution ---

    function test_DistributeReward_MintsTokens() public {
        _checkInAndOut(user1, epochId, 1 hours);
        _finalizeEpoch(epochId);

        vm.prank(admin);
        distributor.distributeReward(epochId, user1);

        assertEq(token.balanceOf(user1), 90 ether);
    }

    function test_DistributeReward_SetsRewardedFlag() public {
        _checkInAndOut(user1, epochId, 1 hours);
        _finalizeEpoch(epochId);

        vm.prank(admin);
        distributor.distributeReward(epochId, user1);

        assertTrue(distributor.rewarded(epochId, user1));
    }

    function test_DistributeReward_AddsXP() public {
        _checkInAndOut(user1, epochId, 1 hours);
        _finalizeEpoch(epochId);

        vm.prank(admin);
        distributor.distributeReward(epochId, user1);

        // 60 min * 15 xp/min (environmental) = 900 XP
        assertEq(levelSystem.getTotalXP(user1), 900);
        assertEq(levelSystem.getAreaXP(user1, AreaRegistry.AreaType.Environmental), 900);
    }

    function test_DistributeReward_RecordsStreak() public {
        _checkInAndOut(user1, epochId, 1 hours);
        _finalizeEpoch(epochId);

        vm.prank(admin);
        distributor.distributeReward(epochId, user1);

        assertEq(streakTracker.getCurrentStreak(user1), 1);
    }

    function test_DistributeReward_EmitsEvent() public {
        _checkInAndOut(user1, epochId, 1 hours);
        _finalizeEpoch(epochId);

        vm.expectEmit(true, true, false, true);
        emit RewardDistributor.RewardDistributed(epochId, user1, 90 ether);

        vm.prank(admin);
        distributor.distributeReward(epochId, user1);
    }

    // --- Positive Tests: Batch ---

    function test_BatchDistribute_MultipleUsers() public {
        _checkInAndOut(user1, epochId, 1 hours);
        _checkInAndOut(user2, epochId, 2 hours);
        _finalizeEpoch(epochId);

        address[] memory participants = new address[](2);
        participants[0] = user1;
        participants[1] = user2;

        vm.prank(admin);
        distributor.batchDistribute(epochId, participants);

        assertEq(token.balanceOf(user1), 90 ether);
        assertEq(token.balanceOf(user2), 180 ether);
    }

    function test_BatchDistribute_SkipsAlreadyRewarded() public {
        _checkInAndOut(user1, epochId, 1 hours);
        _finalizeEpoch(epochId);

        vm.prank(admin);
        distributor.distributeReward(epochId, user1);

        address[] memory participants = new address[](1);
        participants[0] = user1;

        vm.prank(admin);
        distributor.batchDistribute(epochId, participants); // Should not revert
        assertEq(token.balanceOf(user1), 90 ether); // Same amount, not doubled
    }

    // --- Reverse Tests ---

    function test_DistributeReward_RevertsWhen_NotFinalized() public {
        _checkInAndOut(user1, epochId, 1 hours);
        // Don't finalize
        vm.prank(admin);
        vm.expectRevert(RewardDistributor.EpochNotFinalized.selector);
        distributor.distributeReward(epochId, user1);
    }

    function test_DistributeReward_RevertsWhen_AlreadyRewarded() public {
        _checkInAndOut(user1, epochId, 1 hours);
        _finalizeEpoch(epochId);

        vm.startPrank(admin);
        distributor.distributeReward(epochId, user1);
        vm.expectRevert(RewardDistributor.AlreadyRewarded.selector);
        distributor.distributeReward(epochId, user1);
        vm.stopPrank();
    }

    function test_DistributeReward_RevertsWhen_NotEligible() public {
        // User never checked in
        _finalizeEpoch(epochId);

        vm.prank(admin);
        vm.expectRevert(RewardDistributor.NotEligible.selector);
        distributor.distributeReward(epochId, user1);
    }

    function test_DistributeReward_RevertsWhen_CallerNotAdmin() public {
        _checkInAndOut(user1, epochId, 1 hours);
        _finalizeEpoch(epochId);

        vm.prank(attacker);
        vm.expectRevert(RewardDistributor.Unauthorized.selector);
        distributor.distributeReward(epochId, user1);
    }

    // --- Duration Affects Rewards ---

    function test_DifferentDurations_DifferentRewards() public {
        _checkInAndOut(user1, epochId, 1 hours);
        _checkInAndOut(user2, epochId, 3 hours);
        _finalizeEpoch(epochId);

        uint256 reward1 = distributor.calculateReward(epochId, user1);
        uint256 reward2 = distributor.calculateReward(epochId, user2);

        assertTrue(reward2 > reward1);
        assertEq(reward2, reward1 * 3); // Linear scaling
    }
}
