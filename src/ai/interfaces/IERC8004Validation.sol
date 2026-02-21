// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IERC8004Validation
/// @notice ERC-8004 Validation Registry interface for managing validation requests and responses for AI agents.
/// @dev Validators submit requests referencing an agent and a content hash; they then record responses on-chain.
///      Each request is uniquely identified by its `requestHash`.
interface IERC8004Validation {
    /// @notice Emitted when a new validation request is created.
    /// @param validatorAddress The address of the validator submitting the request.
    /// @param agentId The agent targeted by the validation request.
    /// @param requestURI An off-chain URI containing the full request payload.
    /// @param requestHash A unique hash identifying this validation request.
    event ValidationRequest(
        address indexed validatorAddress,
        uint256 indexed agentId,
        string requestURI,
        bytes32 indexed requestHash
    );

    /// @notice Emitted when a validator records a response to a validation request.
    /// @param validatorAddress The address of the validator recording the response.
    /// @param agentId The agent the validation pertains to.
    /// @param requestHash The hash of the original validation request.
    /// @param response A numeric response code (interpretation is application-specific).
    /// @param responseURI An off-chain URI containing extended response details.
    /// @param responseHash A content hash for verifying the off-chain response data.
    /// @param tag A categorical tag for the validation response.
    event ValidationResponse(
        address indexed validatorAddress,
        uint256 indexed agentId,
        bytes32 indexed requestHash,
        uint8 response,
        string responseURI,
        bytes32 responseHash,
        string tag
    );

    /// @notice Returns the address of the Identity Registry this Validation Registry is linked to.
    /// @return identityRegistry The address of the IERC8004Identity contract.
    function getIdentityRegistry() external view returns (address identityRegistry);

    /// @notice Submit a new validation request for an agent.
    /// @param validatorAddress The address of the validator submitting the request.
    /// @param agentId The agent targeted by the validation.
    /// @param requestURI An off-chain URI containing the full request payload.
    /// @param requestHash A unique hash identifying this validation request.
    function validationRequest(
        address validatorAddress,
        uint256 agentId,
        string calldata requestURI,
        bytes32 requestHash
    ) external;

    /// @notice Record a response to an existing validation request.
    /// @param requestHash The hash of the original validation request.
    /// @param response A numeric response code.
    /// @param responseURI An off-chain URI containing extended response details.
    /// @param responseHash A content hash for verifying the off-chain response data.
    /// @param tag A categorical tag for the validation response.
    function validationResponse(
        bytes32 requestHash,
        uint8 response,
        string calldata responseURI,
        bytes32 responseHash,
        string calldata tag
    ) external;

    /// @notice Retrieve the current status of a validation request.
    /// @param requestHash The hash of the validation request to query.
    /// @return validatorAddress The validator who submitted the request.
    /// @return agentId The agent the validation pertains to.
    /// @return response The numeric response code (0 if not yet responded).
    /// @return responseHash The content hash of the response data.
    /// @return tag The categorical tag from the response.
    /// @return lastUpdate The block timestamp of the most recent update.
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
        );

    /// @notice Compute an aggregate summary of validations for an agent.
    /// @param agentId The agent to summarise.
    /// @param validatorAddresses Filter to only include validations from these validators (empty = all).
    /// @param tag Filter by categorical tag (empty string = no filter).
    /// @return count The number of matching validation responses.
    /// @return averageResponse The average numeric response across matching entries.
    function getSummary(
        uint256 agentId,
        address[] calldata validatorAddresses,
        string calldata tag
    ) external view returns (uint64 count, uint8 averageResponse);

    /// @notice Get all validation request hashes associated with an agent.
    /// @param agentId The agent to query.
    /// @return requestHashes An array of request hashes for the agent.
    function getAgentValidations(uint256 agentId) external view returns (bytes32[] memory requestHashes);

    /// @notice Get all validation request hashes submitted by a specific validator.
    /// @param validatorAddress The validator address to query.
    /// @return requestHashes An array of request hashes from the validator.
    function getValidatorRequests(address validatorAddress) external view returns (bytes32[] memory requestHashes);
}
