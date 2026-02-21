// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {RoleManager} from "../../src/access/RoleManager.sol";
import {AreaRegistry} from "../../src/areas/AreaRegistry.sol";
import {LevelSystem} from "../../src/gamification/LevelSystem.sol";

contract LevelSystemTest is Test {
    RoleManager public roleManager;
    LevelSystem public levelSystem;
    address public admin;
    address public caller;
    address public user;

    function setUp() public {
        admin = makeAddr("admin");
        caller = makeAddr("caller");
        user = makeAddr("user");

        vm.prank(admin);
        roleManager = new RoleManager(admin);
        levelSystem = new LevelSystem(address(roleManager));
    }

    // --- Positive Tests: XP ---

    function test_AddXP_IncreasesAreaXP() public {
        vm.prank(caller);
        levelSystem.addXP(user, AreaRegistry.AreaType.Environmental, 500);
        assertEq(levelSystem.getAreaXP(user, AreaRegistry.AreaType.Environmental), 500);
    }

    function test_AddXP_IncreasesTotalXP() public {
        vm.prank(caller);
        levelSystem.addXP(user, AreaRegistry.AreaType.Environmental, 500);
        assertEq(levelSystem.getTotalXP(user), 500);
    }

    function test_AddXP_AccumulatesAcrossAreas() public {
        levelSystem.addXP(user, AreaRegistry.AreaType.Environmental, 300);
        levelSystem.addXP(user, AreaRegistry.AreaType.Community, 200);
        assertEq(levelSystem.getTotalXP(user), 500);
        assertEq(levelSystem.getAreaXP(user, AreaRegistry.AreaType.Environmental), 300);
        assertEq(levelSystem.getAreaXP(user, AreaRegistry.AreaType.Community), 200);
    }

    function test_AddXP_EmitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit LevelSystem.XPAdded(user, AreaRegistry.AreaType.Health, 100, 100);
        levelSystem.addXP(user, AreaRegistry.AreaType.Health, 100);
    }

    // --- Positive Tests: Levels ---

    function test_Level_StartsAtZero() public view {
        assertEq(levelSystem.getLevel(user), 0);
    }

    function test_Level_ReachesLevel1() public {
        // xpForLevel(1) = 100 * 1 * 1 = 100
        levelSystem.addXP(user, AreaRegistry.AreaType.Health, 100);
        assertEq(levelSystem.getLevel(user), 1);
    }

    function test_Level_ReachesLevel5() public {
        // xpForLevel(5) = 100 * 25 = 2500
        levelSystem.addXP(user, AreaRegistry.AreaType.Health, 2500);
        assertEq(levelSystem.getLevel(user), 5);
    }

    function test_Level_ReachesLevel10() public {
        // xpForLevel(10) = 100 * 100 = 10000
        levelSystem.addXP(user, AreaRegistry.AreaType.Health, 10_000);
        assertEq(levelSystem.getLevel(user), 10);
    }

    function test_LevelUp_EmitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit LevelSystem.LevelUp(user, 0, 1);
        levelSystem.addXP(user, AreaRegistry.AreaType.Health, 100);
    }

    function test_Level_DoesNotExceedMax() public {
        // xpForLevel(100) = 100 * 10000 = 1_000_000
        levelSystem.addXP(user, AreaRegistry.AreaType.Health, 2_000_000);
        assertEq(levelSystem.getLevel(user), 100);
    }

    // --- Positive Tests: Multiplier ---

    function test_LevelMultiplier_Level0_Returns10000() public view {
        assertEq(levelSystem.getLevelMultiplier(user), 10_000);
    }

    function test_LevelMultiplier_Level10_Returns11000() public {
        levelSystem.addXP(user, AreaRegistry.AreaType.Health, 10_000);
        assertEq(levelSystem.getLevelMultiplier(user), 11_000);
    }

    function test_LevelMultiplier_Level50_Returns15000() public {
        // xpForLevel(50) = 100 * 2500 = 250_000
        levelSystem.addXP(user, AreaRegistry.AreaType.Health, 250_000);
        assertEq(levelSystem.getLevelMultiplier(user), 15_000);
    }

    function test_LevelMultiplier_Level100_Returns20000() public {
        levelSystem.addXP(user, AreaRegistry.AreaType.Health, 1_000_000);
        assertEq(levelSystem.getLevelMultiplier(user), 20_000);
    }

    // --- Positive Tests: XP Thresholds ---

    function test_XpForLevel_Level1() public view {
        assertEq(levelSystem.xpForLevel(1), 100);
    }

    function test_XpForLevel_Level5() public view {
        assertEq(levelSystem.xpForLevel(5), 2500);
    }

    function test_XpForLevel_Level10() public view {
        assertEq(levelSystem.xpForLevel(10), 10_000);
    }

    function test_XpForLevel_Level20() public view {
        assertEq(levelSystem.xpForLevel(20), 40_000);
    }

    // --- Reverse Tests ---

    function test_AddXP_RevertsWhen_ZeroAmount() public {
        vm.expectRevert(LevelSystem.ZeroAmount.selector);
        levelSystem.addXP(user, AreaRegistry.AreaType.Health, 0);
    }

    // --- Boundary Tests ---

    function test_Level_JustBelowLevel1() public {
        levelSystem.addXP(user, AreaRegistry.AreaType.Health, 99);
        assertEq(levelSystem.getLevel(user), 0);
    }

    function test_Level_ExactlyLevel1() public {
        levelSystem.addXP(user, AreaRegistry.AreaType.Health, 100);
        assertEq(levelSystem.getLevel(user), 1);
    }

    function test_Level_IncrementalXP_TriggersLevelUp() public {
        levelSystem.addXP(user, AreaRegistry.AreaType.Health, 50);
        assertEq(levelSystem.getLevel(user), 0);
        levelSystem.addXP(user, AreaRegistry.AreaType.Health, 50);
        assertEq(levelSystem.getLevel(user), 1);
    }
}
