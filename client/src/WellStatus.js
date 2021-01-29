import React, { Component } from "react";

import { Button, Row, Container, Col, Form, InputGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { Bounce } from "react-awesome-reveal";

import "./WellStatus.css";
import Countdown from "./Countdown.js";
import AnimatedNumber from "react-animated-number";

//things to trick

class WellStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      callbacks: props.callbacks,
      wellPot: props.wellPot,
      roundEndTime: props.roundEndTime,
      bigPotFrequency: props.bigPotFrequency,
      round: props.round,
      userWinnings: props.userWinnings,
      minBet: props.minBet,
      userAllowance: props.userAllowance,
      wellC2Dbalance: props.wellC2Dbalance,
      roundOver: false,
    };
    console.log("Winnings " + props.userWinnings);
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

  countdownCallback = (totalSecondsLeft) => {
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

  Status = (props) => {
    return (
      <Col className="Status">
        <Bounce triggerOnce>
          <div>
            <h3>{props.value}</h3>
            <span>{props.text}</span>
          </div>
        </Bounce>
      </Col>
    );
  };

  render() {
    const {
      callbacks,
      wellPot,
      round,
      roundEndTime,
      bigPotFrequency,
      betAmount,
      userAllowance,
      minBet,
      roundOver,
      userWinnings,
      wellC2Dbalance,
    } = this.state;
    return (
      <div className="WellStatus">
        <Countdown
          endTime={roundEndTime}
          parentCallback={this.countdownCallback}
        ></Countdown>
        <Container fluid className="StatusInfo">
          <Row>
            <this.Status
              value={parseFloat(wellPot).toFixed(2) + " CLV"}
              text="Pot Balance"
            />
          </Row>
          <Row>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text
                  className="disable-text-selection"
                  onClick={(e) =>
                    this.setState({
                      betAmount: roundOver ? 0.222222 : minBet,
                    })
                  }
                >
                  Min: {roundOver ? 0.222222 : minBet}
                </InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                name="betAmount"
                type="number"
                id="inputBetAmount"
                placeholder={roundOver ? 0.222222 : minBet}
                value={betAmount}
                onChange={(e) => {
                  this.handleChange(e);
                }}
              />
              <InputGroup.Append>
                {parseFloat(betAmount) > parseFloat(userAllowance) && (
                  <Button
                    variant="warning"
                    onClick={(e) => callbacks.approve()}
                  >
                    Approve
                  </Button>
                )}
                {(parseFloat(betAmount) <= parseFloat(userAllowance) ||
                  !betAmount) &&
                  roundOver && (
                    <Button
                      variant="info"
                      onClick={(e) => callbacks.start(betAmount)}
                    >
                      Start Round
                    </Button>
                  )}
                {(parseFloat(betAmount) <= parseFloat(userAllowance) ||
                  !betAmount) &&
                  !roundOver && (
                    <Button
                      variant="info"
                      onClick={(e) => callbacks.bet(betAmount)}
                    >
                      Bet
                    </Button>
                  )}
              </InputGroup.Append>
            </InputGroup>
          </Row>
          <Row>
            <this.Status value={round} text="Round Number" />
            <this.Status
              value={parseFloat(wellC2Dbalance).toFixed(1) + " C2D"}
              text="in Pot of Gold"
            />
            <this.Status
              value={bigPotFrequency - (round % bigPotFrequency)}
              text="Rounds until Pot of Gold"
            />
          </Row>
          <Row>
            <Col>
              <Bounce triggerOnce className="Staus">
                <div>
                  <h4>Winnings: {userWinnings} CLV</h4>
                  <Button variant="info" onClick={callbacks.withdraw}>
                    Withdraw
                  </Button>
                </div>
              </Bounce>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default WellStatus;
