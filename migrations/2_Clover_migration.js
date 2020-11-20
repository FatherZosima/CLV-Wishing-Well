const CLV = artifacts.require("./Clover.sol");
const C2D = artifacts.require("./CLV2D.sol");

module.exports = function(deployer) {
  deployer.deploy(CLV).then(function() {
    return deployer.deploy(C2D, CLV.address);
  });
};

