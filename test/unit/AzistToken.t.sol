// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {RoleManager} from "../../src/access/RoleManager.sol";
import {AzistToken} from "../../src/token/AzistToken.sol";

contract AzistTokenTest is Test {
    RoleManager public roleManager;
    AzistToken public token;
    address public admin;
    address public minter;
    address public user;
    address public attacker;

    function setUp() public {
        admin = makeAddr("admin");
        minter = makeAddr("minter");
        user = makeAddr("user");
        attacker = makeAddr("attacker");

        vm.startPrank(admin);
        roleManager = new RoleManager(admin);
        token = new AzistToken(address(roleManager));
        roleManager.grantRewardMinter(minter);
        vm.stopPrank();
    }

    // --- Positive Tests ---

    function test_Constructor_SetsNameAndSymbol() public view {
        assertEq(token.name(), "Azist Token");
        assertEq(token.symbol(), "AZIST");
    }

    function test_Constructor_SetsRoleManager() public view {
        assertEq(address(token.ROLE_MANAGER()), address(roleManager));
    }

    function test_Constructor_StartsWithZeroSupply() public view {
        assertEq(token.totalSupply(), 0);
    }

    function test_Mint_MintsTokensToRecipient() public {
        vm.prank(minter);
        token.mint(user, 1000 ether);
        assertEq(token.balanceOf(user), 1000 ether);
    }

    function test_Mint_IncreasesTotalSupply() public {
        vm.prank(minter);
        token.mint(user, 500 ether);
        assertEq(token.totalSupply(), 500 ether);
    }

    function test_Burn_ReducesBalance() public {
        vm.prank(minter);
        token.mint(user, 1000 ether);

        vm.prank(user);
        token.burn(400 ether);
        assertEq(token.balanceOf(user), 600 ether);
    }

    function test_Decimals_Returns18() public view {
        assertEq(token.decimals(), 18);
    }

    // --- Reverse Tests ---

    function test_Mint_RevertsWhen_CallerNotMinter() public {
        vm.prank(attacker);
        vm.expectRevert(AzistToken.Unauthorized.selector);
        token.mint(user, 1000 ether);
    }

    function test_Mint_RevertsWhen_AdminTriesToMint() public {
        vm.prank(admin);
        vm.expectRevert(AzistToken.Unauthorized.selector);
        token.mint(user, 1000 ether);
    }

    // --- Fuzz Tests ---

    function test_Fuzz_Mint_MintsCorrectAmount(
        uint256 amount
    ) public {
        amount = bound(amount, 1, type(uint128).max);
        vm.prank(minter);
        token.mint(user, amount);
        assertEq(token.balanceOf(user), amount);
        assertEq(token.totalSupply(), amount);
    }
}
