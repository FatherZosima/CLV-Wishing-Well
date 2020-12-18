import React, { Component } from "react";

import WellInterface from "./WellInterface.js";

import CLVContract from "./contracts/Clover.json";
import CLV2DContract from "./contracts/CLV2D.json";
import CLVWellContract from "./contracts/WishingWell.json";
import getWeb3 from "./getWeb3";

//import {C2Dabi, CLVabi, C2Daddress, CLVaddress} from "./contracts/ExistingABI.js";

import "./App.css";

const CLVscalar = 1000000; //6 decimals

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    contracts: { CLV: null, C2D: null, Well: null },
    addresses: { CLV: null, C2D: null, Well: null },
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      console.log(networkId);

      var C2Daddress = "0xc744dc036f42C2538d63EcA6348E2066e183279E";
      var CLVaddress = "0x22222C03318440305aC3e8a7820563d6A9FD777F";

      const CLVinstance = new web3.eth.Contract(CLVContract.abi, CLVaddress, {
        from: accounts[0],
      });
      const CLV2DdeployedNetwork = CLV2DContract.networks[networkId];
      const CLV2Dinstance = new web3.eth.Contract(
        CLV2DContract.abi,
        C2Daddress,
        { from: accounts[0] }
      );
      const CLVWellDeployedNetwork = CLVWellContract.networks[networkId];
      const CLVWellinstance = new web3.eth.Contract(
        CLVWellContract.abi,
        CLVWellDeployedNetwork && CLVWellDeployedNetwork.address,
        { from: accounts[0] }
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3,
        accounts,
        contracts: {
          CLV: CLVinstance,
          C2D: CLV2Dinstance,
          Well: CLVWellinstance,
        },
        addresses: {
          CLV: CLVaddress,
          C2D: C2Daddress,
          Well: CLVWellDeployedNetwork.address,
        },
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <WellInterface
          accounts={this.state.accounts}
          web3={this.state.web3}
          contracts={this.state.contracts}
          addresses={this.state.addresses}
          CLVscalar={CLVscalar}
        />
      </div>
    );
  }
}

export default App;
