// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC8004Validation} from "../../src/ai/interfaces/IERC8004Validation.sol";

/// @title MockValidationRegistry
/// @notice Minimal mock implementation of IERC8004Validation for testing purposes.
/// @dev Stores validation requests and responses, tracks hashes per agent and per validator.
contract MockValidationRegistry is IERC8004Validation {
    struct ValidationRecord {
        address validatorAddress;
        uint256 agentId;
        string requestURI;
        uint8 response;
        string responseURI;
        bytes32 responseHash;
        string tag;
        uint256 lastUpdate;
        bool exists;
        bool hasResponse;
    }

    address public immutable identityRegistry;

    // requestHash => ValidationRecord
    mapping(bytes32 => ValidationRecord) private _validations;
    // agentId => list of request hashes
    mapping(uint256 => bytes32[]) private _agentValidations;
    // validatorAddress => list of request hashes
    mapping(address => bytes32[]) private _validatorRequests;

    error RequestAlreadyExists(bytes32 requestHash);
    error RequestNotFound(bytes32 requestHash);
    error NotRequestValidator(bytes32 requestHash, address caller);

    constructor(
        address _identityRegistry
    ) {
        identityRegistry = _identityRegistry;
    }

    /// @inheritdoc IERC8004Validation
    function getIdentityRegistry() external view returns (address) {
        return identityRegistry;
    }

    /// @inheritdoc IERC8004Validation
    function validationRequest(
        address validatorAddress,
        uint256 agentId,
        string calldata requestURI,
        bytes32 requestHash
    ) external {
        if (_validations[requestHash].exists) revert RequestAlreadyExists(requestHash);

        _validations[requestHash] = ValidationRecord({
            validatorAddress: validatorAddress,
            agentId: agentId,
            requestURI: requestURI,
            response: 0,
            responseURI: "",
            responseHash: bytes32(0),
            tag: "",
            lastUpdate: block.timestamp,
            exists: true,
            hasResponse: false
        });

        _agentValidations[agentId].push(requestHash);
        _validatorRequests[validatorAddress].push(requestHash);

        emit ValidationRequest(validatorAddress, agentId, requestURI, requestHash);
    }

    /// @inheritdoc IERC8004Validation
    function validationResponse(
        bytes32 requestHash,
        uint8 response,
        string calldata responseURI,
        bytes32 responseHash,
        string calldata tag
    ) external {
        ValidationRecord storage record = _validations[requestHash];
        if (!record.exists) revert RequestNotFound(requestHash);
        if (record.validatorAddress != msg.sender) revert NotRequestValidator(requestHash, msg.sender);

        record.response = response;
        record.responseURI = responseURI;
        record.responseHash = responseHash;
        record.tag = tag;
        record.lastUpdate = block.timestamp;
        record.hasResponse = true;

        emit ValidationResponse(msg.sender, record.agentId, requestHash, response, responseURI, responseHash, tag);
    }

    /// @inheritdoc IERC8004Validation
    function getValidationStatus(
        bytes32 requestHash
    )
        external
        view
        returns (
            address validatorAddress,
            uint256 agentId,
            uint8 response,
            bytes32 responseHash,
            string memory tag,
            uint256 lastUpdate
        )
    {
        ValidationRecord storage record = _validations[requestHash];
        return (
            record.validatorAddress,
            record.agentId,
            record.response,
            record.responseHash,
            record.tag,
            record.lastUpdate
        );
    }

    /// @inheritdoc IERC8004Validation
    function getSummary(
        uint256 agentId,
        address[] calldata validatorAddresses,
        string calldata tag
    ) external view returns (uint64 count, uint8 averageResponse) {
        bytes32[] storage hashes = _agentValidations[agentId];
        bytes32 tagHash = bytes(tag).length > 0 ? keccak256(bytes(tag)) : bytes32(0);

        uint256 totalResponse = 0;

        for (uint256 i = 0; i < hashes.length; i++) {
            ValidationRecord storage record = _validations[hashes[i]];

            // Skip entries without a response
            if (!record.hasResponse) continue;

            // Apply tag filter
            if (tagHash != bytes32(0) && keccak256(bytes(record.tag)) != tagHash) continue;

            // Apply validator filter
            if (validatorAddresses.length > 0) {
                bool found = false;
                for (uint256 j = 0; j < validatorAddresses.length; j++) {
                    if (record.validatorAddress == validatorAddresses[j]) {
                        found = true;
                        break;
                    }
                }
                if (!found) continue;
            }

            totalResponse += record.response;
            count++;
        }

        if (count > 0) {
            // Safe cast: each record.response is uint8 (max 255), so the average of uint8 values <= 255
            // forge-lint: disable-next-line(unsafe-typecast)
            averageResponse = uint8(totalResponse / count);
        }
    }

    /// @inheritdoc IERC8004Validation
    function getAgentValidations(uint256 agentId) external view returns (bytes32[] memory requestHashes) {
        return _agentValidations[agentId];
    }

    /// @inheritdoc IERC8004Validation
    function getValidatorRequests(address validatorAddress) external view returns (bytes32[] memory requestHashes) {
        return _validatorRequests[validatorAddress];
    }
}
