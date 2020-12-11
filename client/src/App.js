import React, { Component } from "react";
import {
  Container, Col, Form,
  FormGroup, Label, Input,
  Button, FormText, FormFeedback,
} from 'reactstrap';
import Countdown from './Countdown.js';
import CLVContract from "./contracts/Clover.json";
import CLV2DContract from "./contracts/CLV2D.json";
import CLVWellContract from "./contracts/RandomWell.json";

import getWeb3 from "./getWeb3";

import "./App.css";

const CLVscalar = 1000000; //6 decimals


class App extends Component {
  state = { storageValue: 0, clvBal: 0, clvToMint:0, ethBal: 0,
    c2dBuyPrice: 0, c2dSellPrice:0, c2dBal: 0, c2dDividends: 0, 
    CLVtoSell: 0, C2DtoSell: 0, 
    wellDaysLeft: 0, wellHoursLeft: 0, wellMinutesLeft:0, wellSecondsLeft:0, wellC2Dbalance:0, wellC2Ddividends:0,
    roundEndTime:0, minBet:0,
    WellBetAmount:0,
    c2dUserAllowance: 0,
    web3: null, accounts: null, 
    CLVcontract: null, CLV2Dcontract:null, CLVWellcontract: null,
    clvAddress: null, c2dAddress:null, clvWellAddress: null,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      console.log(networkId);


      const CLVdeployedNetwork = CLVContract.networks[networkId];
      const CLVinstance = new web3.eth.Contract(
        CLVContract.abi,
        CLVdeployedNetwork && CLVdeployedNetwork.address, {from:accounts[0]}
      );
      const CLV2DdeployedNetwork = CLV2DContract.networks[networkId];
      const CLV2Dinstance = new web3.eth.Contract(
        CLV2DContract.abi,
        CLV2DdeployedNetwork && CLV2DdeployedNetwork.address, {from:accounts[0]}
      );
      const CLVWellDeployedNetwork = CLVWellContract.networks[networkId];
      const CLVWellinstance = new web3.eth.Contract(
        CLVWellContract.abi,
        CLVWellDeployedNetwork && CLVWellDeployedNetwork.address, {from:accounts[0]}
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, 
        CLVcontract: CLVinstance,
        CLV2Dcontract: CLV2Dinstance,
        CLVWellcontract: CLVWellinstance,
        clvAddress: CLVdeployedNetwork.address,
        c2dAddress: CLV2DdeployedNetwork.address,
        clvWellAddress: CLVWellDeployedNetwork.address,
      });
      console.log(this.state);
      this.getAccountETHBal();
      this.fetchC2DInfo();
      this.fetchWellInfo();
      setInterval(() => {   this.fetchWellInfo()    }, 5000);

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  getAccountETHBal = async() =>{
    this.state.web3.eth.getBalance(this.state.accounts[0], (err, balance) => {
      this.state.ethBal = this.state.web3.utils.fromWei(balance, "ether")
      console.log("recieved: "+this.state.ethBal);
    });
    console.log(this.state.accounts[0]);
    console.log("ETHBAL: "+this.state.ethBal);
  };

  setAllowCLV = async() => {
    const { accounts, CLVcontract} = this.state;
    console.log("trying");
    await CLVcontract.methods.setAllow().send();
  }

  mintCLV = async () => {
    const { accounts, CLVcontract, clvToMint } = this.state;
    //console.log(CLVcontract);
    console.log("going to mint: "+clvToMint );
    var amount = clvToMint*CLVscalar;//must multiply bc CLV has 6 decimals
    //first add me to minters
    //await CLVcontract.methods.addMinter(accounts[0]).send({from: accounts[0]});
    //await CLVcontract.methods.balanceOf(accounts[0]).class-extends
    await CLVcontract.methods.mint(accounts[0], amount).send();
    // Get the value from the contract to prove it worked.
    const response = await CLVcontract.methods.balanceOf(accounts[0]).call();
    // Update state with the result.
    this.setState({
      clvBal: this.state.web3.utils.fromWei(response, "mwei"),
    });
    this.fetchC2DInfo();
  };

  CLVapproveC2D = async() => {
    const{accounts, CLV2Dcontract, CLVcontract} = this.state;
    //only do this is you need methods
    await CLVcontract.methods.approve(this.state.c2dAddress, 1e12).send();
    this.fetchC2DInfo();
  };

  CLVapproveWell = async() => {
    const{accounts, clvWellAddress, CLVcontract} = this.state;
    //only do this is you need methods
    await CLVcontract.methods.approve(this.state.clvWellAddress, 1e12).send();
    this.fetchWellInfo();
  };


