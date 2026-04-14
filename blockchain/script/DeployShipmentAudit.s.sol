// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ShipmentAudit.sol";

contract DeployShipmentAudit is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        ShipmentAudit audit = new ShipmentAudit();
        vm.stopBroadcast();

        console.log("ShipmentAudit deployed at:", address(audit));
    }
}
