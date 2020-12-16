import React, { Component, useState } from "react";

import { isMobile } from "react-device-detect";

import {
  Alert,
  Container,
  Tabs,
  Tab,
  Form,
  Button,
  Col,
  Row,
  InputGroup,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import "./WellInterface.css";

import Notification from "react-web-notification";

import WellStatus from "./WellStatus.js";
import WellInfo from "./WellInfo.js";
import WellDetails from "./WellDetails.js";
import OutBetAlert from "./OutBetAlert.js";

class WellInterface extends Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      web3: props.web3,
      accounts: props.accounts,
      addresses: props.addresses,
      contracts: props.contracts,
      CLVscalar: props.CLVscalar,
      wellC2Dbalance: 0,
      roundEndTime: 0,
      minBet: 0,
      WellBetAmount: 0,
      roundOver: true,
      wasOutBet: false,
      txs: [],
    };

    //listen for events that would change the wellInfo
    this.state.contracts.C2D.events
      .allEvents()
      .on("data", (event) => {
        if (["Buy", "Sell"].includes(event.event)) {
          this.fetchWellInfo();
        }
      })
      .on("error", console.error);
    this.state.contracts.CLV.events
      .Approval()
      .on("data", (event) => {
        if (
          event.returnValues.owner == this.state.accounts[0] &&
          event.returnValues.spender == this.state.addresses.Well
        ) {
          this.fetchWellInfo();
        }
      })
      .on("error", console.error);
    this.state.contracts.CLV.events
      .Transfer()
      .on("data", (event) => {
        if (event.returnValues.to == this.state.addresses.Well) {
          //might want to check for .from != accounts[0] which will be emited on Bet
          this.fetchWellInfo();
        }
      })
      .on("error", console.error);
    this.state.contracts.Well.events
      .allEvents()
      .on("data", (event) => {
        this.fetchWellInfo();
      })
      .on("error", console.error);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.endTime !== this.props.endTime) {
      this.setState({
        endTime: this.props.endTime,
      });
    }
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.fetchWellInfo(), 5000);
    this.fetchWellInfo();
  }
  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  CLVapproveWell = async () => {
    const { accounts, contracts, addresses, txs } = this.state;
    //only do this is you need methods
    await contracts.CLV.methods
      .approve(addresses.Well, 1e12)
      .send()
      .on("transactionHash", function (hash) {
        txs.push({ type: "Approve Well", note: "", hash: hash });
      });
  };

  fetchWellInfo = async () => {
    const { web3, accounts, contracts, CLVscalar } = this.state;
    const response = await contracts.Well.methods.wellInfo(accounts[0]).call();
    //check if we lost our spot
    if (
      this.state.lastPlayer == accounts[0] &&
      response.lastPlayer != accounts[0]
    ) {
      //this.setState({wasOutBet:true});
      alert(
        "You are no longer the last player. Bet again to reclaim your place"
      );
    }
    for (var key of Object.keys(response)) {
      let val = response[key];
      if (
        [
          "potBalance",
          "minBet",
          "wellBalance",
          "userWinnings",
          "userAllowance",
        ].includes(key)
      ) {
        val = val / CLVscalar;
      }
      if (key === "wellC2Dbalance") {
        val = web3.utils.fromWei(val, "ether");
      }
      if (val !== this.state[key]) {
        this.setState({
          [key]: val,
        });
      }
    }
    /*this.setState({
      wellPot: response.potBalance / CLVscalar,
      wellRoundNumber: response.roundNumber,
      wellPlays: response.playsThisRound,
      roundEndTime: response.roundEndTime,
      minBet: response.minBet / CLVscalar,
      lastPlayer: response.lastPlayer,
      lastWinner: response.lastWinner,
      wellCLVBalance: response.wellBalance / CLVscalar,
      wellUserAllowance: web3.utils.fromWei(response.userAllowance, "mwei"),
      wellUserWinnings: response.userWinnings / CLVscalar,
      wellC2Dbalance: web3.utils.fromWei(response.wellC2Dbalance, "ether"),
      bigPotFrequency: response.bigPotFreq
    });*/
    console.log(this.state);
  };

  bet = async () => {
    const { web3, contracts, WellBetAmount, CLVscalar, txs } = this.state;
    let wellBet = parseFloat(WellBetAmount);
    if (wellBet > 0 && wellBet >= this.state.minBet) {
      console.log("trying to bet " + wellBet);
      let amt = wellBet * CLVscalar;
      await contracts.Well.methods
        .bet(amt)
        .send()
        .on("transactionHash", function (hash) {
          txs.push({ type: "Bet", note: WellBetAmount + " CLV", hash: hash });
        });
    }
  };

  startNextRound = async () => {
    const {
      web3,
      contracts,
      roundOver,
      WellBetAmount,
      CLVscalar,
      txs,
    } = this.state;
    let wellBet = parseFloat(WellBetAmount);
    if (wellBet >= 0.222222 && roundOver) {
      let amt = wellBet * CLVscalar;
      await contracts.Well.methods
        .startNextRound(amt)
        .send()
        .on("transactionHash", function (hash) {
          txs.push({
            type: "Start Next Round",
            note: WellBetAmount + " CLV",
            hash: hash,
          });
        });
    }
  };

  withdrawWell = async () => {
    const { web3, accounts, contracts, txs, wellUserWinnings } = this.state;
    await contracts.Well.methods
      .withdrawWinnings()
      .send()
      .on("transactionHash", function (hash) {
        txs.push({ type: "Withdraw Winnings", note: "", hash: hash });
      });
  };

  timeLeftCallback = (totalSecondsLeft) => {
    if (totalSecondsLeft <= 0 != this.state.roundOver) {
      this.setState({
        roundOver: totalSecondsLeft <= 0,
      });
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

  shortenAddress(addy) {
    if (addy == null) {
      return "0x00...000";
    }
    let str = addy.slice(0, 4) + "..." + addy.slice(-3);
    return str;
  }

  render() {
    console.log("wellinterface render");
    const {
      web3,
      contracts,
      addresses,
      accounts,
      txs,
      CLVscalar,
      potBalance,
      minBet,
      WellBetAmount,
      bigPotFreq,
      roundEndTime,
      roundOver,
      wellC2Dbalance,
      roundNumber,
      lastPlayer,
      lastWinner,
      playsThisRound,
      wellBalance,
      userAllowance,
      wasOutBet,
    } = this.state;
    if (isMobile) {
      return (
        <Tabs defaultActiveKey="info" id="uncontrolled-tab-example">
          <Tab eventKey="info" title="Info">
            <h2>Wishing Well</h2>
            <p>Instructions go here</p>
          </Tab>
          <Tab eventKey="well" title="Well">
            <WellStatus
              wellPot={potBalance}
              round={roundNumber}
              bigPotFrequency={bigPotFreq}
              roundEndTime={roundEndTime}
              callback={this.timeLeftCallback}
            />
            <p>User winnings: {this.state.wellUserWinnings}</p>
            <Button onClick={this.withdrawWell}>Withdraw</Button>

            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text
                  className="disable-text-selection"
                  onClick={(e) =>
                    this.setState({
                      WellBetAmount: roundOver ? 0.222222 : minBet,
                    })
                  }
                >
                  Min: {roundOver ? 0.222222 : minBet}
                </InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                name="WellBetAmount"
                type="number"
                id="inputWellBetAmount"
                placeholder={100}
                value={WellBetAmount}
                onChange={(e) => {
                  this.handleChange(e);
                }}
              />
              <InputGroup.Append>
                <InputGroup.Text>CLV</InputGroup.Text>
              </InputGroup.Append>
              <InputGroup.Append>
                {parseFloat(WellBetAmount) > parseFloat(userAllowance) && (
                  <Button onClick={this.CLVapproveWell}>Approve</Button>
                )}
                {parseFloat(WellBetAmount) <= parseFloat(userAllowance) &&
                  roundOver && (
                    <Button onClick={this.nextRound}>Start Next Round</Button>
                  )}
                {parseFloat(WellBetAmount) <= parseFloat(userAllowance) &&
                  !roundOver && <Button onClick={this.bet}>Bet</Button>}
              </InputGroup.Append>
            </InputGroup>
          </Tab>
          <Tab eventKey="Details" title="Details">
            <WellDetails
              web3={web3}
              contracts={contracts}
              accounts={accounts}
              addresses={addresses}
              txs={txs}
              CLVscalar={CLVscalar}
              wellPot={potBalance}
              wellC2Dbalance={wellC2Dbalance}
              minBet={minBet}
              round={roundNumber}
              lastPlayer={lastPlayer}
              lastWinner={lastWinner}
              wellPlays={playsThisRound}
              wellCLVBalance={wellBalance}
              wellUserAllowance={userAllowance}
            />
          </Tab>
        </Tabs>
      );
    }

    return (
      <div className="WellStation">
        <Container fluid>
          <Row>
            <Col>
              <WellInfo addresses={addresses} />
            </Col>
            <Col>
              <WellStatus
                wellPot={potBalance}
                round={roundNumber}
                bigPotFrequency={bigPotFreq}
                roundEndTime={roundEndTime}
                callback={this.timeLeftCallback}
              />
              <p>User winnings: {this.state.wellUserWinnings}</p>
              <Button onClick={this.withdrawWell}>Withdraw</Button>
              <OutBetAlert wasOutBet={wasOutBet} />
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text
                    className="disable-text-selection"
                    onClick={(e) =>
                      this.setState({
                        WellBetAmount: roundOver ? 0.222222 : minBet,
                      })
                    }
                  >
                    Min: {roundOver ? 0.222222 : minBet}
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  name="WellBetAmount"
                  type="number"
                  id="inputWellBetAmount"
                  placeholder={100}
                  value={WellBetAmount}
                  onChange={(e) => {
                    this.handleChange(e);
                  }}
                />
                <InputGroup.Append>
                  <InputGroup.Text>CLV</InputGroup.Text>
                </InputGroup.Append>
                <InputGroup.Append>
                  {parseFloat(WellBetAmount) > parseFloat(userAllowance) && (
                    <Button onClick={this.CLVapproveWell}>Approve</Button>
                  )}
                  {parseFloat(WellBetAmount) <= parseFloat(userAllowance) &&
                    roundOver && (
                      <Button onClick={this.startNextRound}>
                        Start Next Round
                      </Button>
                    )}
                  {parseFloat(WellBetAmount) <= parseFloat(userAllowance) &&
                    !roundOver && <Button onClick={this.bet}>Bet</Button>}
                </InputGroup.Append>
              </InputGroup>
            </Col>

            <Col>
              <WellDetails
                web3={web3}
                contracts={contracts}
                accounts={accounts}
                addresses={addresses}
                txs={txs}
                CLVscalar={CLVscalar}
                wellPot={potBalance}
                wellC2Dbalance={wellC2Dbalance}
                minBet={minBet}
                round={roundNumber}
                lastPlayer={lastPlayer}
                lastWinner={lastWinner}
                wellPlays={playsThisRound}
                wellCLVBalance={wellBalance}
                wellUserAllowance={userAllowance}
              />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default WellInterface;
