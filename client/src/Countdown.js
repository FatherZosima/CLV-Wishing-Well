import React, { Component } from "react";
import { Button, Row, Container, Col, InputGroup } from "react-bootstrap";
import "./Countdown.css";
class Countdown extends Component {
  constructor(props) {
    super(props);
    this.state = { endTime: props.endTime };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.endTime !== this.props.endTime) {
      this.setState({
        endTime: this.props.endTime,
      });
    }
  }

  sendToParent = () => {
    this.props.parentCallback(this.state.totalSecondsLeft);
  };

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.calculateRemainingTime();
  }

  calculateRemainingTime() {
    let endTime = new Date(this.state.endTime * 1000); //mult by 1000 to go to milliseconds
    let now = new Date();
    let timeLeft = endTime - now;
    if (timeLeft < 0) timeLeft = 0;
    var daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    var hoursLeft = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    var minutesLeft = Math.floor((timeLeft / 1000 / 60) % 60);
    var secondsLeft = Math.floor((timeLeft / 1000) % 60);
    var totSecondsLeft = timeLeft / 1000; //convert from ms to s
    this.setState({
      wellDaysLeft: ("0" + daysLeft).slice(-2),
      wellHoursLeft: ("0" + hoursLeft).slice(-2),
      wellMinutesLeft: ("0" + minutesLeft).slice(-2),
      wellSecondsLeft: ("0" + secondsLeft).slice(-2),
      totalSecondsLeft: totSecondsLeft,
    });
    this.sendToParent(totSecondsLeft);
  }

  Number = (props) => {
    return (
      <Col className="countdown-number">
        <div>
          <h3>{props.value}</h3>
          <span>{props.unit}</span>
        </div>
      </Col>
    );
  };

  render() {
    if (this.state.totalSecondsLeft <= 0) {
      return (
        <Container fluid className="countdown-clock">
          <Row>
            <Col>
              <h1>Round Over</h1>
              <h4>Start the next round to finalize the results</h4>
            </Col>
          </Row>
        </Container>
      );
    }

    return (
      <Container fluid className="countdown-clock">
        <Row>
          <Col>
            <h3>Time Remaining</h3>
          </Col>
        </Row>
        <Row>
          <this.Number value={this.state.wellDaysLeft} unit="days" />
          <this.Number value={this.state.wellHoursLeft} unit="hours" />
          <this.Number value={this.state.wellMinutesLeft} unit="minutes" />
          <this.Number value={this.state.wellSecondsLeft} unit="seconds" />
        </Row>
      </Container>
    );
  }
}

export default Countdown;
