const CLV= artifacts.require("./Clover.sol");
const C2D= artifacts.require("./CLV2D.sol");
const RandomWell = artifacts.require("./RandomWell.sol");

module.exports = function(deployer) {
  deployer.deploy(RandomWell, CLV.address, C2D.address);
};
