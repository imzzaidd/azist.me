// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {RoleManager} from "../../src/access/RoleManager.sol";
import {AreaRegistry} from "../../src/areas/AreaRegistry.sol";
import {EpochManager} from "../../src/core/EpochManager.sol";

contract EpochManagerTest is Test {
    RoleManager public roleManager;
    AreaRegistry public areaRegistry;
    EpochManager public epochManager;

    address public admin;
    address public creator;
    address public attacker;

    uint64 public startTime;
    uint64 public endTime;

    function setUp() public {
        admin = makeAddr("admin");
        creator = makeAddr("creator");
        attacker = makeAddr("attacker");

        startTime = uint64(block.timestamp + 1 hours);
        endTime = uint64(block.timestamp + 5 hours);

        vm.startPrank(admin);
        roleManager = new RoleManager(admin);
        areaRegistry = new AreaRegistry(address(roleManager));
        epochManager = new EpochManager(address(roleManager), address(areaRegistry));
        roleManager.grantEpochCreator(creator);
        vm.stopPrank();
    }

    function _createDefaultEpoch() internal returns (uint256) {
        vm.prank(creator);
        return epochManager.createEpoch("Beach Cleanup", "Playa del Carmen", AreaRegistry.AreaType.Environmental, startTime, endTime, 100);
    }

    // --- Positive Tests: Creation ---

    function test_CreateEpoch_IncrementsCount() public {
        _createDefaultEpoch();
        assertEq(epochManager.epochCount(), 1);
    }

    function test_CreateEpoch_StoresCorrectData() public {
        uint256 id = _createDefaultEpoch();
        EpochManager.Epoch memory epoch = epochManager.getEpoch(id);

        assertEq(epoch.id, 1);
        assertEq(epoch.name, "Beach Cleanup");
        assertEq(epoch.location, "Playa del Carmen");
        assertTrue(epoch.area == AreaRegistry.AreaType.Environmental);
        assertEq(epoch.startTime, startTime);
        assertEq(epoch.endTime, endTime);
        assertTrue(epoch.state == EpochManager.EpochState.Scheduled);
        assertEq(epoch.creator, creator);
        assertEq(epoch.participantCount, 0);
        assertEq(epoch.maxParticipants, 100);
    }

    function test_CreateEpoch_EmitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit EpochManager.EpochCreated(1, "Beach Cleanup", AreaRegistry.AreaType.Environmental, startTime, endTime);

        vm.prank(creator);
        epochManager.createEpoch("Beach Cleanup", "Playa del Carmen", AreaRegistry.AreaType.Environmental, startTime, endTime, 100);
    }

    function test_CreateEpoch_ReturnsEpochId() public {
        vm.prank(creator);
        uint256 id = epochManager.createEpoch("Test", "Loc", AreaRegistry.AreaType.Health, startTime, endTime, 50);
        assertEq(id, 1);
    }

    function test_CreateMultipleEpochs_IncrementsIds() public {
        vm.startPrank(creator);
        uint256 id1 = epochManager.createEpoch("E1", "L1", AreaRegistry.AreaType.Health, startTime, endTime, 50);
        uint256 id2 = epochManager.createEpoch("E2", "L2", AreaRegistry.AreaType.Community, startTime, endTime, 50);
        vm.stopPrank();

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(epochManager.epochCount(), 2);
    }

    // --- Positive Tests: State Transitions ---

    function test_ActivateEpoch_TransitionsFromScheduled() public {
        uint256 id = _createDefaultEpoch();

        vm.prank(creator);
        epochManager.activateEpoch(id);

        assertTrue(epochManager.getEpochState(id) == EpochManager.EpochState.Active);
    }

    function test_ActivateEpoch_EmitsEvent() public {
        uint256 id = _createDefaultEpoch();

        vm.expectEmit(true, false, false, true);
        emit EpochManager.EpochStateChanged(id, EpochManager.EpochState.Scheduled, EpochManager.EpochState.Active);

        vm.prank(creator);
        epochManager.activateEpoch(id);
    }

    function test_CloseEpoch_TransitionsFromActive() public {
        uint256 id = _createDefaultEpoch();
        vm.startPrank(creator);
        epochManager.activateEpoch(id);
        epochManager.closeEpoch(id);
        vm.stopPrank();

        assertTrue(epochManager.getEpochState(id) == EpochManager.EpochState.Closed);
    }

    function test_FinalizeEpoch_TransitionsFromClosed() public {
        uint256 id = _createDefaultEpoch();
        vm.startPrank(creator);
        epochManager.activateEpoch(id);
        epochManager.closeEpoch(id);
        epochManager.finalizeEpoch(id);
        vm.stopPrank();

        assertTrue(epochManager.getEpochState(id) == EpochManager.EpochState.Finalized);
    }

    function test_FullLifecycle_ScheduledToFinalized() public {
        uint256 id = _createDefaultEpoch();
        vm.startPrank(creator);

        assertTrue(epochManager.getEpochState(id) == EpochManager.EpochState.Scheduled);
        epochManager.activateEpoch(id);
        assertTrue(epochManager.getEpochState(id) == EpochManager.EpochState.Active);
        epochManager.closeEpoch(id);
        assertTrue(epochManager.getEpochState(id) == EpochManager.EpochState.Closed);
        epochManager.finalizeEpoch(id);
        assertTrue(epochManager.getEpochState(id) == EpochManager.EpochState.Finalized);

        vm.stopPrank();
    }

    function test_AdminCanActivateEpoch() public {
        uint256 id = _createDefaultEpoch();
        vm.prank(admin);
        epochManager.activateEpoch(id);
        assertTrue(epochManager.getEpochState(id) == EpochManager.EpochState.Active);
    }

    // --- Positive Tests: Getters ---

    function test_IsEpochActive_ReturnsTrueWhenActive() public {
        uint256 id = _createDefaultEpoch();
        vm.prank(creator);
        epochManager.activateEpoch(id);
        assertTrue(epochManager.isEpochActive(id));
    }

    function test_IsEpochActive_ReturnsFalseWhenScheduled() public {
        uint256 id = _createDefaultEpoch();
        assertFalse(epochManager.isEpochActive(id));
    }

    function test_IsEpochActive_ReturnsFalseForInvalidId() public view {
        assertFalse(epochManager.isEpochActive(999));
    }

    function test_GetEpochArea_ReturnsCorrectArea() public {
        uint256 id = _createDefaultEpoch();
        assertTrue(epochManager.getEpochArea(id) == AreaRegistry.AreaType.Environmental);
    }

    function test_GetEpochEndTime_ReturnsCorrectTime() public {
        uint256 id = _createDefaultEpoch();
        assertEq(epochManager.getEpochEndTime(id), endTime);
    }

    // --- Reverse Tests: Creation ---

    function test_CreateEpoch_RevertsWhen_CallerNotCreator() public {
        vm.prank(attacker);
        vm.expectRevert(EpochManager.Unauthorized.selector);
        epochManager.createEpoch("Test", "Loc", AreaRegistry.AreaType.Health, startTime, endTime, 50);
    }

    function test_CreateEpoch_RevertsWhen_EndBeforeStart() public {
        vm.prank(creator);
        vm.expectRevert(EpochManager.InvalidTimeRange.selector);
        epochManager.createEpoch("Test", "Loc", AreaRegistry.AreaType.Health, endTime, startTime, 50);
    }

    function test_CreateEpoch_RevertsWhen_SameStartEnd() public {
        vm.prank(creator);
        vm.expectRevert(EpochManager.InvalidTimeRange.selector);
        epochManager.createEpoch("Test", "Loc", AreaRegistry.AreaType.Health, startTime, startTime, 50);
    }

    function test_CreateEpoch_RevertsWhen_ZeroMaxParticipants() public {
        vm.prank(creator);
        vm.expectRevert(EpochManager.InvalidMaxParticipants.selector);
        epochManager.createEpoch("Test", "Loc", AreaRegistry.AreaType.Health, startTime, endTime, 0);
    }

    function test_CreateEpoch_RevertsWhen_AreaNotActive() public {
        vm.prank(admin);
        areaRegistry.toggleArea(AreaRegistry.AreaType.Health, false);

        vm.prank(creator);
        vm.expectRevert(EpochManager.AreaNotActive.selector);
        epochManager.createEpoch("Test", "Loc", AreaRegistry.AreaType.Health, startTime, endTime, 50);
    }

    // --- Reverse Tests: State Transitions ---

    function test_ActivateEpoch_RevertsWhen_AlreadyActive() public {
        uint256 id = _createDefaultEpoch();
        vm.startPrank(creator);
        epochManager.activateEpoch(id);
        vm.expectRevert(
            abi.encodeWithSelector(
                EpochManager.InvalidStateTransition.selector, EpochManager.EpochState.Active, EpochManager.EpochState.Active
            )
        );
        epochManager.activateEpoch(id);
        vm.stopPrank();
    }

    function test_CloseEpoch_RevertsWhen_StillScheduled() public {
        uint256 id = _createDefaultEpoch();
        vm.prank(creator);
        vm.expectRevert(
            abi.encodeWithSelector(
                EpochManager.InvalidStateTransition.selector,
                EpochManager.EpochState.Scheduled,
                EpochManager.EpochState.Closed
            )
        );
        epochManager.closeEpoch(id);
    }

    function test_FinalizeEpoch_RevertsWhen_StillActive() public {
        uint256 id = _createDefaultEpoch();
        vm.startPrank(creator);
        epochManager.activateEpoch(id);
        vm.expectRevert(
            abi.encodeWithSelector(
                EpochManager.InvalidStateTransition.selector,
                EpochManager.EpochState.Active,
                EpochManager.EpochState.Finalized
            )
        );
        epochManager.finalizeEpoch(id);
        vm.stopPrank();
    }

    function test_ActivateEpoch_RevertsWhen_CallerUnauthorized() public {
        uint256 id = _createDefaultEpoch();
        vm.prank(attacker);
        vm.expectRevert(EpochManager.Unauthorized.selector);
        epochManager.activateEpoch(id);
    }

    function test_GetEpoch_RevertsWhen_InvalidId() public {
        vm.expectRevert(EpochManager.EpochNotFound.selector);
        epochManager.getEpoch(999);
    }

    function test_GetEpoch_RevertsWhen_ZeroId() public {
        vm.expectRevert(EpochManager.EpochNotFound.selector);
        epochManager.getEpoch(0);
    }
}
