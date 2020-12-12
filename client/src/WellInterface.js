import React, { Component, useState } from 'react';
import {
  Container, Col, Form,
  FormGroup, Label, Input,
  Button, FormText, FormFeedback,
  Collapse,
  Progress
} from 'reactstrap';
import './WishingWell.css'
import Countdown from './Countdown.js';
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
  buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import AnimatedNumber from 'react-animated-number';

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
    this.shortenAddress(response.lastPlayer);
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

  shortenAddress(addy){
    if(addy==null){
      return "0x00...000"
    }
    let str = addy.slice(0,4)+"..."+addy.slice(-3);
    return str;
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
    const {WellBetAmount, wellTotalSecondsLeft, bigPotFrequency, wellRoundNumber} = this.state;

    return (
        <div className="WellStation">
          <h2 >Wishing Well</h2>
           <CircularProgressbarWithChildren
        value={(wellRoundNumber%bigPotFrequency)/bigPotFrequency * 100}
        strokeWidth={3}
        styles={buildStyles({
          pathColor: "#D4Af37",
          trailColor: "transparent"
        })}
      >
        {/*
          Width here needs to be (100 - 2 * strokeWidth)% 
          in order to fit exactly inside the outer progressbar.
        */}
        <div style={{ width: "94%" }}>
          <CircularProgressbarWithChildren
            className="statusCircle"
            value={wellTotalSecondsLeft/(5*60)*100}
            strokeWidth={5}
            background
            styles={buildStyles({
              backgroundColor: "rgba(0,0,0,0.5)",
              pathColor: "#f00",
              trailColor: "transparent"
            })}
          >
            <h4>
                    <AnimatedNumber
                        style={{
                            transition: '0.8s ease-out',
                            transitionProperty:
                                'background-color, color'
                        }}
                        frameStyle={perc => (
                            perc === 100 ? {} : {backgroundColor: '#66cc33'}
                        )}
                        stepPrecision={0.1}
                        value={this.state.wellPot}
                      formatValue={n => `Current Pot: ${n.toFixed(2)} CLV `}/>
          </h4>
          <Countdown endTime={this.state.roundEndTime} parentCallback={this.countdownCallback} > </Countdown>
          <h3>Round {wellRoundNumber}</h3>
          <p>{bigPotFrequency-(wellRoundNumber%bigPotFrequency) != 1 ? 
             "Pot of Gold in " + Number(bigPotFrequency - (wellRoundNumber%bigPotFrequency)) + " rounds" : "Pot of Gold starting next round" }</p>
          </CircularProgressbarWithChildren>
        </div>
      </CircularProgressbarWithChildren>
          <p>Well Pot: {this.state.wellPot}</p>
          <p>MinimumBet: {this.state.minBet}</p>
          <p>Well Round Num: {this.state.wellRoundNumber}</p>
          <p>Plays this round: {this.state.wellPlays}</p>
          <p>Last Player: <a href={"https://rinkeby.etherscan.io/address/"+this.state.lastPlayer}>{this.shortenAddress(this.state.lastPlayer)}</a></p>
          <p>Last Winner: <a href={"https://rinkeby.etherscan.io/address/"+this.state.lastWinner}>{this.shortenAddress(this.state.lastWinner)}</a></p>
          <p>C2D balance: {parseFloat(this.state.wellC2Dbalance).toFixed(2)}</p>
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
          <p>Well User allowance: {this.state.wellUserAllowance}</p>
          <p>Well CLV bal: {this.state.wellCLVBalance}</p>
          <p>C2D dividends: {parseFloat(this.state.wellC2Ddividends).toFixed(2)}</p>
          <p>Use button below to prime pot with CLV in the event that there is no CLV in the pot. Does not count as a bet.</p>
          <Button onClick={this.addToPot}>add 1CLV to pot (does not count as a bet)</Button>        
        </div>

    );
  }
}

export default WellInterface;
