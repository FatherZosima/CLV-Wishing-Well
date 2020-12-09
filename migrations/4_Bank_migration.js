const CLV= artifacts.require("./Clover.sol");
const Bank = artifacts.require("./Bank.sol");

module.exports = function(deployer) {
  deployer.deploy(Bank, CLV.address);
};
