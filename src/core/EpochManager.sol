// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {RoleManager} from "../access/RoleManager.sol";
import {AreaRegistry} from "../areas/AreaRegistry.sol";

contract EpochManager {
    enum EpochState {
        Scheduled,
        Active,
        Closed,
        Finalized
    }

    struct Epoch {
        uint256 id;
        string name;
        string location;
        AreaRegistry.AreaType area;
        uint64 startTime;
        uint64 endTime;
        EpochState state;
        address creator;
        uint32 participantCount;
        uint32 maxParticipants;
    }

    RoleManager public immutable ROLE_MANAGER;
    AreaRegistry public immutable AREA_REGISTRY;

    address public presenceRegistry;

    uint256 public epochCount;
    mapping(uint256 => Epoch) public epochs;

    event EpochCreated(
        uint256 indexed epochId, string name, AreaRegistry.AreaType indexed area, uint64 startTime, uint64 endTime
    );
    event EpochStateChanged(uint256 indexed epochId, EpochState oldState, EpochState newState);

    error Unauthorized();
    error InvalidTimeRange();
    error InvalidMaxParticipants();
    error AreaNotActive();
    error InvalidStateTransition(EpochState current, EpochState target);
    error EpochNotFound();
    error OnlyPresenceRegistry();

    modifier onlyEpochCreator() {
        _checkEpochCreator();
        _;
    }

    modifier onlyAdminOrCreator(
        uint256 epochId
    ) {
        _checkAdminOrCreator(epochId);
        _;
    }

    constructor(
        address _roleManager,
        address _areaRegistry
    ) {
        ROLE_MANAGER = RoleManager(_roleManager);
        AREA_REGISTRY = AreaRegistry(_areaRegistry);
    }

    function createEpoch(
        string calldata name,
        string calldata location,
        AreaRegistry.AreaType area,
        uint64 startTime,
        uint64 endTime,
        uint32 maxParticipants
    ) external onlyEpochCreator returns (uint256) {
        if (endTime <= startTime) revert InvalidTimeRange();
        if (maxParticipants == 0) revert InvalidMaxParticipants();
        if (!AREA_REGISTRY.isAreaActive(area)) revert AreaNotActive();

        uint256 epochId = ++epochCount;

        epochs[epochId] = Epoch({
            id: epochId,
            name: name,
            location: location,
            area: area,
            startTime: startTime,
            endTime: endTime,
            state: EpochState.Scheduled,
            creator: msg.sender,
            participantCount: 0,
            maxParticipants: maxParticipants
        });

        emit EpochCreated(epochId, name, area, startTime, endTime);
        return epochId;
    }

    function activateEpoch(
        uint256 epochId
    ) external onlyAdminOrCreator(epochId) {
        Epoch storage epoch = _getEpoch(epochId);
        if (epoch.state != EpochState.Scheduled) {
            revert InvalidStateTransition(epoch.state, EpochState.Active);
        }

        EpochState oldState = epoch.state;
        epoch.state = EpochState.Active;
        emit EpochStateChanged(epochId, oldState, EpochState.Active);
    }

    function closeEpoch(
        uint256 epochId
    ) external onlyAdminOrCreator(epochId) {
        Epoch storage epoch = _getEpoch(epochId);
        if (epoch.state != EpochState.Active) {
            revert InvalidStateTransition(epoch.state, EpochState.Closed);
        }

        EpochState oldState = epoch.state;
        epoch.state = EpochState.Closed;
        emit EpochStateChanged(epochId, oldState, EpochState.Closed);
    }

    function finalizeEpoch(
        uint256 epochId
    ) external onlyAdminOrCreator(epochId) {
        Epoch storage epoch = _getEpoch(epochId);
        if (epoch.state != EpochState.Closed) {
            revert InvalidStateTransition(epoch.state, EpochState.Finalized);
        }

        EpochState oldState = epoch.state;
        epoch.state = EpochState.Finalized;
        emit EpochStateChanged(epochId, oldState, EpochState.Finalized);
    }

    function setPresenceRegistry(
        address _presenceRegistry
    ) external {
        if (!ROLE_MANAGER.hasRole(ROLE_MANAGER.DEFAULT_ADMIN_ROLE(), msg.sender)) revert Unauthorized();
        presenceRegistry = _presenceRegistry;
    }

    function incrementParticipantCount(
        uint256 epochId
    ) external {
        if (msg.sender != presenceRegistry) revert OnlyPresenceRegistry();
        Epoch storage epoch = _getEpoch(epochId);
        epoch.participantCount++;
    }

    function getEpoch(
        uint256 epochId
    ) external view returns (Epoch memory) {
        return _getEpoch(epochId);
    }

    function getEpochState(
        uint256 epochId
    ) external view returns (EpochState) {
        return _getEpoch(epochId).state;
    }

    function getEpochArea(
        uint256 epochId
    ) external view returns (AreaRegistry.AreaType) {
        return _getEpoch(epochId).area;
    }

    function getEpochEndTime(
        uint256 epochId
    ) external view returns (uint64) {
        return _getEpoch(epochId).endTime;
    }

    function isEpochActive(
        uint256 epochId
    ) external view returns (bool) {
        if (epochId == 0 || epochId > epochCount) return false;
        return epochs[epochId].state == EpochState.Active;
    }

    function _getEpoch(
        uint256 epochId
    ) internal view returns (Epoch storage) {
        if (epochId == 0 || epochId > epochCount) revert EpochNotFound();
        return epochs[epochId];
    }

    function _checkEpochCreator() internal view {
        if (!ROLE_MANAGER.hasRole(ROLE_MANAGER.EPOCH_CREATOR_ROLE(), msg.sender)) {
            revert Unauthorized();
        }
    }

    function _checkAdminOrCreator(
        uint256 epochId
    ) internal view {
        bool isAdmin = ROLE_MANAGER.hasRole(ROLE_MANAGER.DEFAULT_ADMIN_ROLE(), msg.sender);
        bool isCreator = epochId > 0 && epochId <= epochCount && epochs[epochId].creator == msg.sender;
        if (!isAdmin && !isCreator) revert Unauthorized();
    }
}
