// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IERC8004Identity
/// @notice ERC-8004 Identity Registry interface for AI agent registration and management.
/// @dev Agents register via ERC-721-based minting and receive a unique agentId (token ID).
///      Owners can attach metadata, set an agent URI, and designate an operational wallet.
interface IERC8004Identity {
    /// @notice A key-value pair used when setting multiple metadata entries in a single call.
    /// @param metadataKey  The human-readable key for the metadata entry.
    /// @param metadataValue The ABI-encoded value for the metadata entry.
    struct MetadataEntry {
        string metadataKey;
        bytes metadataValue;
    }

    /// @notice Emitted when a new agent is registered and an NFT is minted.
    /// @param agentId The newly assigned agent token ID.
    /// @param agentURI The URI pointing to the agent's off-chain descriptor.
    /// @param owner The address that owns the newly minted agent NFT.
    event Registered(uint256 indexed agentId, string agentURI, address indexed owner);

    /// @notice Emitted when an agent's URI is updated.
    /// @param agentId The agent whose URI was changed.
    /// @param newURI The new URI value.
    /// @param updatedBy The address that performed the update.
    event URIUpdated(uint256 indexed agentId, string newURI, address indexed updatedBy);

    /// @notice Emitted when a metadata entry is set on an agent.
    /// @param agentId The agent whose metadata was modified.
    /// @param indexedMetadataKey The keccak256-indexed metadata key (for efficient log filtering).
    /// @param metadataKey The human-readable metadata key.
    /// @param metadataValue The ABI-encoded metadata value.
    event MetadataSet(
        uint256 indexed agentId,
        string indexed indexedMetadataKey,
        string metadataKey,
        bytes metadataValue
    );

    /// @notice Register a new agent with a URI and initial metadata entries.
    /// @param agentURI The URI pointing to the agent's off-chain descriptor.
    /// @param metadata An array of key-value metadata entries to set on creation.
    /// @return agentId The newly assigned agent token ID.
    function register(string calldata agentURI, MetadataEntry[] calldata metadata) external returns (uint256 agentId);

    /// @notice Register a new agent with a URI and no initial metadata.
    /// @param agentURI The URI pointing to the agent's off-chain descriptor.
    /// @return agentId The newly assigned agent token ID.
    function register(string calldata agentURI) external returns (uint256 agentId);

    /// @notice Register a new agent with no URI and no metadata.
    /// @return agentId The newly assigned agent token ID.
    function register() external returns (uint256 agentId);

    /// @notice Update the URI of an existing agent.
    /// @param agentId The agent whose URI should be updated.
    /// @param newURI The new URI value.
    function setAgentURI(uint256 agentId, string calldata newURI) external;

    /// @notice Retrieve a metadata value for a given agent and key.
    /// @param agentId The agent to query.
    /// @param metadataKey The metadata key to look up.
    /// @return The ABI-encoded metadata value.
    function getMetadata(uint256 agentId, string memory metadataKey) external view returns (bytes memory);

    /// @notice Set a single metadata entry on an agent.
    /// @param agentId The agent to modify.
    /// @param metadataKey The metadata key.
    /// @param metadataValue The ABI-encoded metadata value.
    function setMetadata(uint256 agentId, string memory metadataKey, bytes memory metadataValue) external;

    /// @notice Assign an operational wallet to an agent using an EIP-712-style signature.
    /// @param agentId The agent to modify.
    /// @param newWallet The address of the new operational wallet.
    /// @param deadline The timestamp after which the signature is no longer valid.
    /// @param signature The EIP-712 signature authorising the wallet assignment.
    function setAgentWallet(uint256 agentId, address newWallet, uint256 deadline, bytes calldata signature) external;

    /// @notice Retrieve the operational wallet assigned to an agent.
    /// @param agentId The agent to query.
    /// @return The address of the agent's operational wallet (address(0) if unset).
    function getAgentWallet(uint256 agentId) external view returns (address);

    /// @notice Remove the operational wallet assignment from an agent.
    /// @param agentId The agent to modify.
    function unsetAgentWallet(uint256 agentId) external;
}
