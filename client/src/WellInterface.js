import React, { Component, useState } from "react";

import { isMobile } from "react-device-detect";

import { Container, Tabs, Tab, Col, Row } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import "./WellInterface.css";

import Notification from "react-web-notification";

import WellStatus from "./WellStatus.js";
import WellInfo from "./WellInfo.js";
import WellDetails from "./WellDetails.js";

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
      bigPotFreq: 0,
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
    let self = this;
    //only do this is you need methods
    await contracts.CLV.methods
      .approve(addresses.Well, 1e12)
      .send()
      .on("transactionHash", function (hash) {
        self.setState((prevState) => ({
          txs: [
            ...prevState.txs,
            {
              type: "Approve",
              note: "",
              hash: hash,
            },
          ],
        }));
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
  };

  bet = async (betAmount) => {
    const { minBet, contracts, CLVscalar, txs } = this.state;
    let wellBet = parseFloat(betAmount);
    let self = this;
    if (wellBet > 0 && wellBet >= this.state.minBet) {
      let amt = wellBet * CLVscalar;
      await contracts.Well.methods
        .bet(amt)
        .send()
        .on("transactionHash", function (hash) {
          self.setState((prevState) => ({
            txs: [
              ...prevState.txs,
              {
                type: "Bet",
                note: betAmount + " CLV",
                hash: hash,
              },
            ],
          }));
        });
    } else {
      alert("Bet amount must be greater than the minimum bet of " + minBet);
    }
  };

  startNextRound = async (betAmount) => {
    const { web3, contracts, CLVscalar, txs } = this.state;
    var alertText = " ";
    let self = this;
    let wellBet = parseFloat(betAmount);
    if (wellBet >= 0.222222) {
      let amt = wellBet * CLVscalar;
      await contracts.Well.methods
        .startNextRound(amt)
        .send()
        .on("transactionHash", function (hash) {
          self.setState((prevState) => ({
            txs: [
              ...prevState.txs,
              {
                type: "Start Next Round",
                note: betAmount + " CLV",
                hash: hash,
              },
            ],
          }));
        });
    } else {
      alert("Must enter the minimum bet of 0.222222 to start a round");
    }
  };

  withdrawWell = async () => {
    const { web3, accounts, contracts, txs, wellUserWinnings } = this.state;
    let self = this;
    await contracts.Well.methods
      .withdrawWinnings()
      .send()
      .on("transactionHash", function (hash) {
        self.setState((prevState) => ({
          txs: [
            ...prevState.txs,
            {
              type: "Withdraw Winnings",
              note: "",
              hash: hash,
            },
          ],
        }));
      });
  };

  render() {
    const {
      web3,
      contracts,
      addresses,
      accounts,
      txs,
      CLVscalar,
      potBalance,
      minBet,
      bigPotFreq,
      roundEndTime,
      wellC2Dbalance,
      roundNumber,
      lastPlayer,
      lastWinner,
      playsThisRound,
      wellBalance,
      userAllowance,
      userWinnings,
    } = this.state;
    if (isMobile) {
      return (
        <Tabs
          defaultActiveKey="well"
          id="uncontrolled-tab-example"
          className="WellStation sticky-nav"
        >
          <Tab eventKey="info" title="Info">
            <WellInfo addresses={addresses} />
          </Tab>
          <Tab eventKey="well" title="Well">
            <WellStatus
              wellPot={potBalance}
              minBet={minBet}
              userAllowance={userAllowance}
              round={roundNumber}
              bigPotFrequency={bigPotFreq}
              roundEndTime={roundEndTime}
              userWinnings={userWinnings}
              wellC2Dbalance={wellC2Dbalance}
              callbacks={{
                withdraw: this.withdrawWell,
                bet: this.bet,
                start: this.startNextRound,
                approve: this.CLVapproveWell,
              }}
            />
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
              bigPotFreq={bigPotFreq}
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
                minBet={minBet}
                userAllowance={userAllowance}
                round={roundNumber}
                bigPotFrequency={bigPotFreq}
                roundEndTime={roundEndTime}
                userWinnings={userWinnings}
                wellC2Dbalance={wellC2Dbalance}
                callbacks={{
                  withdraw: this.withdrawWell,
                  bet: this.bet,
                  start: this.startNextRound,
                  approve: this.CLVapproveWell,
                }}
              />
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
                bigPotFreq={bigPotFreq}
              />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default WellInterface;
