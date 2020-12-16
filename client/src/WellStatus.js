import React, { Component } from "react";

import { isMobile } from "react-device-detect";

import { Form, Button, Col, InputGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import "./WellStatus.css";
import Countdown from "./Countdown.js";
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import AnimatedNumber from "react-animated-number";

//things to trick

class WellStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wellPot: props.wellPot,
      roundEndTime: props.roundEndTime,
      bigPotFrequency: props.bigPotFrequency,
      round: props.round,
      startingSeconds: 1,
    };
  }

  componentDidUpdate(prevProps) {
    for (var key of Object.keys(prevProps)) {
      if (prevProps[key] !== this.props[key]) {
        //console.log("wellstatus."+key+" changed from " +prevProps[key]+" to "+this.props[key]);
        this.setState({
          [key]: this.props[key],
        });
        if (key === "roundEndTime") {
          let endTime = new Date(this.props[key] * 1000); //mult by 1000 to go to milliseconds
          let now = new Date();
          let timeLeft = (endTime - now) / 1000; //convert to secs
          if (timeLeft <= 0) {
            timeLeft = 1; //small value
          }
          this.setState({
            startingSeconds: timeLeft,
          });
        }
      }
    }
  }

  componentDidMount() {}
  componentWillUnmount() {}

  countdownCallback = (totalSecondsLeft) => {
    this.setState({
      wellTotalSecondsLeft: totalSecondsLeft,
    });
    this.props.callback(totalSecondsLeft);
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
    const {
      wellPot,
      wellTotalSecondsLeft,
      round,
      roundEndTime,
      bigPotFrequency,
      startingSeconds,
    } = this.state;

    return (
      <div className="WellStatus">
        <CircularProgressbarWithChildren
          value={((round % bigPotFrequency) / bigPotFrequency) * 100}
          strokeWidth={3}
          styles={buildStyles({
            pathColor: "#D4Af37",
            trailColor: "transparent",
          })}
        >
          {/*
          Width here needs to be (100 - 2 * strokeWidth)% 
          in order to fit exactly inside the outer progressbar.
        */}
          <div style={{ width: "94%" }}>
            <CircularProgressbarWithChildren
              className="statusCircle"
              value={(wellTotalSecondsLeft / startingSeconds) * 100}
              strokeWidth={5}
              background
              styles={buildStyles({
                backgroundColor: "rgba(0,0,0,0.9)",
                pathColor: "#f00",
                trailColor: "transparent",
              })}
            >
              <div id="currPot">
                <div id="potText">
                  <h4>
                    <AnimatedNumber
                      stepPrecision={0.1}
                      value={wellPot}
                      formatValue={(n) => `${n.toFixed(1)} CLV`}
                    />
                  </h4>
                  <p>Current Pot</p>
                </div>
              </div>
              <Countdown
                endTime={roundEndTime}
                parentCallback={this.countdownCallback}
              >
                {" "}
              </Countdown>
              <h3>Round {round}</h3>
              <p>
                {bigPotFrequency - (round % bigPotFrequency) != 1
                  ? "Pot of Gold in " +
                    Number(bigPotFrequency - (round % bigPotFrequency)) +
                    " rounds"
                  : "Pot of Gold starting next round"}
              </p>
            </CircularProgressbarWithChildren>
          </div>
        </CircularProgressbarWithChildren>
      </div>
    );
  }
}

export default WellStatus;
