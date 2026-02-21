// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {RoleManager} from "../access/RoleManager.sol";
import {EpochManager} from "./EpochManager.sol";
import {AreaRegistry} from "../areas/AreaRegistry.sol";

contract PresenceRegistry {
    enum PresenceState {
        None,
        Active,
        CheckedOut,
        Verified,
        Disputed
    }

    struct PresenceRecord {
        uint256 epochId;
        address participant;
        uint64 checkInTime;
        uint64 checkOutTime;
        PresenceState state;
        bool validatorVerified;
        uint64 duration;
    }

    RoleManager public immutable ROLE_MANAGER;
    EpochManager public immutable EPOCH_MANAGER;
    AreaRegistry public immutable AREA_REGISTRY;

    // epochId => participant => PresenceRecord
    mapping(uint256 => mapping(address => PresenceRecord)) public presences;
    // epochId => list of participants
    mapping(uint256 => address[]) public epochParticipants;
    // participant => total check-ins across all epochs
    mapping(address => uint256) public totalCheckIns;
    // participant => area => total duration in seconds
    mapping(address => mapping(AreaRegistry.AreaType => uint256)) public areaDuration;

    event CheckedIn(uint256 indexed epochId, address indexed participant, uint64 checkInTime);
    event CheckedOut(uint256 indexed epochId, address indexed participant, uint64 checkOutTime, uint64 duration);
    event PresenceVerified(uint256 indexed epochId, address indexed participant, address validator);
    event PresenceDisputed(uint256 indexed epochId, address indexed participant, address validator, string reason);
    event ForceCheckedOut(uint256 indexed epochId, address indexed participant, uint64 checkOutTime);

    error EpochNotActive();
    error AlreadyCheckedIn();
    error NotCheckedIn();
    error AlreadyCheckedOut();
    error Unauthorized();
    error InvalidPresenceState(PresenceState current, PresenceState expected);
    error EpochFull();

    modifier onlyValidator() {
        _checkValidator();
        _;
    }

    constructor(address _roleManager, address _epochManager, address _areaRegistry) {
        ROLE_MANAGER = RoleManager(_roleManager);
        EPOCH_MANAGER = EpochManager(_epochManager);
        AREA_REGISTRY = AreaRegistry(_areaRegistry);
    }

    function checkIn(uint256 epochId) external {
        if (!EPOCH_MANAGER.isEpochActive(epochId)) revert EpochNotActive();

        EpochManager.Epoch memory epoch = EPOCH_MANAGER.getEpoch(epochId);
        if (epoch.participantCount >= epoch.maxParticipants) revert EpochFull();

        PresenceRecord storage record = presences[epochId][msg.sender];
        if (record.state != PresenceState.None) revert AlreadyCheckedIn();

        record.epochId = epochId;
        record.participant = msg.sender;
        record.checkInTime = uint64(block.timestamp);
        record.state = PresenceState.Active;

        epochParticipants[epochId].push(msg.sender);
        totalCheckIns[msg.sender]++;
        EPOCH_MANAGER.incrementParticipantCount(epochId);

        emit CheckedIn(epochId, msg.sender, uint64(block.timestamp));
    }

    function checkOut(uint256 epochId) external {
        PresenceRecord storage record = presences[epochId][msg.sender];
        if (record.state != PresenceState.Active) revert NotCheckedIn();

        uint64 checkOutTime = uint64(block.timestamp);
        uint64 duration = checkOutTime - record.checkInTime;

        AreaRegistry.AreaType area = EPOCH_MANAGER.getEpochArea(epochId);
        uint64 maxDuration = AREA_REGISTRY.getMaxDuration(area);
        if (duration > maxDuration) {
            duration = maxDuration;
        }

        record.checkOutTime = checkOutTime;
        record.duration = duration;
        record.state = PresenceState.CheckedOut;

        areaDuration[msg.sender][area] += duration;

        emit CheckedOut(epochId, msg.sender, checkOutTime, duration);
    }

    function verifyPresence(uint256 epochId, address participant) external onlyValidator {
        PresenceRecord storage record = presences[epochId][participant];
        if (record.state != PresenceState.CheckedOut) {
            revert InvalidPresenceState(record.state, PresenceState.CheckedOut);
        }

        record.state = PresenceState.Verified;
        record.validatorVerified = true;

        emit PresenceVerified(epochId, participant, msg.sender);
    }

    function disputePresence(uint256 epochId, address participant, string calldata reason) external onlyValidator {
        PresenceRecord storage record = presences[epochId][participant];
        if (record.state != PresenceState.CheckedOut && record.state != PresenceState.Active) {
            revert InvalidPresenceState(record.state, PresenceState.CheckedOut);
        }

        // If still active, force check-out first
        if (record.state == PresenceState.Active) {
            record.checkOutTime = uint64(block.timestamp);
            record.duration = record.checkOutTime - record.checkInTime;
        }

        record.state = PresenceState.Disputed;

        emit PresenceDisputed(epochId, participant, msg.sender, reason);
    }

    function forceCheckOut(uint256 epochId, address participant) external {
        bool isValidator = ROLE_MANAGER.hasRole(ROLE_MANAGER.VALIDATOR_ROLE(), msg.sender);
        bool isAdmin = ROLE_MANAGER.hasRole(ROLE_MANAGER.DEFAULT_ADMIN_ROLE(), msg.sender);
        if (!isValidator && !isAdmin) revert Unauthorized();

        PresenceRecord storage record = presences[epochId][participant];
        if (record.state != PresenceState.Active) revert NotCheckedIn();

        uint64 checkOutTime = uint64(block.timestamp);
        uint64 duration = checkOutTime - record.checkInTime;

        AreaRegistry.AreaType area = EPOCH_MANAGER.getEpochArea(epochId);
        uint64 maxDuration = AREA_REGISTRY.getMaxDuration(area);
        if (duration > maxDuration) {
            duration = maxDuration;
        }

        record.checkOutTime = checkOutTime;
        record.duration = duration;
        record.state = PresenceState.CheckedOut;

        areaDuration[participant][area] += duration;

        emit ForceCheckedOut(epochId, participant, checkOutTime);
    }

    function getPresence(uint256 epochId, address participant) external view returns (PresenceRecord memory) {
        return presences[epochId][participant];
    }

    function getPresenceDuration(uint256 epochId, address participant) external view returns (uint64) {
        return presences[epochId][participant].duration;
    }

    function getPresenceState(uint256 epochId, address participant) external view returns (PresenceState) {
        return presences[epochId][participant].state;
    }

    function getEpochParticipants(uint256 epochId) external view returns (address[] memory) {
        return epochParticipants[epochId];
    }

    function getEpochParticipantCount(uint256 epochId) external view returns (uint256) {
        return epochParticipants[epochId].length;
    }

    function isRewardEligible(uint256 epochId, address participant) external view returns (bool) {
        PresenceState state = presences[epochId][participant].state;
        if (state != PresenceState.CheckedOut && state != PresenceState.Verified) return false;

        AreaRegistry.AreaType area = EPOCH_MANAGER.getEpochArea(epochId);
        uint64 minStay = AREA_REGISTRY.getMinStay(area);
        return presences[epochId][participant].duration >= minStay;
    }

    function _checkValidator() internal view {
        if (!ROLE_MANAGER.hasRole(ROLE_MANAGER.VALIDATOR_ROLE(), msg.sender)) {
            revert Unauthorized();
        }
    }
}
