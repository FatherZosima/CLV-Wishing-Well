import React, { Component } from "react";
import {
  Container, Col, Form,
  FormGroup, Label, Input,
  Button, FormText, FormFeedback,
} from 'reactstrap';
import CLVContract from "./contracts/Clover.json";
import CLV2DContract from "./contracts/CLV2D.json";
import CLVWellContract from "./contracts/RandomWell.json";
import BankContract from "./contracts/Bank.json";

import getWeb3 from "./getWeb3";

import "./App.css";

const CLVscalar = 1000000; //6 decimals


class App extends Component {
  state = { storageValue: 0, clvBal: 0, clvToMint:0, ethBal: 0,
    c2dBuyPrice: 0, c2dSellPrice:0, c2dBal: 0, c2dDividends: 0, 
    CLVtoSell: 0, C2DtoSell: 0, 
    wellDaysLeft: 0, wellHoursLeft: 0, wellMinutesLeft:0, wellSecondsLeft:0, 
    roundEndTime:0, minBet:0,
    WellBetAmount:0,
    c2dUserAllowance: 0,
    web3: null, accounts: null, 
    CLVcontract: null, CLV2Dcontract:null, CLVWellcontract: null,
    clvAddress: null, c2dAddress:null, clvWellAddress: null,

    Bankcontract:null, bankAddress:null, bankBalance:0, bankCLVallowance:0
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

      const BankDeployedNetwork = BankContract.networks[networkId];
      const Bankinstance = new web3.eth.Contract(
        BankContract.abi,
        BankDeployedNetwork && BankDeployedNetwork.address, {from:accounts[0]}
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
        Bankcontract: Bankinstance,
        bankAddress: BankDeployedNetwork.address,
      });
      console.log(this.state);
      this.getAccountETHBal();
      this.fetchC2DInfo();
      this.fetchWellInfo();
      this.bankInfo();
      setInterval(() => {   this.calcTimeRemaining()    }, 1000);
      setInterval(() => {   this.fetchWellInfo()    }, 10000);

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
    if(this.state.c2dUserAllowance < 100){
      await CLVcontract.methods.approve(this.state.c2dAddress, 1e12).send();
      this.fetchC2DInfo();
    } 
  };

  CLVapproveWell = async() => {
    const{accounts, clvWellAddress, CLVcontract} = this.state;
    //only do this is you need methods
    if(this.state.wellUserAllowance < 100){
      await CLVcontract.methods.approve(this.state.clvWellAddress, 1e12).send();
      this.fetchWellInfo();
    } 
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
      c2dDividends: web3.utils.fromWei(response.userDividends, "mwei") 
    });
    //let convert = 
    console.log("total c2d supply: "+web3.utils.fromWei(response.totalTokenSupply, "ether"));

    console.log(this.state);
  };



  approveC2D = async () => {
    const{accounts, web3, CLV2Dcontract, CLVcontract} = this.state;
    await CLV2Dcontract.methods.approve(this.state.clvAddress, 1e12).send();

    let resp = await CLV2Dcontract.methods.allowance(accounts[0], this.state.clvAddress);
    console.log(resp);
    let resp1 = await CLV2Dcontract.methods.allowance(accounts[0], this.state.c2dAddress);
    console.log(resp1);
  };

  transferCLV = async() => {
    const{accounts, web3, CLVcontract} = this.state;
    let resp = await CLVcontract.methods.transfer("0x9B99a11233cCfBe05d84914fD8857a25dA327892", 5*CLVscalar).send();
    console.log(resp);
  }

  transferC2D = async() => {
    const{accounts, web3, CLV2Dcontract} = this.state;
    let resp = await CLV2Dcontract.methods.transfer("0x4195A1b06Ad321829B5E4Cb047f6e84254FD282e", web3.utils.toWei('50', "ether")).send();
    console.log(resp);
  }

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
    console.log(response);
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
    });
    this.calcTimeRemaining();
  };
  
  calcTimeRemaining = async () => {
    let endTime = new Date(this.state.roundEndTime*1000);//mult by 1000 to go to milliseconds
    let now = new Date();
    let timeLeft = endTime - now;
    if(timeLeft<0) timeLeft = 0;
    var daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    var hoursLeft = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    var minutesLeft = Math.floor((timeLeft / 1000) / 60 % 60);
    var secondsLeft = Math.floor((timeLeft / 1000)%60);
    this.setState({
      wellDaysLeft: daysLeft,
      wellHoursLeft: hoursLeft,
      wellMinutesLeft: minutesLeft,
      wellSecondsLeft: secondsLeft,
      wellTotalSecondsLeft: timeLeft/1000
    })

  }

  bet = async() => {
    const{web3, CLVWellcontract, WellBetAmount} = this.state;
    if(WellBetAmount > 0) {
      console.log("trying to bet "+WellBetAmount);
      let response = await CLVWellcontract.methods.bet(WellBetAmount*CLVscalar).send();
      console.log(response);
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
  };
  
  withdrawWell = async() => {
    const{web3, accounts, CLVWellcontract} = this.state;
    let response = await CLVWellcontract.methods.withdrawWinnings().send();
    this.fetchWellInfo();
  };

//bank stuff. remove if works
  withdrawBank = async() => {
    const{web3, accounts, Bankcontract} = this.state;
    await Bankcontract.methods.withdraw().send();
    this.bankInfo();
  }
  depositBank = async() => {
    const{web3, accounts, Bankcontract} = this.state;
    let amt = 5 *CLVscalar;
    console.log("trying to depost: "+amt);
    await Bankcontract.methods.deposit(amt).send();
    this.bankInfo();
  }
  bankInfo = async() => {
    const{web3, accounts, Bankcontract} = this.state;
    let response = await Bankcontract.methods.bankInfo(accounts[0]).call();
    console.log(response);
    this.setState({
      bankUserBankCLVallowance: response.userAllowance/CLVscalar,
      bankBankUserCLVallowance: response.bankAllowance/CLVscalar,
      bankBalance: response.bankBalance/CLVscalar
    })
  }
  approveBank = async() => {
    const{web3, accounts, CLVcontract, Bankcontract} = this.state;
    await CLVcontract.methods.approve(this.state.bankAddress, 1e12).send();
    //await CLVcontract.methods.approve("0x4195A1b06Ad321829B5E4Cb047f6e84254FD282e", 1e12).send();
    //await Bankcontract.methods.approve(accounts[0], 1e12).send();
    this.bankInfo();
  }

  handleChange = async (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    await this.setState({
      [ name ]: value,
    });
    console.log(target.value);
  };

  submitFormMint(e) {
    e.preventDefault();
    this.mintCLV();
  };
  submitFormSwapCLVtoC2D(e) {
    e.preventDefault();
    if(this.state.c2dUserAllowance < 100){
       this.CLVapproveC2D();
    } else{
      console.log("Going to swap CLV: "+this.state.CLVtoSell + " with allowance "+this.state.c2dUserAllowance);
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
      if(this.state.WellBetAmount>0){
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
        <p>Bank address: {this.state.bankAddress} <a href={"https://rinkeby.etherscan.io/address/"+this.state.bankAddress}>link</a></p>
        <div id="CLVstation">
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
        <Button onClick={this.transferCLV}>transfer CLV</Button>
        </div>


        <div id="C2Dstation">
          <h2>C2D station</h2>
          <p>Buy: {this.state.c2dBuyPrice} CLV per C2D</p>
          <p>Sell: {this.state.c2dSellPrice} CLV per C2D</p>
          <p>Dividends: {this.state.c2dDividends} CLV</p><Button onClick={this.reinvestC2D}>reinvest</Button>
          <Button onClick={this.widthdrawDivsC2D}>withdrawDivs</Button>
          <Button onClick={this.transferC2D}>transfer</Button>
          <p>C2D owned: {this.state.c2dBal}</p>
          <Form className="form" onSubmit={ (e) => this.submitFormSwapCLVtoC2D(e) }>
          <Col>
            <FormGroup>
              <Label>Swap CLV to C2D</Label>
              <Input
                name="CLVtoSell"
                type="number"
                id="inputCLVtoSell"
                placeholder = {100}
                value={CLVtoSell}
                onChange={ (e) => {
                            this.handleChange(e);
                          } }
              />
            <Button>{this.state.c2dUserAllowance < 100 ? "Approve" : "Swap" }</Button>
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
                placeholder = {100}
                value={C2DtoSell}
                onChange={ (e) => {
                            this.handleChange(e);
                          } }
              />
            <Button>Swap</Button>
            </FormGroup>
          </Col>
          </Form>
          <Button onClick={this.approveC2D}>approve c2d</Button>

        </div>

        <div id="Wellstation">
          <h2>Wishing Well</h2>
          <p>Well User allowance: {this.state.wellUserAllowance}</p>
          <p>Well Pot: {this.state.wellPot}</p>
          <p>Well CLV bal: {this.state.wellCLVBalance}</p>
          <p>MinimumBet: {this.state.minBet}</p>
          <p>Well Round Num: {this.state.wellRoundNumber}</p>
          <p>Plays this round: {this.state.wellPlays}</p>
          <p>Last Player: {this.state.lastPlayer}</p>
          <p>Last Winner: {this.state.lastWinner}</p>
          <p>TimeLeft: {this.state.wellDaysLeft} days, {this.state.wellHoursLeft} hours, {this.state.wellMinutesLeft} mins, {this.state.wellSecondsLeft} secs</p>
          <p>C2D balance: {this.state.wellC2Dbal}</p>
          <p>C2D dividends: {this.state.wellC2Ddividends}</p>
          <p>User winnings: {this.state.wellUserWinnings}</p>
          <Button onClick={this.withdrawWell}>Withdraw</Button>
          <Button onClick={this.CLVapproveWell}>Approve</Button>

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
          <Button onClick={this.addToPot}>add 1CLV to pot</Button>        
        </div>

        <div id="Wellstation">
          <h2>Bank</h2>
          <p>Bank Balance: {this.state.bankBalance}</p>
          <p>Bank user-bank allowance: {this.state.bankUserBankCLVallowance}</p>
          <p>Bank bank-user allowance: {this.state.bankBankUserCLVallowance}</p>
          <Button onClick={this.depositBank}>Depost 5CLV</Button>
          <Button onClick={this.withdrawBank}>Withdraw All</Button>
          <Button onClick={this.approveBank}>Approve</Button>
        </div>
      </div>
    );
  }
}

export default App;
