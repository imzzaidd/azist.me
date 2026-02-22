// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC8004Identity} from "../../src/ai/interfaces/IERC8004Identity.sol";

/// @title MockIdentityRegistry
/// @notice Minimal mock implementation of IERC8004Identity for testing purposes.
/// @dev Stores agent URIs, metadata, wallets, and ownership. Does NOT implement full ERC-721 logic.
contract MockIdentityRegistry is IERC8004Identity {
    uint256 private _nextAgentId = 1;

    // agentId => owner address
    mapping(uint256 => address) public ownerOf;
    // agentId => agent URI
    mapping(uint256 => string) public agentURIs;
    // agentId => metadataKey => metadataValue
    mapping(uint256 => mapping(bytes32 => bytes)) private _metadata;
    // agentId => wallet address
    mapping(uint256 => address) private _agentWallets;

    error AgentDoesNotExist(uint256 agentId);
    error NotAgentOwner(uint256 agentId, address caller);
    error DeadlineExpired(uint256 deadline);
    error InvalidSignatureLength();

    modifier onlyAgentOwner(uint256 agentId) {
        if (ownerOf[agentId] == address(0)) revert AgentDoesNotExist(agentId);
        if (ownerOf[agentId] != msg.sender) revert NotAgentOwner(agentId, msg.sender);
        _;
    }

    /// @inheritdoc IERC8004Identity
    function register(
        string calldata agentURI,
        MetadataEntry[] calldata metadata
    ) external returns (uint256 agentId) {
        agentId = _mintAgent(agentURI);

        for (uint256 i = 0; i < metadata.length; i++) {
            bytes32 keyHash = keccak256(bytes(metadata[i].metadataKey));
            _metadata[agentId][keyHash] = metadata[i].metadataValue;

            emit MetadataSet(agentId, metadata[i].metadataKey, metadata[i].metadataKey, metadata[i].metadataValue);
        }
    }

    /// @inheritdoc IERC8004Identity
    function register(
        string calldata agentURI
    ) external returns (uint256 agentId) {
        agentId = _mintAgent(agentURI);
    }

    /// @inheritdoc IERC8004Identity
    function register() external returns (uint256 agentId) {
        agentId = _mintAgent("");
    }

    /// @inheritdoc IERC8004Identity
    function setAgentURI(uint256 agentId, string calldata newURI) external onlyAgentOwner(agentId) {
        agentURIs[agentId] = newURI;
        emit URIUpdated(agentId, newURI, msg.sender);
    }

    /// @inheritdoc IERC8004Identity
    function getMetadata(uint256 agentId, string memory metadataKey) external view returns (bytes memory) {
        if (ownerOf[agentId] == address(0)) revert AgentDoesNotExist(agentId);
        bytes32 keyHash = keccak256(bytes(metadataKey));
        return _metadata[agentId][keyHash];
    }

    /// @inheritdoc IERC8004Identity
    function setMetadata(
        uint256 agentId,
        string memory metadataKey,
        bytes memory metadataValue
    ) external onlyAgentOwner(agentId) {
        bytes32 keyHash = keccak256(bytes(metadataKey));
        _metadata[agentId][keyHash] = metadataValue;

        emit MetadataSet(agentId, metadataKey, metadataKey, metadataValue);
    }

    /// @inheritdoc IERC8004Identity
    function setAgentWallet(
        uint256 agentId,
        address newWallet,
        uint256 deadline,
        bytes calldata signature
    ) external onlyAgentOwner(agentId) {
        if (block.timestamp > deadline) revert DeadlineExpired(deadline);
        if (signature.length < 65) revert InvalidSignatureLength();

        _agentWallets[agentId] = newWallet;
    }

    /// @inheritdoc IERC8004Identity
    function getAgentWallet(uint256 agentId) external view returns (address) {
        if (ownerOf[agentId] == address(0)) revert AgentDoesNotExist(agentId);
        return _agentWallets[agentId];
    }

    /// @inheritdoc IERC8004Identity
    function unsetAgentWallet(
        uint256 agentId
    ) external onlyAgentOwner(agentId) {
        _agentWallets[agentId] = address(0);
    }

    /// @notice Returns the next agent ID that will be assigned.
    function nextAgentId() external view returns (uint256) {
        return _nextAgentId;
    }

    /// @dev Internal helper to mint a new agent NFT (mock).
    function _mintAgent(string memory agentURI) internal returns (uint256 agentId) {
        agentId = _nextAgentId++;
        ownerOf[agentId] = msg.sender;
        agentURIs[agentId] = agentURI;

        emit Registered(agentId, agentURI, msg.sender);
    }
}
