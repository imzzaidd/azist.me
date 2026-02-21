// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {RoleManager} from "../../src/access/RoleManager.sol";
import {AreaRegistry} from "../../src/areas/AreaRegistry.sol";
import {EpochManager} from "../../src/core/EpochManager.sol";
import {PresenceRegistry} from "../../src/core/PresenceRegistry.sol";

contract PresenceRegistryTest is Test {
    RoleManager public roleManager;
    AreaRegistry public areaRegistry;
    EpochManager public epochManager;
    PresenceRegistry public presenceRegistry;

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

        vm.startPrank(admin);
        roleManager = new RoleManager(admin);
        areaRegistry = new AreaRegistry(address(roleManager));
        epochManager = new EpochManager(address(roleManager), address(areaRegistry));
        presenceRegistry =
            new PresenceRegistry(address(roleManager), address(epochManager), address(areaRegistry));
        epochManager.setPresenceRegistry(address(presenceRegistry));
        roleManager.grantEpochCreator(creator);
        roleManager.grantValidator(validator);
        vm.stopPrank();

        // Create and activate an epoch
        uint64 start = uint64(block.timestamp + 1 hours);
        uint64 end = uint64(block.timestamp + 10 hours);
        vm.prank(creator);
        epochId = epochManager.createEpoch("Beach Cleanup", "Playa", AreaRegistry.AreaType.Environmental, start, end, 100);
        vm.prank(creator);
        epochManager.activateEpoch(epochId);
    }

    // --- Positive Tests: Check-in ---

    function test_CheckIn_RecordsPresence() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);

        PresenceRegistry.PresenceRecord memory record = presenceRegistry.getPresence(epochId, user1);
        assertEq(record.epochId, epochId);
        assertEq(record.participant, user1);
        assertEq(record.checkInTime, uint64(block.timestamp));
        assertTrue(record.state == PresenceRegistry.PresenceState.Active);
    }

    function test_CheckIn_EmitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit PresenceRegistry.CheckedIn(epochId, user1, uint64(block.timestamp));

        vm.prank(user1);
        presenceRegistry.checkIn(epochId);
    }

    function test_CheckIn_AddsToParticipantList() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);

        address[] memory participants = presenceRegistry.getEpochParticipants(epochId);
        assertEq(participants.length, 1);
        assertEq(participants[0], user1);
    }

    function test_CheckIn_IncrementsTotalCheckIns() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);
        assertEq(presenceRegistry.totalCheckIns(user1), 1);
    }

    function test_CheckIn_MultipleUsers() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);
        vm.prank(user2);
        presenceRegistry.checkIn(epochId);

        assertEq(presenceRegistry.getEpochParticipantCount(epochId), 2);
    }

    // --- Positive Tests: Check-out ---

    function test_CheckOut_ComputesDuration() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);

        vm.warp(block.timestamp + 2 hours);

        vm.prank(user1);
        presenceRegistry.checkOut(epochId);

        PresenceRegistry.PresenceRecord memory record = presenceRegistry.getPresence(epochId, user1);
        assertEq(record.duration, 2 hours);
        assertTrue(record.state == PresenceRegistry.PresenceState.CheckedOut);
    }

    function test_CheckOut_EmitsEvent() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);

        vm.warp(block.timestamp + 1 hours);

        vm.expectEmit(true, true, false, true);
        emit PresenceRegistry.CheckedOut(epochId, user1, uint64(block.timestamp), uint64(1 hours));

        vm.prank(user1);
        presenceRegistry.checkOut(epochId);
    }

    function test_CheckOut_CapsAtMaxDuration() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);

        // Environmental maxRewardDuration = 21600 (6 hours). Warp 8 hours.
        vm.warp(block.timestamp + 8 hours);

        vm.prank(user1);
        presenceRegistry.checkOut(epochId);

        assertEq(presenceRegistry.getPresenceDuration(epochId, user1), 21_600);
    }

    function test_CheckOut_UpdatesAreaDuration() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);

        vm.warp(block.timestamp + 2 hours);

        vm.prank(user1);
        presenceRegistry.checkOut(epochId);

        assertEq(presenceRegistry.areaDuration(user1, AreaRegistry.AreaType.Environmental), 2 hours);
    }

    // --- Positive Tests: Verify ---

    function test_VerifyPresence_SetsVerifiedState() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);
        vm.warp(block.timestamp + 1 hours);
        vm.prank(user1);
        presenceRegistry.checkOut(epochId);

        vm.prank(validator);
        presenceRegistry.verifyPresence(epochId, user1);

        assertTrue(presenceRegistry.getPresenceState(epochId, user1) == PresenceRegistry.PresenceState.Verified);
    }

    function test_VerifyPresence_EmitsEvent() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);
        vm.warp(block.timestamp + 1 hours);
        vm.prank(user1);
        presenceRegistry.checkOut(epochId);

        vm.expectEmit(true, true, false, true);
        emit PresenceRegistry.PresenceVerified(epochId, user1, validator);

        vm.prank(validator);
        presenceRegistry.verifyPresence(epochId, user1);
    }

    // --- Positive Tests: Dispute ---

    function test_DisputePresence_SetsDisputedState() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);
        vm.warp(block.timestamp + 1 hours);
        vm.prank(user1);
        presenceRegistry.checkOut(epochId);

        vm.prank(validator);
        presenceRegistry.disputePresence(epochId, user1, "Suspicious activity");

        assertTrue(presenceRegistry.getPresenceState(epochId, user1) == PresenceRegistry.PresenceState.Disputed);
    }

    function test_DisputePresence_CanDisputeActivePresence() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);
        vm.warp(block.timestamp + 30 minutes);

        vm.prank(validator);
        presenceRegistry.disputePresence(epochId, user1, "Not present");

        assertTrue(presenceRegistry.getPresenceState(epochId, user1) == PresenceRegistry.PresenceState.Disputed);
    }

    // --- Positive Tests: Force Check-out ---

    function test_ForceCheckOut_ByValidator() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);
        vm.warp(block.timestamp + 2 hours);

        vm.prank(validator);
        presenceRegistry.forceCheckOut(epochId, user1);

        assertTrue(presenceRegistry.getPresenceState(epochId, user1) == PresenceRegistry.PresenceState.CheckedOut);
        assertEq(presenceRegistry.getPresenceDuration(epochId, user1), 2 hours);
    }

    function test_ForceCheckOut_ByAdmin() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);
        vm.warp(block.timestamp + 1 hours);

        vm.prank(admin);
        presenceRegistry.forceCheckOut(epochId, user1);

        assertTrue(presenceRegistry.getPresenceState(epochId, user1) == PresenceRegistry.PresenceState.CheckedOut);
    }

    // --- Positive Tests: Reward Eligibility ---

    function test_IsRewardEligible_TrueWhenMeetsMinStay() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);
        // Environmental minStay = 1800 (30 min). Stay for 1 hour.
        vm.warp(block.timestamp + 1 hours);
        vm.prank(user1);
        presenceRegistry.checkOut(epochId);

        assertTrue(presenceRegistry.isRewardEligible(epochId, user1));
    }

    function test_IsRewardEligible_FalseWhenBelowMinStay() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);
        // Stay for only 10 minutes (below 30 min minimum)
        vm.warp(block.timestamp + 10 minutes);
        vm.prank(user1);
        presenceRegistry.checkOut(epochId);

        assertFalse(presenceRegistry.isRewardEligible(epochId, user1));
    }

    function test_IsRewardEligible_FalseWhenDisputed() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);
        vm.warp(block.timestamp + 1 hours);
        vm.prank(user1);
        presenceRegistry.checkOut(epochId);

        vm.prank(validator);
        presenceRegistry.disputePresence(epochId, user1, "Fake");

        assertFalse(presenceRegistry.isRewardEligible(epochId, user1));
    }

    function test_IsRewardEligible_TrueWhenVerified() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);
        vm.warp(block.timestamp + 1 hours);
        vm.prank(user1);
        presenceRegistry.checkOut(epochId);

        vm.prank(validator);
        presenceRegistry.verifyPresence(epochId, user1);

        assertTrue(presenceRegistry.isRewardEligible(epochId, user1));
    }

    // --- Reverse Tests ---

    function test_CheckIn_RevertsWhen_EpochNotActive() public {
        // Create epoch but don't activate it
        uint64 start = uint64(block.timestamp + 1 hours);
        uint64 end = uint64(block.timestamp + 5 hours);
        vm.prank(creator);
        uint256 inactiveId = epochManager.createEpoch("Test", "Loc", AreaRegistry.AreaType.Health, start, end, 50);

        vm.prank(user1);
        vm.expectRevert(PresenceRegistry.EpochNotActive.selector);
        presenceRegistry.checkIn(inactiveId);
    }

    function test_CheckIn_RevertsWhen_AlreadyCheckedIn() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);

        vm.prank(user1);
        vm.expectRevert(PresenceRegistry.AlreadyCheckedIn.selector);
        presenceRegistry.checkIn(epochId);
    }

    function test_CheckOut_RevertsWhen_NotCheckedIn() public {
        vm.prank(user1);
        vm.expectRevert(PresenceRegistry.NotCheckedIn.selector);
        presenceRegistry.checkOut(epochId);
    }

    function test_VerifyPresence_RevertsWhen_CallerNotValidator() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);
        vm.warp(block.timestamp + 1 hours);
        vm.prank(user1);
        presenceRegistry.checkOut(epochId);

        vm.prank(attacker);
        vm.expectRevert(PresenceRegistry.Unauthorized.selector);
        presenceRegistry.verifyPresence(epochId, user1);
    }

    function test_VerifyPresence_RevertsWhen_StillActive() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);

        vm.prank(validator);
        vm.expectRevert(
            abi.encodeWithSelector(
                PresenceRegistry.InvalidPresenceState.selector,
                PresenceRegistry.PresenceState.Active,
                PresenceRegistry.PresenceState.CheckedOut
            )
        );
        presenceRegistry.verifyPresence(epochId, user1);
    }

    function test_DisputePresence_RevertsWhen_CallerNotValidator() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);
        vm.warp(block.timestamp + 1 hours);
        vm.prank(user1);
        presenceRegistry.checkOut(epochId);

        vm.prank(attacker);
        vm.expectRevert(PresenceRegistry.Unauthorized.selector);
        presenceRegistry.disputePresence(epochId, user1, "Fake");
    }

    function test_ForceCheckOut_RevertsWhen_CallerUnauthorized() public {
        vm.prank(user1);
        presenceRegistry.checkIn(epochId);

        vm.prank(attacker);
        vm.expectRevert(PresenceRegistry.Unauthorized.selector);
        presenceRegistry.forceCheckOut(epochId, user1);
    }

    function test_ForceCheckOut_RevertsWhen_NotActive() public {
        vm.prank(validator);
        vm.expectRevert(PresenceRegistry.NotCheckedIn.selector);
        presenceRegistry.forceCheckOut(epochId, user1);
    }

    function test_CheckIn_RevertsWhen_EpochFull() public {
        // Create epoch with max 1 participant
        uint64 start = uint64(block.timestamp + 1 hours);
        uint64 end = uint64(block.timestamp + 5 hours);
        vm.prank(creator);
        uint256 smallId = epochManager.createEpoch("Small", "Loc", AreaRegistry.AreaType.Health, start, end, 1);
        vm.prank(creator);
        epochManager.activateEpoch(smallId);

        vm.prank(user1);
        presenceRegistry.checkIn(smallId);

        vm.prank(user2);
        vm.expectRevert(PresenceRegistry.EpochFull.selector);
        presenceRegistry.checkIn(smallId);
    }
}
