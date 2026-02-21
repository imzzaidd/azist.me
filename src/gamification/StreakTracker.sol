// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract StreakTracker {
    uint16 public constant BASIS_POINTS = 10_000;

    mapping(address => uint64) public lastParticipationDay;
    mapping(address => uint32) public currentStreak;
    mapping(address => uint32) public longestStreak;

    event StreakUpdated(address indexed participant, uint32 newStreak);
    event StreakReset(address indexed participant);
    event NewLongestStreak(address indexed participant, uint32 streak);

    function recordParticipation(address participant) external {
        uint64 today = uint64(block.timestamp / 1 days);
        uint64 lastDay = lastParticipationDay[participant];

        if (lastDay == today) {
            return; // Already participated today
        }

        if (lastDay == today - 1) {
            // Consecutive day
            currentStreak[participant]++;
        } else {
            // Gap or first participation
            currentStreak[participant] = 1;
            if (lastDay != 0 && lastDay != today - 1) {
                emit StreakReset(participant);
            }
        }

        lastParticipationDay[participant] = today;

        emit StreakUpdated(participant, currentStreak[participant]);

        if (currentStreak[participant] > longestStreak[participant]) {
            longestStreak[participant] = currentStreak[participant];
            emit NewLongestStreak(participant, currentStreak[participant]);
        }
    }

    function getStreakMultiplier(address participant) external view returns (uint16) {
        uint32 streak = currentStreak[participant];

        if (streak >= 30) return 15_000; // 1.5x
        if (streak >= 14) return 13_500; // 1.35x
        if (streak >= 7) return 12_500; // 1.25x
        if (streak >= 3) return 11_000; // 1.1x
        return BASIS_POINTS; // 1.0x
    }

    function getCurrentStreak(address participant) external view returns (uint32) {
        return currentStreak[participant];
    }

    function getLongestStreak(address participant) external view returns (uint32) {
        return longestStreak[participant];
    }
}