  fetchC2DInfo = async () => {
    const{accounts, CLV2Dcontract, web3} = this.state;
    console.log(CLV2Dcontract.methods);
    const response = await CLV2Dcontract.methods.allInfoFor(accounts[0]).call();
    console.log(response);
    this.setState({
      clvBal: web3.utils.fromWei(response.userCLV, "mwei"),
      c2dUserAllowance: web3.utils.fromWei(response.userAllowance, "mwei"),
      c2dBal: web3.utils.fromWei(response.userBalance, "ether"),
      c2dBuyPrice: web3.utils.fromWei(response.buyPrice, "mwei"),
      c2dSellPrice: web3.utils.fromWei(response.sellPrice, "mwei"),
      c2dDividends: web3.utils.fromWei(response.userDividends, "mwei"),
      c2dTotalSupply: web3.utils.fromWei(response.totalTokenSupply, "ether")
    });
    //let convert = 
    console.log("total c2d supply: "+web3.utils.fromWei(response.totalTokenSupply, "ether"));
    console.log("You CLV wallet has an allowance to C2D of: "+this.state.c2dUserAllowance); 
  };


  buyC2D = async () => {
    const{web3, CLV2Dcontract, CLVtoSell} = this.state;
    if(CLVtoSell>0){
      //convert
      let amount = web3.utils.toWei(CLVtoSell, "mwei");
      
      await CLV2Dcontract.methods.buy(amount).send();
      this.fetchC2DInfo();
    }
  };

  sellC2D = async() => {
    const{web3, CLV2Dcontract, C2DtoSell} = this.state;
    if(C2DtoSell>0){
      let amount = web3.utils.toWei(C2DtoSell, 'ether');
      console.log("sell "+amount+" C2D");
      console.log("have "+web3.utils.toWei(this.state.c2dBal, 'ether')+" C2D");
      await CLV2Dcontract.methods.sell(amount).send();
      this.fetchC2DInfo();
    }
  };

  reinvestC2D = async() => {
    const{web3, CLV2Dcontract, c2dDividends} = this.state;
    if(c2dDividends>0){
      console.log("Reinvesting dividends")
      await CLV2Dcontract.methods.reinvest().send();
      this.fetchC2DInfo();
    }
  }
  widthdrawDivsC2D = async() => {
    const{web3, CLV2Dcontract, c2dDividends} = this.state;
    if(c2dDividends>0){
      console.log("Withdrawing dividends")
      await CLV2Dcontract.methods.withdraw().send();
      this.fetchC2DInfo();
    }
  }

  fetchWellInfo = async() => {
    const{web3, accounts, CLVWellcontract} = this.state;
    const response = await CLVWellcontract.methods.wellInfo(accounts[0]).call();
    this.setState({
      wellPot: response.potBalance/CLVscalar,
      wellRoundNumber: response.roundNumber,
      wellPlays: response.playsThisRound,
      roundEndTime: response.roundEndTime,
      minBet: response.minBet/CLVscalar,
      lastPlayer: response.lastPlayer,
      lastWinner: response.lastWinner,
      roundOver: (new Date(response.roundEndTime) - new Date())>0,
      wellCLVBalance: response.wellBalance/CLVscalar,
      wellUserAllowance: web3.utils.fromWei(response.userAllowance, "mwei"),
      wellUserWinnings: response.userWinnings/CLVscalar,
      wellC2Dbalance: web3.utils.fromWei(response.wellC2Dbalance, "ether"),
      wellC2Ddividends: web3.utils.fromWei(response.wellC2Ddividends, "mwei"),
      bigPotFrequency: response.bigPotFreq
    });
  };
  
  bet = async() => {
    const{web3, CLVWellcontract, WellBetAmount} = this.state;
    if(WellBetAmount > 0) {
      console.log("trying to bet "+WellBetAmount);
      let response = await CLVWellcontract.methods.bet(WellBetAmount*CLVscalar).send();
    }
    this.fetchWellInfo();
  };

  addToPot = async() => {
    const{web3, accounts, CLVWellcontract} = this.state;
    let amount = 1*CLVscalar;
    let response = await CLVWellcontract.methods.addToPot(amount).send();
    console.log(response);
  };

  startNextGame = async() => {
    const{web3, CLVWellcontract} = this.state;
    let response = await CLVWellcontract.methods.startNextRound().send();
    this.fetchWellInfo();
    this.fetchC2DInfo();
  };
  
  withdrawWell = async() => {
    const{web3, accounts, CLVWellcontract} = this.state;
    let response = await CLVWellcontract.methods.withdrawWinnings().send();
    this.fetchWellInfo();
  };


  handleChange = async (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    await this.setState({
      [ name ]: value,
    });
  };

