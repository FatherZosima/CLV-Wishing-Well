import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import CLVContract from "./contracts/Clover.json";
import CLV2DContract from "./contracts/CLV2D.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { storageValue: 0, clvBAL: 0, ethBAL: 0, web3: null, accounts: null, 
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
      this.mintCLV();
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
      this.state.ethBAL = this.state.web3.utils.fromWei(balance, "ether") + " ETH"
    });
    console.log("ETHBAL: "+this.state.ethBAL);
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

    //first add me to minters
    //await CLVcontract.methods.addMinter(accounts[0]).send({from: accounts[0]});
    // Stores a given value, 5 by default.
    //await CLVcontract.methods.balanceOf(accounts[0]).class-extends
    //await CLVcontract.methods.mint(accounts[0], 50000).send({ from: accounts[0] });
    // Get the value from the contract to prove it worked.
    const response = await CLVcontract.methods.balanceOf(accounts[0]).call();
    // Update state with the result.
    this.setState({ clvBAL: response });
  };

  fetchC2DInfo = async () => {
    const{accounts, CLV2Dcontract} = this.state;
    console.log(CLV2Dcontract);
    const response = await CLV2Dcontract.methods.allInfoFor(accounts[0]).call();  
    console.log(response);
    this.setState({c2dBal: response.userBalance, 
      c2dBuyPrice: response.buyPrice, c2dSellPrice: response.sellPrice
     });
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
        <p>
          Try changing the value stored on <strong>line 40</strong> of App.js.
        </p>
        <div>The stored value is: {this.state.storageValue}</div>
        <div>You currently own: {this.state.clvBAL}CLV</div>
        <div>You currently own: {this.state.ethBAL}</div>
        <div>C2D info: Own {this.state.c2dBal}, BuyPrice {this.state.c2dBuyPrice/1000000}, Sell {this.state.c2dSellPrice/1000000}</div>
      </div>
    );
  }
}

export default App;
