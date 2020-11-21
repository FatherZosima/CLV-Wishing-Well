import React, { Component } from "react";
import { Button, InputNumber, version } from "antd";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import CLVContract from "./contracts/Clover.json";
import CLV2DContract from "./contracts/CLV2D.json";
import getWeb3 from "./getWeb3";

import "antd/dist/antd.css";
import "./App.css";

class App extends Component {
  state = { storageValue: 0, clvBal: 0, ethBal: 0, 
    c2dBuyPrice: 0, c2dSellPrice:0, c2dBal: 0,
    web3: null, accounts: null, 
    contract: null, CLVcontract: null};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      
      const SSdeployedNetwork = SimpleStorageContract.networks[networkId];
      const SSinstance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        SSdeployedNetwork && SSdeployedNetwork.address,
      );
      const CLVdeployedNetwork = CLVContract.networks[networkId];
      const CLVinstance = new web3.eth.Contract(
        CLVContract.abi,
        CLVdeployedNetwork && CLVdeployedNetwork.address,
      );
      const CLV2DdeployedNetwork = CLV2DContract.networks[networkId];
      const CLV2Dinstance = new web3.eth.Contract(
        CLV2DContract.abi,
        CLV2DdeployedNetwork && CLV2DdeployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, 
        contract: SSinstance, 
        CLVcontract: CLVinstance,
        CLV2Dcontract: CLV2Dinstance
      });
      this.getAccountETHBal();
      this.fetchC2DInfo();
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  getAccountETHBal = async() =>{
    this.state.web3.eth.getBalance(this.state.accounts[0], (err, balance) => {
      this.state.ethBal = this.state.web3.utils.fromWei(balance, "ether") + " ETH"
    });
    console.log("ETHBAL: "+this.state.ethBal);
  };

  runExample = async () => {
    const { accounts, contract } = this.state;
    // Stores a given value, 5 by default.
    await contract.methods.set(5).send({ from: accounts[0] });
    console.log(accounts[0]);
    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ storageValue: response });
  };


  mintCLV = async () => {
    const { accounts, CLVcontract } = this.state;
    //console.log(CLVcontract);
    var amount = this.state.CLVtoBuy*1000000;//must multiply bc CLV has 6 decimals
    //first add me to minters
    //await CLVcontract.methods.addMinter(accounts[0]).send({from: accounts[0]});
    // Stores a given value, 5 by default.
    //await CLVcontract.methods.balanceOf(accounts[0]).class-extends
    await CLVcontract.methods.mint(accounts[0], amount).send({ from: accounts[0] });
    // Get the value from the contract to prove it worked.
    const response = await CLVcontract.methods.balanceOf(accounts[0]).call();
    // Update state with the result.
    this.setState({
      clvBal: this.state.web3.utils.fromWei(response, "mwei"),
    });
  };

  fetchC2DInfo = async () => {
    const{accounts, CLV2Dcontract} = this.state;
    console.log(CLV2Dcontract);
    const response = await CLV2Dcontract.methods.allInfoFor(accounts[0]).call();  
    console.log(response);
    this.setState({
      clvBal: this.state.web3.utils.fromWei(response.userCLV, "mwei"),
      userAllowance: this.state.web3.utils.fromWei(response.userAllowance, "mwei"),
      c2dBal: this.state.web3.utils.fromWei(response.userBalance, "ether"),
      c2dBuyPrice: this.state.web3.utils.fromWei(response.buyPrice, "mwei"),
      c2dSellPrice: this.state.web3.utils.fromWei(response.sellPrice, "mwei"),
     });
  }

  buyC2D = async () => {
    const{accounts, CLV2Dcontract} = this.state;
    //await CLV2Dcontract.methods.buy<F3>(accounts[0], 50000).send({ from: accounts[0] });
  }



  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <p>
          If your contracts compiled and migrated successfully, below will show
          a stored value of 5 (by default).
        </p>
        <div id="CLVstation">
          <h2>CLV station</h2>
          
          <p>You currently own: {this.state.clvBal}CLV</p>
          <p>You currently own: {this.state.ethBal}</p>

          <InputNumber min={0} step={0.1} placeholder="500" onChange={(value) => {
            this.setState({CLVtoBuy:value});
          }} />
          <Button type="primary" onClick={this.mintCLV}>Mint and Give Me CLV</Button>
        </div>


        <div id="C2Dstation">
          <h2>C2D station</h2>
          <h3>Buy: {this.state.c2dBuyPrice} CLV per C2D</h3>
          <h3>Sell: {this.state.c2dSellPrice} CLV per C2D</h3>
          <h3>C2D owned: {this.state.c2dBal}</h3>
          <h2>Swap CLV to C2D: 
            <InputNumber min={0} max={1000000} step={0.1} placeholder={this.state.clvBal} onChange={(value) => {
              this.setState({C2DtoBuy:value});
            }} />
            <Button type="primary" onClick={this.buyC2D}>Swap</Button>
          </h2>
        </div>
      </div>
    );
  }
}

export default App;