  submitFormMint(e) {
    e.preventDefault();
    this.mintCLV();
  };
  submitFormSwapCLVtoC2D(e) {
    e.preventDefault();
    if(parseFloat(this.state.c2dUserAllowance) < parseFloat(this.state.CLVtoSell)){
      this.CLVapproveC2D();
    } else{
      console.log("Going to swap CLV: "+this.state.CLVtoSell*CLVscalar + " with allowance "+this.state.c2dUserAllowance);
      this.buyC2D();
    }
  };
  submitFormSwapC2DtoCLV(e) {
    e.preventDefault();
    console.log("Trying to swap: "+this.state.C2DtoSell);
    if(this.state.C2DtoSell>0){
      this.sellC2D();
    }
  };
  submitFormBet(e) {
    e.preventDefault();
    if((this.state.roundOver || (this.state.wellTotalSecondsLeft<=0))){
      console.log("starting next game");
      this.startNextGame();
    } else{
      console.log("Try to bet: "+this.state.WellBetAmount);
      if(parseFloat(this.state.WellBetAmount)>0){
       this.bet();
      }
    }
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    const {clvToMint, CLVtoSell, C2DtoSell, WellBetAmount} = this.state;
    return (
      <div className="App">
        <p>CLV address: {this.state.clvAddress} <a href={"https://rinkeby.etherscan.io/token/"+this.state.clvAddress}>link</a></p>
        <p>C2D address: {this.state.c2dAddress} <a href={"https://rinkeby.etherscan.io/token/"+this.state.c2dAddress}>link</a></p>
        <p>CLV Well address: {this.state.clvWellAddress} <a href={"https://rinkeby.etherscan.io/address/"+this.state.clvWellAddress}>link</a></p>
        <div id="main">  
          <Countdown endDate={this.state.roundEndTime} />
        </div>
        <br/>
        <div class="station">
          <h2>CLV station</h2>
          <p>You currently own: {this.state.clvBal}CLV</p>
          <p>You currently own: {this.state.ethBal}ETH</p>
          <Form className="form" onSubmit={ (e) => this.submitFormMint(e) }>
          <Col>
            <FormGroup>
              <Label>Amount to Mint</Label>
              <Input
                name="clvToMint"
                type="number"
                id="inputClvToMint"
                placeholder = {this.state.clvBal}
                value={clvToMint}
                onChange={ (e) => {
                            this.handleChange(e);
                          } }
              />
            <Button>Mint Clv</Button>
            </FormGroup>
          </Col>
        </Form> 
        </div>


        <div class="station">
          <h2>C2D station</h2>
          <p>Buy: {this.state.c2dBuyPrice} CLV per C2D</p>
          <p>Sell: {this.state.c2dSellPrice} CLV per C2D</p>
          <p>Dividends: {this.state.c2dDividends} CLV</p><Button onClick={this.reinvestC2D}>reinvest</Button>
          <Button onClick={this.widthdrawDivsC2D}>withdrawDivs</Button>
          <p>C2D owned: {this.state.c2dBal}</p>
          <p>C2d user allowance: {this.state.c2dUserAllowance}</p>
          <p>Total Supply: {this.state.c2dTotalSupply}</p>
          <Form className="form" onSubmit={ (e) => this.submitFormSwapCLVtoC2D(e) }>
          <Col>
            <FormGroup>
              <Label>Swap CLV to C2D</Label>
              <Input
                name="CLVtoSell"
                type="number"
                id="inputCLVtoSell"
                value={CLVtoSell}
                onChange={ (e) => {
                            this.handleChange(e);
                          } }
              />
            <Button>{parseFloat(this.state.c2dUserAllowance) < parseFloat(CLVtoSell) ? "Approve" : "Swap" }</Button>
            </FormGroup>
          </Col>
          </Form>  
          <Form className="form" onSubmit={ (e) => this.submitFormSwapC2DtoCLV(e) }>
          <Col>
            <FormGroup>
              <Label>Swap C2D to CLV</Label>
              <Input
                name="C2DtoSell"
                type="number"
                id="inputC2DtoSell"
                value={C2DtoSell}
                onChange={ (e) => {
                            this.handleChange(e);
                          } }
              />
            <Button>Swap</Button>
            </FormGroup>
          </Col>
          </Form>

        </div>

        <div class="station">
          <h2>Wishing Well</h2>
          <h3>Big Pot Every {this.state.bigPotFrequency} rounds</h3>
          <p>Well User allowance: {this.state.wellUserAllowance}</p>
          <p>Well Pot: {this.state.wellPot}</p>
          <p>Well CLV bal: {this.state.wellCLVBalance}</p>
          <p>MinimumBet: {this.state.minBet}</p>
          <p>Well Round Num: {this.state.wellRoundNumber}</p>
          <p>Plays this round: {this.state.wellPlays}</p>
          <p>Last Player: {this.state.lastPlayer}</p>
          <p>Last Winner: {this.state.lastWinner}</p>
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
            <Button>{(this.state.roundOver || (this.state.wellTotalSecondsLeft<=0))? "StartNextGame" : "Bet" }</Button>
            </FormGroup>
          </Col>
          </Form>
          <p>Use button below to prime pot with CLV in the event that there is no CLV in the pot. Does not count as a bet.</p>
          <Button onClick={this.addToPot}>add 1CLV to pot (does not count as a bet)</Button>        
        </div>

      </div>
    );
  }
}

export default App;
