const CLV= artifacts.require("./Clover.sol");
const RandomWell = artifacts.require("./RandomWell.sol");

module.exports = function(deployer) {
  deployer.deploy(RandomWell, CLV.address);
};
