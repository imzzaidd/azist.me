// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {RoleManager} from "../src/access/RoleManager.sol";
import {AzistToken} from "../src/token/AzistToken.sol";
import {AreaRegistry} from "../src/areas/AreaRegistry.sol";
import {EpochManager} from "../src/core/EpochManager.sol";
import {PresenceRegistry} from "../src/core/PresenceRegistry.sol";
import {LevelSystem} from "../src/gamification/LevelSystem.sol";
import {StreakTracker} from "../src/gamification/StreakTracker.sol";
import {BadgeManager} from "../src/gamification/BadgeManager.sol";
import {RewardDistributor} from "../src/core/RewardDistributor.sol";

contract Deploy is Script {
    function run() external {
        address deployer = msg.sender;

        vm.startBroadcast();

        // 1. Deploy access control
        RoleManager roleManager = new RoleManager(deployer);
        console.log("RoleManager:", address(roleManager));

        // 2. Deploy token
        AzistToken token = new AzistToken(address(roleManager));
        console.log("AzistToken:", address(token));

        // 3. Deploy area registry with default configs
        AreaRegistry areaRegistry = new AreaRegistry(address(roleManager));
        console.log("AreaRegistry:", address(areaRegistry));

        // 4. Deploy epoch manager
        EpochManager epochManager = new EpochManager(address(roleManager), address(areaRegistry));
        console.log("EpochManager:", address(epochManager));

        // 5. Deploy presence registry
        PresenceRegistry presenceRegistry =
            new PresenceRegistry(address(roleManager), address(epochManager), address(areaRegistry));
        console.log("PresenceRegistry:", address(presenceRegistry));

        // 6. Deploy gamification
        LevelSystem levelSystem = new LevelSystem(address(roleManager));
        console.log("LevelSystem:", address(levelSystem));

        StreakTracker streakTracker = new StreakTracker();
        console.log("StreakTracker:", address(streakTracker));

        BadgeManager badgeManager = new BadgeManager(address(roleManager));
        console.log("BadgeManager:", address(badgeManager));

        // 7. Deploy reward distributor (wires everything together)
        RewardDistributor distributor = new RewardDistributor(
            address(roleManager),
            address(token),
            address(epochManager),
            address(presenceRegistry),
            address(areaRegistry),
            address(levelSystem),
            address(streakTracker),
            address(badgeManager)
        );
        console.log("RewardDistributor:", address(distributor));

        // 8. Grant roles
        roleManager.grantRewardMinter(address(distributor));
        roleManager.grantEpochCreator(deployer);
        roleManager.grantValidator(deployer);

        console.log("Deployment complete. Deployer granted EpochCreator and Validator roles.");

        vm.stopBroadcast();
    }
}
