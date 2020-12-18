import React, { Component } from "react";

import { Container, Col, Row } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { Bounce } from "react-awesome-reveal";

import "./WellDetails.css";

import AnimatedNumber from "react-animated-number";
import PendingTx from "./PendingTx.js";
import CloverInterface from "./CloverInterface.js";

class WellDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: props.web3,
      contracts: props.contracts,
      accounts: props.accounts,
      addresses: props.addresses,
      txs: props.txs,
      CLVscalar: props.CLVscalar,
      wellPot: props.wellPot,
      wellC2Dbalance: props.wellC2Dbalance,
      minBet: props.minBet,
      round: props.round,
      lastPlayer: props.lastPlayer,
      lastWinner: props.lastWinner,
      wellPlays: props.wellPlays,
      wellCLVBalance: props.wellCLVBalance,
      wellUserAllowance: props.wellUserAllowance,
      bigPotFreq: props.bigPotFreq,
    };
  }

  componentDidUpdate(prevProps) {
    for (var key of Object.keys(prevProps)) {
      if (prevProps[key] !== this.props[key]) {
        this.setState({
          [key]: this.props[key],
        });
      }
    }
  }

  componentDidMount() {}
  componentWillUnmount() {}

  shortenAddress(addy) {
    if (addy == null) {
      return "0x00...000";
    }
    let str = addy.slice(0, 4) + "..." + addy.slice(-3);
    return str;
  }

  Detail = (props) => {
    return (
      <Col>
        <Bounce triggerOnce className="Detail">
          <div>
            <h3>{props.value}</h3>
            <span>{props.title}</span>
          </div>
        </Bounce>
      </Col>
    );
  };

  render() {
    const {
      web3,
      accounts,
      contracts,
      txs,
      wellPot,
      minBet,
      wellUserAllowance,
      wellC2Dbalance,
      wellCLVBalance,
      CLVscalar,
      round,
      lastPlayer,
      lastWinner,
      wellPlays,
      bigPotFreq,
    } = this.state;
    return (
      <div className="WellDetails">
        <Container fluid>
          <Row>
            <this.Detail
              value={
                <a
                  href={"https://etherscan.io/address/" + lastPlayer}
                  target="_blank"
                >
                  {this.shortenAddress(lastPlayer)}
                  {lastPlayer == accounts[0] && " YOU"}
                </a>
              }
              title="Last Player"
            />
            <this.Detail
              value={
                <a
                  href={"https://etherscan.io/address/" + lastWinner}
                  target="_blank"
                >
                  {this.shortenAddress(lastWinner)}
                  {lastWinner == accounts[0] && " YOU"}
                </a>
              }
              title="Last Winner"
            />
          </Row>
          <Row>
            <this.Detail
              value={"Every " + bigPotFreq + " Rounds"}
              title="Big Pot Frequency"
            />
            <this.Detail value={wellCLVBalance} title="Well CLV" />
          </Row>
        </Container>
        <PendingTx txs={txs} accounts={accounts} web3={web3} />
      </div>
    );
  }
}
export default WellDetails;
