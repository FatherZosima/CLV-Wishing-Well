import React from 'react';
import './Countdown.css';
class Countdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {endDate: props.endDate};
  }


  componentDidUpdate(prevProps){
    if(prevProps.endDate !== this.props.endDate){
        this.setState({          
            endDate: this.props.endDate
        });
    }
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
    let endTime = new Date(this.state.endDate*1000);
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
      wellTotalSecondsLeft: timeLeft/1000
    })

  }

  render() {
    return (
      <div class="countdown">
        <div id="days" class="countdown-number"><h2>{this.state.wellDaysLeft}</h2><p>days</p></div>
        <div id="hours" class="countdown-number"><h2>{this.state.wellHoursLeft}</h2><p>hours</p></div>
        <div id="minutes" class="countdown-number"><h2>{this.state.wellMinutesLeft}</h2><p>minutes</p></div>
        <div id="seconds" class="countdown-number"><h2>{this.state.wellSecondsLeft}</h2><p>seconds</p></div>
      </div>
    );
  }
}

export default Countdown;
