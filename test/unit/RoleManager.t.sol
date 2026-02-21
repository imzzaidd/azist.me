// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {RoleManager} from "../../src/access/RoleManager.sol";

contract RoleManagerTest is Test {
    RoleManager public roleManager;
    address public admin;
    address public user;
    address public attacker;

    function setUp() public {
        admin = makeAddr("admin");
        user = makeAddr("user");
        attacker = makeAddr("attacker");

        vm.prank(admin);
        roleManager = new RoleManager(admin);
    }

    // --- Positive Tests ---

    function test_Constructor_SetsAdminRole() public view {
        assertTrue(roleManager.hasRole(roleManager.DEFAULT_ADMIN_ROLE(), admin));
    }

    function test_GrantEpochCreator_GrantsRole() public {
        vm.prank(admin);
        roleManager.grantEpochCreator(user);
        assertTrue(roleManager.hasRole(roleManager.EPOCH_CREATOR_ROLE(), user));
    }

    function test_GrantValidator_GrantsRole() public {
        vm.prank(admin);
        roleManager.grantValidator(user);
        assertTrue(roleManager.hasRole(roleManager.VALIDATOR_ROLE(), user));
    }

    function test_GrantRewardMinter_GrantsRole() public {
        vm.prank(admin);
        roleManager.grantRewardMinter(user);
        assertTrue(roleManager.hasRole(roleManager.REWARD_MINTER_ROLE(), user));
    }

    function test_RevokeEpochCreator_RevokesRole() public {
        vm.startPrank(admin);
        roleManager.grantEpochCreator(user);
        roleManager.revokeEpochCreator(user);
        vm.stopPrank();
        assertFalse(roleManager.hasRole(roleManager.EPOCH_CREATOR_ROLE(), user));
    }

    function test_RevokeValidator_RevokesRole() public {
        vm.startPrank(admin);
        roleManager.grantValidator(user);
        roleManager.revokeValidator(user);
        vm.stopPrank();
        assertFalse(roleManager.hasRole(roleManager.VALIDATOR_ROLE(), user));
    }

    function test_RevokeRewardMinter_RevokesRole() public {
        vm.startPrank(admin);
        roleManager.grantRewardMinter(user);
        roleManager.revokeRewardMinter(user);
        vm.stopPrank();
        assertFalse(roleManager.hasRole(roleManager.REWARD_MINTER_ROLE(), user));
    }

    // --- Reverse Tests ---

    function test_Constructor_RevertsWhen_ZeroAddress() public {
        vm.expectRevert(RoleManager.ZeroAddress.selector);
        new RoleManager(address(0));
    }

    function test_GrantEpochCreator_RevertsWhen_CallerNotAdmin() public {
        vm.prank(attacker);
        vm.expectRevert();
        roleManager.grantEpochCreator(user);
    }

    function test_GrantValidator_RevertsWhen_CallerNotAdmin() public {
        vm.prank(attacker);
        vm.expectRevert();
        roleManager.grantValidator(user);
    }

    function test_GrantRewardMinter_RevertsWhen_CallerNotAdmin() public {
        vm.prank(attacker);
        vm.expectRevert();
        roleManager.grantRewardMinter(user);
    }

    function test_RevokeEpochCreator_RevertsWhen_CallerNotAdmin() public {
        vm.prank(attacker);
        vm.expectRevert();
        roleManager.revokeEpochCreator(user);
    }

    function test_RevokeValidator_RevertsWhen_CallerNotAdmin() public {
        vm.prank(attacker);
        vm.expectRevert();
        roleManager.revokeValidator(user);
    }

    function test_RevokeRewardMinter_RevertsWhen_CallerNotAdmin() public {
        vm.prank(attacker);
        vm.expectRevert();
        roleManager.revokeRewardMinter(user);
    }

    // --- Role Constants Tests ---

    function test_RoleConstants_AreUnique() public view {
        bytes32 epochCreator = roleManager.EPOCH_CREATOR_ROLE();
        bytes32 validator = roleManager.VALIDATOR_ROLE();
        bytes32 rewardMinter = roleManager.REWARD_MINTER_ROLE();
        bytes32 defaultAdmin = roleManager.DEFAULT_ADMIN_ROLE();

        assertTrue(epochCreator != validator);
        assertTrue(epochCreator != rewardMinter);
        assertTrue(epochCreator != defaultAdmin);
        assertTrue(validator != rewardMinter);
        assertTrue(validator != defaultAdmin);
        assertTrue(rewardMinter != defaultAdmin);
    }
}
