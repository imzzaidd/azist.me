// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract RoleManager is AccessControl {
    bytes32 public constant EPOCH_CREATOR_ROLE = keccak256("EPOCH_CREATOR_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant REWARD_MINTER_ROLE = keccak256("REWARD_MINTER_ROLE");

    error ZeroAddress();

    constructor(address admin) {
        if (admin == address(0)) revert ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function grantEpochCreator(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(EPOCH_CREATOR_ROLE, account);
    }

    function grantValidator(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(VALIDATOR_ROLE, account);
    }

    function grantRewardMinter(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(REWARD_MINTER_ROLE, account);
    }

    function revokeEpochCreator(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(EPOCH_CREATOR_ROLE, account);
    }

    function revokeValidator(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(VALIDATOR_ROLE, account);
    }

    function revokeRewardMinter(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(REWARD_MINTER_ROLE, account);
    }
}
