// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC8004Reputation} from "../../src/ai/interfaces/IERC8004Reputation.sol";

/// @title MockReputationRegistry
/// @notice Minimal mock implementation of IERC8004Reputation for testing purposes.
/// @dev Stores feedback entries per (agentId, clientAddress, feedbackIndex) and computes simple summaries.
contract MockReputationRegistry is IERC8004Reputation {
    struct FeedbackEntry {
        int128 value;
        uint8 valueDecimals;
        string tag1;
        string tag2;
        string endpoint;
        string feedbackURI;
        bytes32 feedbackHash;
        bool isRevoked;
    }

    address public immutable identityRegistry;

    // agentId => clientAddress => feedbackIndex => FeedbackEntry
    mapping(uint256 => mapping(address => mapping(uint64 => FeedbackEntry))) private _feedback;
    // agentId => clientAddress => next feedback index (0-based, count of entries)
    mapping(uint256 => mapping(address => uint64)) private _lastIndex;
    // agentId => list of unique client addresses
    mapping(uint256 => address[]) private _clients;
    // agentId => clientAddress => whether client is already tracked
    mapping(uint256 => mapping(address => bool)) private _isClient;

    error FeedbackNotFound(uint256 agentId, address clientAddress, uint64 feedbackIndex);
    error NotFeedbackAuthor(uint256 agentId, address caller);
    error DecimalMismatch(uint256 agentId, uint8 expected, uint8 actual);

    constructor(
        address _identityRegistry
    ) {
        identityRegistry = _identityRegistry;
    }

    /// @inheritdoc IERC8004Reputation
    function getIdentityRegistry() external view returns (address) {
        return identityRegistry;
    }

    /// @inheritdoc IERC8004Reputation
    function giveFeedback(
        uint256 agentId,
        int128 value,
        uint8 valueDecimals,
        string calldata tag1,
        string calldata tag2,
        string calldata endpoint,
        string calldata feedbackURI,
        bytes32 feedbackHash
    ) external {
        _trackClient(agentId, msg.sender);

        uint64 feedbackIndex = _lastIndex[agentId][msg.sender];
        _lastIndex[agentId][msg.sender] = feedbackIndex + 1;

        _storeFeedback(agentId, msg.sender, feedbackIndex, value, valueDecimals, tag1, tag2, endpoint, feedbackURI, feedbackHash);
        _emitNewFeedback(agentId, feedbackIndex, value, valueDecimals, tag1, tag2, endpoint, feedbackURI, feedbackHash);
    }

    /// @inheritdoc IERC8004Reputation
    function revokeFeedback(uint256 agentId, uint64 feedbackIndex) external {
        if (feedbackIndex >= _lastIndex[agentId][msg.sender]) {
            revert FeedbackNotFound(agentId, msg.sender, feedbackIndex);
        }

        _feedback[agentId][msg.sender][feedbackIndex].isRevoked = true;

        emit FeedbackRevoked(agentId, msg.sender, feedbackIndex);
    }

    /// @inheritdoc IERC8004Reputation
    function getSummary(
        uint256 agentId,
        address[] calldata clientAddresses,
        string calldata tag1,
        string calldata tag2
    ) external view returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals) {
        bytes32 tag1Hash = _hashIfNonEmpty(tag1);
        bytes32 tag2Hash = _hashIfNonEmpty(tag2);

        if (clientAddresses.length > 0) {
            return _computeSummaryForClients(agentId, clientAddresses, tag1Hash, tag2Hash);
        }
        return _computeSummaryAllClients(agentId, tag1Hash, tag2Hash);
    }

    /// @inheritdoc IERC8004Reputation
    function readFeedback(
        uint256 agentId,
        address clientAddress,
        uint64 feedbackIndex
    )
        external
        view
        returns (int128 value, uint8 valueDecimals, string memory tag1, string memory tag2, bool isRevoked)
    {
        if (feedbackIndex >= _lastIndex[agentId][clientAddress]) {
            revert FeedbackNotFound(agentId, clientAddress, feedbackIndex);
        }

        FeedbackEntry storage entry = _feedback[agentId][clientAddress][feedbackIndex];
        return (entry.value, entry.valueDecimals, entry.tag1, entry.tag2, entry.isRevoked);
    }

    /// @inheritdoc IERC8004Reputation
    function getClients(uint256 agentId) external view returns (address[] memory) {
        return _clients[agentId];
    }

    /// @inheritdoc IERC8004Reputation
    function getLastIndex(uint256 agentId, address clientAddress) external view returns (uint64) {
        return _lastIndex[agentId][clientAddress];
    }

    // -----------------------------------------------------------------------
    //  Internal helpers (split out to avoid stack-too-deep)
    // -----------------------------------------------------------------------

    function _trackClient(uint256 agentId, address client) internal {
        if (!_isClient[agentId][client]) {
            _clients[agentId].push(client);
            _isClient[agentId][client] = true;
        }
    }

    function _storeFeedback(
        uint256 agentId,
        address client,
        uint64 feedbackIndex,
        int128 value,
        uint8 valueDecimals,
        string calldata tag1,
        string calldata tag2,
        string calldata endpoint,
        string calldata feedbackURI,
        bytes32 feedbackHash
    ) internal {
        FeedbackEntry storage entry = _feedback[agentId][client][feedbackIndex];
        entry.value = value;
        entry.valueDecimals = valueDecimals;
        entry.tag1 = tag1;
        entry.tag2 = tag2;
        entry.endpoint = endpoint;
        entry.feedbackURI = feedbackURI;
        entry.feedbackHash = feedbackHash;
    }

    function _emitNewFeedback(
        uint256 agentId,
        uint64 feedbackIndex,
        int128 value,
        uint8 valueDecimals,
        string calldata tag1,
        string calldata tag2,
        string calldata endpoint,
        string calldata feedbackURI,
        bytes32 feedbackHash
    ) internal {
        emit NewFeedback(
            agentId,
            msg.sender,
            feedbackIndex,
            value,
            valueDecimals,
            tag1,
            tag1,
            tag2,
            endpoint,
            feedbackURI,
            feedbackHash
        );
    }

    function _hashIfNonEmpty(string calldata s) internal pure returns (bytes32) {
        if (bytes(s).length > 0) return keccak256(bytes(s));
        return bytes32(0);
    }

    function _computeSummaryForClients(
        uint256 agentId,
        address[] calldata clients,
        bytes32 tag1Hash,
        bytes32 tag2Hash
    ) internal view returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals) {
        for (uint256 i = 0; i < clients.length; i++) {
            (uint64 c, int128 v, uint8 d) = _aggregateClient(agentId, clients[i], tag1Hash, tag2Hash);
            count += c;
            summaryValue += v;
            if (c > 0) summaryValueDecimals = d;
        }
    }

    function _computeSummaryAllClients(
        uint256 agentId,
        bytes32 tag1Hash,
        bytes32 tag2Hash
    ) internal view returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals) {
        address[] storage clients = _clients[agentId];
        for (uint256 i = 0; i < clients.length; i++) {
            (uint64 c, int128 v, uint8 d) = _aggregateClient(agentId, clients[i], tag1Hash, tag2Hash);
            count += c;
            summaryValue += v;
            if (c > 0) summaryValueDecimals = d;
        }
    }

    function _aggregateClient(
        uint256 agentId,
        address client,
        bytes32 tag1Hash,
        bytes32 tag2Hash
    ) internal view returns (uint64 count, int128 totalValue, uint8 decimals) {
        bool decimalsSet = false;
        uint64 lastIdx = _lastIndex[agentId][client];
        for (uint64 j = 0; j < lastIdx; j++) {
            FeedbackEntry storage entry = _feedback[agentId][client][j];
            if (entry.isRevoked) continue;
            if (tag1Hash != bytes32(0) && keccak256(bytes(entry.tag1)) != tag1Hash) continue;
            if (tag2Hash != bytes32(0) && keccak256(bytes(entry.tag2)) != tag2Hash) continue;

            if (!decimalsSet) {
                decimals = entry.valueDecimals;
                decimalsSet = true;
            } else if (entry.valueDecimals != decimals) {
                revert DecimalMismatch(agentId, decimals, entry.valueDecimals);
            }

            totalValue += entry.value;
            count++;
        }
    }
}
