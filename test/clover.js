const Clover = artifacts.require("./Clover.sol");

contract("Clover", accounts => {
  it("Anyone should be able to mint", async () => {
    const cloverInstance = await Clover.deployed();
    //need to set allow
    await cloverInstance.setAllow({ from: accounts[0] });
    // attempt to have each one mint some
    var i;
    for(i=0; i < accounts.length; i++){
      await cloverInstance.mint(accounts[i], 123456, { from: accounts[i] });
    }
    // Get stored value
    for(i=0; i < accounts.length; i++){
      let mintedValue = await cloverInstance.balanceOf.call(accounts[i]);
      assert.equal(mintedValue, 123456, "Balance not equal to minted value")
    }
    var totalSupply = await cloverInstance.totalSupply.call();
    assert.equal(totalSupply, 123456*accounts.length, "Total value not equal to minute value");
  });
  it("Holders can transfer CLV", async () =>{
    const cloverInstance = await Clover.deployed();
    //get first 3 account balances
    var bal0 = await cloverInstance.balanceOf.call(accounts[0]);
    var bal1 = await cloverInstance.balanceOf.call(accounts[1]);
    var bal2 = await cloverInstance.balanceOf.call(accounts[2]);
    bal0 = bal0.toNumber();
    bal1 = bal1.toNumber();
    bal2 = bal2.toNumber();
    console.log("balances");
    console.log(bal0 + " "+bal1+ " "+bal2);
    var total = bal0+bal1+bal2;
    //send all of user 1 and user 3 to user 2
    await cloverInstance.transfer(accounts[1], bal0, {from: accounts[0]}); 
    await cloverInstance.transfer(accounts[1], bal2, {from: accounts[2]}); 


    bal0 = await cloverInstance.balanceOf.call(accounts[0]);
    bal1 = await cloverInstance.balanceOf.call(accounts[1]);
    bal2 = await cloverInstance.balanceOf.call(accounts[2]);
    bal0 = bal0.toNumber();
    bal1 = bal1.toNumber();
    bal2 = bal2.toNumber();
    console.log("balances after");
    console.log(bal0 + " "+bal1+ " "+bal2);

    assert.equal(bal0, 0, "Account 0 does not have 0 CLV");
    assert.equal(bal1, total, "Account 1 does not have all the CLV it should");
    assert.equal(bal2, 0, "Account 2 does not have 0 CLV");
  });
});
