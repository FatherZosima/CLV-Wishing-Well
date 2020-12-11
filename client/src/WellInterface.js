import React, { Component, useState } from 'react';
import {
  Container, Col, Form,
  FormGroup, Label, Input,
  Button, FormText, FormFeedback,
  Collapse,
} from 'reactstrap';
import './Station.css'
import Countdown from './Countdown.js';


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
      wellC2Dbalance:0, wellC2Ddividends:0,
      roundEndTime:0, minBet:0,
      WellBetAmount:0,
    };
  }

  componentDidUpdate(prevProps){
    if(prevProps.endTime !== this.props.endTime){
        this.setState({          
            endTime: this.props.endTime
        });
    }
  }
  
  componentDidMount() {
    this.timerID = setInterval(
      () => this.fetchWellInfo(),
      5000
    );
    this.fetchWellInfo();
  }
  componentWillUnmount() {
    clearInterval(this.timerID);
  }


  CLVapproveWell = async() => {
    const{accounts, contracts, addresses} = this.state;
    //only do this is you need methods
    await contracts.CLV.methods.approve(addresses.Well, 1e12).send();
    this.fetchWellInfo();
  };

  fetchWellInfo = async() => {
    const{web3, accounts, contracts, CLVscalar} = this.state;
    const response = await contracts.Well.methods.wellInfo(accounts[0]).call();
    this.setState({
      wellPot: response.potBalance/CLVscalar,
      wellRoundNumber: response.roundNumber,
      wellPlays: response.playsThisRound,
      roundEndTime: response.roundEndTime,
      minBet: response.minBet/CLVscalar,
      lastPlayer: response.lastPlayer,
      lastWinner: response.lastWinner,
      roundOver: (new Date(response.roundEndTime*1000) - new Date())<=0,
      wellCLVBalance: response.wellBalance/CLVscalar,
      wellUserAllowance: web3.utils.fromWei(response.userAllowance, "mwei"),
      wellUserWinnings: response.userWinnings/CLVscalar,
      wellC2Dbalance: web3.utils.fromWei(response.wellC2Dbalance, "ether"),
      wellC2Ddividends: web3.utils.fromWei(response.wellC2Ddividends, "mwei"),
      bigPotFrequency: response.bigPotFreq
    });
  };

  bet = async() => {
    const{web3, contracts, WellBetAmount, CLVscalar} = this.state;
    if(WellBetAmount > 0) {
      console.log("trying to bet "+WellBetAmount);
      let response = await contracts.Well.methods.bet(WellBetAmount*CLVscalar).send();
    }
    this.fetchWellInfo();
  };

  addToPot = async() => {
    const{web3, accounts, contracts, CLVscalar} = this.state;
    let amount = 1*CLVscalar;
    let response = await contracts.Well.methods.addToPot(amount).send();
  };

  startNextGame = async() => {
    const{web3, contracts} = this.state;
    let response = await contracts.Well.methods.startNextRound().send();
    this.fetchWellInfo();
  };
  
  withdrawWell = async() => {
    const{web3, accounts, contracts} = this.state;
    let response = await contracts.Well.methods.withdrawWinnings().send();
  };

  countdownCallback = (totalSecondsLeft) => {
    this.setState({
      wellTotalSecondsLeft: totalSecondsLeft
    });
  }
  
  handleChange = async (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    await this.setState({
      [ name ]: value,
    });
  };
  
  submitFormBet(e) {
    e.preventDefault();
    if((this.state.roundOver || (this.state.timeLeft<=0))){
      console.log("starting next game");
      this.startNextGame();
    } else{
      console.log("Try to bet: "+this.state.WellBetAmount);
      if(parseFloat(this.state.WellBetAmount)>0){
       this.bet();
      }
    }
  };
/*
 * p
          <Button color="primary" onClick={toggleMoreInfo} style={{ marginBottom: '1rem' }}>Toggle</Button>
          <Collapse isOpen={isOpenMoreInfo}>
            <h2>DONG</h2>
          </Collapse>
          */
  render() {
    //const [isOpen, setIsOpen] = useState(false);
    //const toggle= () => setIsOpen(!isOpen);
    const {WellBetAmount} = this.state;

    return (
        <div className="station">
          <h2>Wishing Well</h2>
          <Countdown endTime={this.state.roundEndTime} parentCallback={this.countdownCallback} > </Countdown>
          <h3>Big Pot Every {this.state.bigPotFrequency} rounds</h3>
          <p>Well User allowance: {this.state.wellUserAllowance}</p>
          <p>Well Pot: {this.state.wellPot}</p>
          <p>Well CLV bal: {this.state.wellCLVBalance}</p>
          <p>MinimumBet: {this.state.minBet}</p>
          <p>Well Round Num: {this.state.wellRoundNumber}</p>
          <p>Plays this round: {this.state.wellPlays}</p>
          <p>Last Player: {this.state.lastPlayer}</p>
          <p>Last Winner: {this.state.lastWinner}</p>
          <p>RoundEndTime: {this.state.roundEndTime}</p>
          <p>TimeLeft: {this.state.wellDaysLeft} days, {this.state.wellHoursLeft} hours, {this.state.wellMinutesLeft} mins, {this.state.wellSecondsLeft} secs</p>
          <p>C2D balance: {this.state.wellC2Dbalance}</p>
          <p>C2D dividends: {this.state.wellC2Ddividends}</p>
          <p>User winnings: {this.state.wellUserWinnings}</p>
          <Button onClick={this.withdrawWell}>Withdraw</Button>
          {parseFloat(WellBetAmount) > parseFloat(this.state.wellUserAllowance) && <Button onClick={this.CLVapproveWell}>Approve</Button>}

          <Form className="form" onSubmit={ (e) => this.submitFormBet(e) }>
          <Col>
            <FormGroup>
              <Label>Amount to Bet</Label>
              <Input
                name="WellBetAmount"
                type="number"
                id="inputWellBetAmount"
                placeholder = {100}
                value={WellBetAmount}
                onChange={ (e) => {
                            this.handleChange(e);
                          } }
              />
              <Button>{this.state.wellTotalSecondsLeft <= 0 ? "StartNextGame" : "Bet" }</Button>
            </FormGroup>
          </Col>
          </Form>
          <p>Use button below to prime pot with CLV in the event that there is no CLV in the pot. Does not count as a bet.</p>
          <Button onClick={this.addToPot}>add 1CLV to pot (does not count as a bet)</Button>        
        </div>

    );
  }
}

export default WellInterface;
