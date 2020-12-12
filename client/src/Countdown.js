import React, { Component } from 'react';
import './Countdown.css';
class Countdown extends Component {
  constructor(props) {
    super(props);
    this.state = {endTime: props.endTime};
  }


  componentDidUpdate(prevProps){
    if(prevProps.endTime !== this.props.endTime){
        this.setState({          
            endTime: this.props.endTime
        });
    }
  }

  sendToParent = () => {
    this.props.parentCallback(this.state.totalSecondsLeft);
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {    
    this.calculateRemainingTime();
  }

  calculateRemainingTime() {
    let endTime = new Date(this.state.endTime*1000);//mult by 1000 to go to milliseconds
    let now = new Date();
    let timeLeft = endTime - now;
    if(timeLeft<0) timeLeft = 0;
    var daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    var hoursLeft = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    var minutesLeft = Math.floor((timeLeft / 1000) / 60 % 60);
    var secondsLeft = Math.floor((timeLeft / 1000)%60);
    this.setState({
      wellDaysLeft: ("0"+daysLeft).slice(-2),
      wellHoursLeft: ("0"+hoursLeft).slice(-2),
      wellMinutesLeft: ("0"+minutesLeft).slice(-2),
      wellSecondsLeft: ("0"+secondsLeft).slice(-2),
      totalSecondsLeft: timeLeft/1000 //convert from ms to s
    })
    this.sendToParent(this.state.totalSecondsLeft);
  }

  render() {
    return (
      <div className="countdown">
        <h2>Time Remaining</h2>
        <div className="countdown-clock">
          <div id="days" className="countdown-number"><h2>{this.state.wellDaysLeft}</h2><p>days</p></div>
          <div id="hours" className="countdown-number"><h2>{this.state.wellHoursLeft}</h2><p>hours</p></div>
          <div id="minutes" className="countdown-number"><h2>{this.state.wellMinutesLeft}</h2><p>minutes</p></div>
          <div id="seconds" className="countdown-number"><h2>{this.state.wellSecondsLeft}</h2><p>seconds</p></div>
        </div>
      </div>
    );
  }
}

export default Countdown;
