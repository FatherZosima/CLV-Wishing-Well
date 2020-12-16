import React, { Component } from "react";

import { Container, Col, Row } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { Flip, Fade, Bounce, Tada } from "react-awesome-reveal";

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
    };
  }

  componentDidUpdate(prevProps) {
    console.log("we updated");
    for (var key of Object.keys(prevProps)) {
      if (prevProps[key] !== this.props[key]) {
        console.log(key + " updated");
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
      <Bounce triggerOnce>
        <div className="Detail">
          {props.value}
          <br />
          {props.title}
        </div>
      </Bounce>
    );
  };

  render() {
    /*<Bounce triggerOnce>
              <div className="Detail">
              <a href={"https://rinkeby.etherscan.io/address/" + lastPlayer}>{this.shortenAddress(lastPlayer)}</a>{lastPlayer===accounts[0] && <span> (YOU)</span>}
              <br />
              Last Player
              </div>
            </Bounce>*/

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
    } = this.state;
    return (
      <div className="WellDetails">
        <Container>
          <Row>
            <Col>
              <this.Detail
                value={
                  <a
                    href={"https://rinkeby.etherscan.io/address/" + lastPlayer}
                  >
                    {" "}
                    {this.shortenAddress(lastPlayer)}
                  </a>
                }
                title={"Last Player"}
              />
            </Col>
            <Col>
              <this.Detail
                value={
                  <a
                    href={"https://rinkeby.etherscan.io/address/" + lastWinner}
                  >
                    {" "}
                    {this.shortenAddress(lastWinner)}
                  </a>
                }
                title={"Last Winner"}
              />
            </Col>
          </Row>
        </Container>
        <p>Well Pot: {wellPot}</p>
        <p>MinimumBet: {minBet}</p>
        <p>Well Round Num: {round}</p>
        <p>Plays this round: {wellPlays}</p>
        <p>C2D balance: {parseFloat(wellC2Dbalance).toFixed(2)}</p>
        <p>Well User allowance: {wellUserAllowance}</p>
        <p>Well CLV bal: {wellCLVBalance}</p>
      </div>
    );
  }
}

//<PendingTx txs={txs} accounts={accounts} web3={web3} />
//<CloverInterface accounts={accounts} web3={web3} CLVcontract={contracts.CLV} CLVscalar={CLVscalar} />
export default WellDetails;
