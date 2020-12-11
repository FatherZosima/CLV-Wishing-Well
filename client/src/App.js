import React, { Component } from "react";
import {
  Container, Col, Form,
  FormGroup, Label, Input,
  Button, FormText, FormFeedback,
} from 'reactstrap';
import CloverInterface from './CloverInterface.js';
import C2DInterface from './C2DInterface.js';
import WellInterface from './WellInterface.js';

import CLVContract from "./contracts/Clover.json";
import CLV2DContract from "./contracts/CLV2D.json";
import CLVWellContract from "./contracts/RandomWell.json";

import getWeb3 from "./getWeb3";

import "./App.css";

const CLVscalar = 1000000; //6 decimals


class App extends Component {
  state = { 
    web3: null, accounts: null, 
    contracts:{CLV:null, C2D:null, Well:null},
    addresses:{CLV:null, C2D:null, Well:null}
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


      const CLVdeployedNetwork = CLVContract.networks[networkId];
      const CLVinstance = new web3.eth.Contract(
        CLVContract.abi,
        CLVdeployedNetwork && CLVdeployedNetwork.address, {from:accounts[0]}
      );
      const CLV2DdeployedNetwork = CLV2DContract.networks[networkId];
      const CLV2Dinstance = new web3.eth.Contract(
        CLV2DContract.abi,
        CLV2DdeployedNetwork && CLV2DdeployedNetwork.address, {from:accounts[0]}
      );
      const CLVWellDeployedNetwork = CLVWellContract.networks[networkId];
      const CLVWellinstance = new web3.eth.Contract(
        CLVWellContract.abi,
        CLVWellDeployedNetwork && CLVWellDeployedNetwork.address, {from:accounts[0]}
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, 
        contracts:{CLV:CLVinstance, C2D:CLV2Dinstance, Well:CLVWellinstance},
        addresses:{CLV:CLVdeployedNetwork.address, C2D:CLV2DdeployedNetwork.address, Well:CLVWellDeployedNetwork.address}
      });

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
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
        <p>CLV address: {this.state.clvAddress} <a href={"https://rinkeby.etherscan.io/token/"+this.state.clvAddress}>link</a></p>
        <p>C2D address: {this.state.c2dAddress} <a href={"https://rinkeby.etherscan.io/token/"+this.state.c2dAddress}>link</a></p>
        <p>CLV Well address: {this.state.clvWellAddress} <a href={"https://rinkeby.etherscan.io/address/"+this.state.clvWellAddress}>link</a></p>
        <div id="main"> 
          <WellInterface accounts={this.state.accounts} web3={this.state.web3} contracts={this.state.contracts} addresses={this.state.addresses} CLVscalar={CLVscalar} />
        </div>
        <CloverInterface accounts={this.state.accounts} web3={this.state.web3} CLVcontract={this.state.contracts.CLV} CLVscalar={CLVscalar} />
        <C2DInterface accounts={this.state.accounts} web3={this.state.web3} contracts={this.state.contracts} addresses={this.state.addresses} CLVscalar={CLVscalar} />
       


      </div>
    );
  }
}

export default App;
