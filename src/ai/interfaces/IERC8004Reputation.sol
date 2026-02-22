// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IERC8004Reputation
/// @notice ERC-8004 Reputation Registry interface for tracking feedback signals on AI agents.
/// @dev Each feedback entry is scoped by (agentId, clientAddress, feedbackIndex).
///      Tags allow categorical filtering when computing reputation summaries.
interface IERC8004Reputation {
    /// @notice Emitted when a new feedback entry is recorded for an agent.
    /// @param agentId The agent receiving feedback.
    /// @param clientAddress The address that submitted the feedback.
    /// @param feedbackIndex The sequential index of this feedback for the (agentId, clientAddress) pair.
    /// @param value The signed numeric feedback value (e.g. rating).
    /// @param valueDecimals The number of decimal places in `value`.
    /// @param indexedTag1 The keccak256-indexed primary tag (for efficient log filtering).
    /// @param tag1 The human-readable primary tag.
    /// @param tag2 The human-readable secondary tag.
    /// @param endpoint The service endpoint the feedback pertains to.
    /// @param feedbackURI An off-chain URI with extended feedback details.
    /// @param feedbackHash A content hash for verifying the off-chain feedback data.
    event NewFeedback(
        uint256 indexed agentId,
        address indexed clientAddress,
        uint64 feedbackIndex,
        int128 value,
        uint8 valueDecimals,
        string indexed indexedTag1,
        string tag1,
        string tag2,
        string endpoint,
        string feedbackURI,
        bytes32 feedbackHash
    );

    /// @notice Emitted when a previously submitted feedback entry is revoked.
    /// @param agentId The agent whose feedback was revoked.
    /// @param clientAddress The address that originally submitted the feedback.
    /// @param feedbackIndex The index of the revoked feedback entry.
    event FeedbackRevoked(uint256 indexed agentId, address indexed clientAddress, uint64 indexed feedbackIndex);

    /// @notice Returns the address of the Identity Registry this Reputation Registry is linked to.
    /// @return identityRegistry The address of the IERC8004Identity contract.
    function getIdentityRegistry() external view returns (address identityRegistry);

    /// @notice Submit a feedback entry for an agent.
    /// @param agentId The agent to provide feedback on.
    /// @param value The signed numeric feedback value.
    /// @param valueDecimals The number of decimal places in `value`.
    /// @param tag1 The primary categorical tag.
    /// @param tag2 The secondary categorical tag.
    /// @param endpoint The service endpoint the feedback pertains to.
    /// @param feedbackURI An off-chain URI with extended feedback details.
    /// @param feedbackHash A content hash for verifying the off-chain feedback data.
    function giveFeedback(
        uint256 agentId,
        int128 value,
        uint8 valueDecimals,
        string calldata tag1,
        string calldata tag2,
        string calldata endpoint,
        string calldata feedbackURI,
        bytes32 feedbackHash
    ) external;

    /// @notice Revoke a previously submitted feedback entry.
    /// @param agentId The agent whose feedback should be revoked.
    /// @param feedbackIndex The index of the feedback entry to revoke.
    function revokeFeedback(uint256 agentId, uint64 feedbackIndex) external;

    /// @notice Compute an aggregate reputation summary for an agent.
    /// @param agentId The agent to summarise.
    /// @param clientAddresses Filter to only include feedback from these addresses (empty = all).
    /// @param tag1 Filter by primary tag (empty string = no filter).
    /// @param tag2 Filter by secondary tag (empty string = no filter).
    /// @return count The number of matching (non-revoked) feedback entries.
    /// @return summaryValue The aggregate value across matching entries.
    /// @return summaryValueDecimals The decimal precision of `summaryValue`.
    function getSummary(
        uint256 agentId,
        address[] calldata clientAddresses,
        string calldata tag1,
        string calldata tag2
    ) external view returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals);

    /// @notice Read a specific feedback entry.
    /// @param agentId The agent the feedback was submitted for.
    /// @param clientAddress The address that submitted the feedback.
    /// @param feedbackIndex The index of the feedback entry.
    /// @return value The signed numeric feedback value.
    /// @return valueDecimals The decimal precision of the value.
    /// @return tag1 The primary tag.
    /// @return tag2 The secondary tag.
    /// @return isRevoked Whether the feedback has been revoked.
    function readFeedback(
        uint256 agentId,
        address clientAddress,
        uint64 feedbackIndex
    ) external view returns (int128 value, uint8 valueDecimals, string memory tag1, string memory tag2, bool isRevoked);

    /// @notice Get the list of addresses that have submitted feedback for an agent.
    /// @param agentId The agent to query.
    /// @return An array of client addresses.
    function getClients(uint256 agentId) external view returns (address[] memory);

    /// @notice Get the latest feedback index for a given (agentId, clientAddress) pair.
    /// @param agentId The agent to query.
    /// @param clientAddress The client address to query.
    /// @return The most recent feedback index (0 if no feedback exists).
    function getLastIndex(uint256 agentId, address clientAddress) external view returns (uint64);
}
