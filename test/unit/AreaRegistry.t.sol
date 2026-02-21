// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {RoleManager} from "../../src/access/RoleManager.sol";
import {AreaRegistry} from "../../src/areas/AreaRegistry.sol";

contract AreaRegistryTest is Test {
    RoleManager public roleManager;
    AreaRegistry public registry;
    address public admin;
    address public attacker;

    function setUp() public {
        admin = makeAddr("admin");
        attacker = makeAddr("attacker");

        vm.startPrank(admin);
        roleManager = new RoleManager(admin);
        registry = new AreaRegistry(address(roleManager));
        vm.stopPrank();
    }

    // --- Positive Tests: Default Configs ---

    function test_DefaultConfig_Environmental() public view {
        AreaRegistry.AreaConfig memory config = registry.getAreaConfig(AreaRegistry.AreaType.Environmental);
        assertEq(config.rewardMultiplier, 15_000);
        assertEq(config.minStaySeconds, 1800);
        assertEq(config.maxRewardDuration, 21_600);
        assertEq(config.xpPerMinute, 15);
        assertTrue(config.active);
    }

    function test_DefaultConfig_Community() public view {
        AreaRegistry.AreaConfig memory config = registry.getAreaConfig(AreaRegistry.AreaType.Community);
        assertEq(config.rewardMultiplier, 13_000);
        assertEq(config.minStaySeconds, 1200);
        assertEq(config.maxRewardDuration, 28_800);
        assertEq(config.xpPerMinute, 12);
        assertTrue(config.active);
    }

    function test_DefaultConfig_Education() public view {
        AreaRegistry.AreaConfig memory config = registry.getAreaConfig(AreaRegistry.AreaType.Education);
        assertEq(config.rewardMultiplier, 12_000);
        assertEq(config.minStaySeconds, 2700);
        assertEq(config.maxRewardDuration, 14_400);
        assertEq(config.xpPerMinute, 10);
        assertTrue(config.active);
    }

    function test_DefaultConfig_Health() public view {
        AreaRegistry.AreaConfig memory config = registry.getAreaConfig(AreaRegistry.AreaType.Health);
        assertEq(config.rewardMultiplier, 11_000);
        assertEq(config.minStaySeconds, 900);
        assertEq(config.maxRewardDuration, 10_800);
        assertEq(config.xpPerMinute, 8);
        assertTrue(config.active);
    }

    function test_DefaultConfig_Cultural() public view {
        AreaRegistry.AreaConfig memory config = registry.getAreaConfig(AreaRegistry.AreaType.Cultural);
        assertEq(config.rewardMultiplier, 14_000);
        assertEq(config.minStaySeconds, 1800);
        assertEq(config.maxRewardDuration, 18_000);
        assertEq(config.xpPerMinute, 13);
        assertTrue(config.active);
    }

    function test_AllAreas_ActiveByDefault() public view {
        assertTrue(registry.isAreaActive(AreaRegistry.AreaType.Environmental));
        assertTrue(registry.isAreaActive(AreaRegistry.AreaType.Community));
        assertTrue(registry.isAreaActive(AreaRegistry.AreaType.Education));
        assertTrue(registry.isAreaActive(AreaRegistry.AreaType.Health));
        assertTrue(registry.isAreaActive(AreaRegistry.AreaType.Cultural));
    }

    // --- Positive Tests: Updates ---

    function test_UpdateAreaConfig_UpdatesValues() public {
        vm.prank(admin);
        registry.updateAreaConfig(AreaRegistry.AreaType.Environmental, 20_000, 600, 36_000, 20);

        AreaRegistry.AreaConfig memory config = registry.getAreaConfig(AreaRegistry.AreaType.Environmental);
        assertEq(config.rewardMultiplier, 20_000);
        assertEq(config.minStaySeconds, 600);
        assertEq(config.maxRewardDuration, 36_000);
        assertEq(config.xpPerMinute, 20);
    }

    function test_UpdateAreaConfig_EmitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit AreaRegistry.AreaConfigUpdated(AreaRegistry.AreaType.Health, 20_000, 600, 36_000);

        vm.prank(admin);
        registry.updateAreaConfig(AreaRegistry.AreaType.Health, 20_000, 600, 36_000, 20);
    }

    function test_ToggleArea_DeactivatesArea() public {
        vm.prank(admin);
        registry.toggleArea(AreaRegistry.AreaType.Environmental, false);
        assertFalse(registry.isAreaActive(AreaRegistry.AreaType.Environmental));
    }

    function test_ToggleArea_ReactivatesArea() public {
        vm.startPrank(admin);
        registry.toggleArea(AreaRegistry.AreaType.Environmental, false);
        registry.toggleArea(AreaRegistry.AreaType.Environmental, true);
        vm.stopPrank();
        assertTrue(registry.isAreaActive(AreaRegistry.AreaType.Environmental));
    }

    function test_ToggleArea_EmitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit AreaRegistry.AreaToggled(AreaRegistry.AreaType.Community, false);

        vm.prank(admin);
        registry.toggleArea(AreaRegistry.AreaType.Community, false);
    }

    function test_UpdateAreaConfig_PreservesActiveStatus() public {
        vm.startPrank(admin);
        registry.toggleArea(AreaRegistry.AreaType.Environmental, false);
        registry.updateAreaConfig(AreaRegistry.AreaType.Environmental, 20_000, 600, 36_000, 20);
        vm.stopPrank();
        assertFalse(registry.isAreaActive(AreaRegistry.AreaType.Environmental));
    }

    // --- Getter Tests ---

    function test_GetRewardMultiplier_ReturnsCorrectValue() public view {
        assertEq(registry.getRewardMultiplier(AreaRegistry.AreaType.Environmental), 15_000);
    }

    function test_GetMinStay_ReturnsCorrectValue() public view {
        assertEq(registry.getMinStay(AreaRegistry.AreaType.Health), 900);
    }

    function test_GetMaxDuration_ReturnsCorrectValue() public view {
        assertEq(registry.getMaxDuration(AreaRegistry.AreaType.Education), 14_400);
    }

    function test_GetXpPerMinute_ReturnsCorrectValue() public view {
        assertEq(registry.getXpPerMinute(AreaRegistry.AreaType.Cultural), 13);
    }

    // --- Reverse Tests ---

    function test_UpdateAreaConfig_RevertsWhen_CallerNotAdmin() public {
        vm.prank(attacker);
        vm.expectRevert(AreaRegistry.Unauthorized.selector);
        registry.updateAreaConfig(AreaRegistry.AreaType.Environmental, 20_000, 600, 36_000, 20);
    }

    function test_ToggleArea_RevertsWhen_CallerNotAdmin() public {
        vm.prank(attacker);
        vm.expectRevert(AreaRegistry.Unauthorized.selector);
        registry.toggleArea(AreaRegistry.AreaType.Environmental, false);
    }

    function test_UpdateAreaConfig_RevertsWhen_ZeroMultiplier() public {
        vm.prank(admin);
        vm.expectRevert(AreaRegistry.InvalidMultiplier.selector);
        registry.updateAreaConfig(AreaRegistry.AreaType.Environmental, 0, 600, 36_000, 20);
    }

    function test_UpdateAreaConfig_RevertsWhen_MaxDurationLessThanMinStay() public {
        vm.prank(admin);
        vm.expectRevert(AreaRegistry.InvalidDuration.selector);
        registry.updateAreaConfig(AreaRegistry.AreaType.Environmental, 15_000, 3600, 1800, 15);
    }

    function test_UpdateAreaConfig_RevertsWhen_MaxDurationEqualsMinStay() public {
        vm.prank(admin);
        vm.expectRevert(AreaRegistry.InvalidDuration.selector);
        registry.updateAreaConfig(AreaRegistry.AreaType.Environmental, 15_000, 3600, 3600, 15);
    }

    // --- Constants ---

    function test_BasisPoints_Is10000() public view {
        assertEq(registry.BASIS_POINTS(), 10_000);
    }

    function test_AreaCount_Is5() public view {
        assertEq(registry.AREA_COUNT(), 5);
    }
}
