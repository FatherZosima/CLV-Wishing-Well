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
    for (var key of Object.keys(prevProps)) {
      if (prevProps[key] !== this.props[key]) {
        this.setState({
          [key]: this.props[key],
        });
        this.checkTxs();
      }
    }
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.checkTxs(), 2000);
  }
  componentWillUnmount() {
    clearInterval(this.timerID);
  }
  clearOld = async () => {
    if (this.state.txs.length > 5) {
      this.state.txs.shift();
    }
  };
  checkTxs = async () => {
    this.clearOld();
    var tx;
    for (tx of this.state.txs) {
      if (tx.status != "successful" && tx.status != "failed") {
        const txStatus = await this.state.web3.eth.getTransactionReceipt(
          tx.hash
        );
        if (txStatus) {
          if (txStatus.status) {
            tx.status = "successful";
          } else {
            tx.status = "failed";
          }
        } else {
          tx.status = "pending";
        }
      }
    }
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
    return <a href={"https://rinkeby.etherscan.io/tx/" + addy}>{str}</a>;
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
