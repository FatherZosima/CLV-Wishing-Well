//const CLV= artifacts.require("./Clover.sol");
//const C2D= artifacts.require("./CLV2D.sol");
const WishingWell = artifacts.require("./WishingWell.sol");

module.exports = function(deployer) {
  deployer.deploy(WishingWell, "0x22222C03318440305aC3e8a7820563d6A9FD777F", "0xc744dc036f42c2538d63eca6348e2066e183279e");
};
