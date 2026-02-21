// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {RoleManager} from "../access/RoleManager.sol";

contract AzistToken is ERC20, ERC20Burnable {
    RoleManager public immutable ROLE_MANAGER;

    error Unauthorized();

    modifier onlyMinter() {
        _checkMinter();
        _;
    }

    constructor(
        address _roleManager
    ) ERC20("Azist Token", "AZIST") {
        ROLE_MANAGER = RoleManager(_roleManager);
    }

    function mint(
        address to,
        uint256 amount
    ) external onlyMinter {
        _mint(to, amount);
    }

    function _checkMinter() internal view {
        if (!ROLE_MANAGER.hasRole(ROLE_MANAGER.REWARD_MINTER_ROLE(), msg.sender)) {
            revert Unauthorized();
        }
    }
}
