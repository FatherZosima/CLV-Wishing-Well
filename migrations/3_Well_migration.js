const CLV= artifacts.require("./Clover.sol");
const C2D= artifacts.require("./CLV2D.sol");
const WishingWell = artifacts.require("./WishingWell.sol");

module.exports = function(deployer) {
  deployer.deploy(WishingWell, CLV.address, C2D.address);
};
