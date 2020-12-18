import React, { Component, useState } from "react";
import { Fade, Bounce } from "react-awesome-reveal";
import "./PendingTx.css";

class PendingTx extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: props.web3,
      accounts: props.accounts,
      addresses: props.addresses,
      contracts: props.contracts,
      CLVscalar: props.CLVscalar,
      txs: props.txs,
    };
  }

  componentDidUpdate(prevProps) {
    for (var key of Object.keys(this.props)) {
      if (key == "txs") {
        if (
          Object.keys(prevProps[key]).length !=
          Object.keys(this.props[key]).length
        ) {
          this.setState({ txs: this.props.txs });
          continue;
        }
      }
      if (prevProps[key] !== this.props[key]) {
        this.setState({
          [key]: this.props[key],
        });
      }
    }
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.checkTxs(), 2000);
  }
  componentWillUnmount() {
    clearInterval(this.timerID);
  }
  checkTxs = async () => {
    var tx;
    var newTx;
    var updatedTxs = [];
    //if(this.state.txs.length==0){
    //return;
    //}
    for (tx of this.state.txs) {
      if (tx.status != "Successful" && tx.status != "Failed") {
        const txStatus = await this.state.web3.eth.getTransactionReceipt(
          tx.hash
        );
        newTx = tx;
        if (txStatus) {
          if (txStatus.status) {
            newTx.status = "Successful";
          } else {
            newTx.status = "Failed";
          }
        } else {
          newTx.status = "Pending";
        }
      }
      updatedTxs.push(tx);
    }
    this.setState({
      txs: updatedTxs,
    });
  };

  handleChange = async (event) => {
    const { target } = event;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const { name } = target;
    await this.setState({
      [name]: value,
    });
  };

  displayTx(addy) {
    if (addy == null) {
      return "0x00...000";
    }
    let str = addy.slice(0, 9) + "..." + addy.slice(-4);
    return (
      <a href={"https://rinkeby.etherscan.io/tx/" + addy} target="_blank">
        {str}
      </a>
    );
  }

  render() {
    const { accounts, txs } = this.state;

    return (
      <div className="TXwindow">
        <h3>Pending Tx's:</h3>
        <Bounce triggerOnce>
          {txs
            .slice(0)
            .reverse()
            .map((tx) => (
              <div key={tx.hash} className={`tx ${tx.status}`}>
                {tx.type} {tx.note} - {tx.status} <br />{" "}
                {this.displayTx(tx.hash)}
              </div>
            ))}
        </Bounce>
      </div>
    );
  }
}

export default PendingTx;
