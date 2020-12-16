import React, { Component } from "react";

import { Form, Button, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import "./Station.css";
class CloverInterface extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: props.web3,
      accounts: props.accounts,
      CLVcontract: props.CLVcontract,
      CLVscalar: props.CLVscalar,
      clvToMint: 0,
    };
  }

  componentDidUpdate(prevProps) {}

  componentDidMount() {
    this.timerID = setInterval(() => this.fetchCLVbalance(), 5000);
    this.fetchCLVbalance();
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  fetchCLVbalance = async () => {
    const { accounts, CLVcontract, clvToMint, CLVscalar } = this.state;
    // Get the value from the contract to prove it worked.
    const response = await CLVcontract.methods.balanceOf(accounts[0]).call();
    // Update state with the result.
    this.setState({
      clvBal: this.state.web3.utils.fromWei(response, "mwei"),
    });
  };

  mintCLV = async () => {
    const { accounts, CLVcontract, clvToMint, CLVscalar } = this.state;
    //console.log(CLVcontract);
    var amount = clvToMint * CLVscalar; //must multiply bc CLV has 6 decimals
    var amount = 1000 * CLVscalar; //must multiply bc CLV has 6 decimals
    //first add me to minters
    console.log("going to mint: " + amount);

    await CLVcontract.methods.mint(accounts[0], amount).send();
    this.fetchCLVbalance();
  };

  render() {
    return (
      <div className="station">
        <h2>CLV station</h2>
        <p>You currently own: {this.state.clvBal}CLV</p>
        <Button onClick={this.mintCLV}>Mint 1000 ClV</Button>
      </div>
    );
  }
}

export default CloverInterface;
