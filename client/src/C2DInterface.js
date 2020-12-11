import React, { Component } from 'react';
import {
  Container, Col, Form,
  FormGroup, Label, Input,
  Button, FormText, FormFeedback,
} from 'reactstrap';
import './Station.css'
class C2DInterface extends Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      web3: props.web3,
      accounts: props.accounts,
      addresses: props.addresses,
      contracts: props.contracts,
      CLVscalar: props.CLVscalar,
      c2dBuyPrice: 0, c2dSellPrice:0, c2dBal: 0, c2dDividends: 0, 
      CLVtoSell: 0, C2DtoSell: 0, c2dUserAllowance: 0,
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
      () => this.fetchC2DInfo(),
      5000
    );
    this.fetchC2DInfo();
  }
  componentWillUnmount() {
    clearInterval(this.timerID);
  }


  
  fetchC2DInfo = async () => {
    const{accounts, contracts, web3} = this.state;
    const response = await contracts.C2D.methods.allInfoFor(accounts[0]).call();
    this.setState({
      clvBal: web3.utils.fromWei(response.userCLV, "mwei"),
      c2dUserAllowance: web3.utils.fromWei(response.userAllowance, "mwei"),
      c2dBal: web3.utils.fromWei(response.userBalance, "ether"),
      c2dBuyPrice: web3.utils.fromWei(response.buyPrice, "mwei"),
      c2dSellPrice: web3.utils.fromWei(response.sellPrice, "mwei"),
      c2dDividends: web3.utils.fromWei(response.userDividends, "mwei"),
      c2dTotalSupply: web3.utils.fromWei(response.totalTokenSupply, "ether")
    });
    //console.log("total c2d supply: "+web3.utils.fromWei(response.totalTokenSupply, "ether"));
    //console.log("You CLV wallet has an allowance to C2D of: "+this.state.c2dUserAllowance); 
  };
  
  CLVapproveC2D = async() => {
    const{accounts, contracts, addresses} = this.state;
    //only do this is you need methods
    await contracts.C2D.methods.approve(addresses.C2D, 1e12).send();
    this.fetchC2DInfo();
  };

  buyC2D = async () => {
    const{web3, contracts, CLVtoSell} = this.state;
    if(CLVtoSell>0){
      //convert
      let amount = web3.utils.toWei(CLVtoSell, "mwei");
      
      await contracts.C2D.methods.buy(amount).send();
      this.fetchC2DInfo();
    }
  };

  sellC2D = async() => {
    const{web3, contracts, C2DtoSell} = this.state;
    if(C2DtoSell>0){
      let amount = web3.utils.toWei(C2DtoSell, 'ether');
      console.log("sell "+amount+" C2D");
      console.log("have "+web3.utils.toWei(this.state.c2dBal, 'ether')+" C2D");
      await contracts.C2D.methods.sell(amount).send();
      this.fetchC2DInfo();
    }
  };

  reinvestC2D = async() => {
    const{web3, contracts, c2dDividends} = this.state;
    if(c2dDividends>0){
      console.log("Reinvesting dividends")
      await contracts.C2D.methods.reinvest().send();
      this.fetchC2DInfo();
    }
  }
  widthdrawDivsC2D = async() => {
    const{web3, contracts, c2dDividends} = this.state;
    if(c2dDividends>0){
      console.log("Withdrawing dividends")
      await contracts.C2D.methods.withdraw().send();
      this.fetchC2DInfo();
    }
  }

  handleChange = async (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    await this.setState({
      [ name ]: value,
    });
  };
  
  submitFormSwapCLVtoC2D(e) {
    e.preventDefault();
    if(parseFloat(this.state.c2dUserAllowance) < parseFloat(this.state.CLVtoSell)){
      this.CLVapproveC2D();
    } else{
      console.log("Going to swap CLV: "+this.state.CLVtoSell*this.state.CLVscalar + " with allowance "+this.state.c2dUserAllowance);
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

  render() {
    const {CLVtoSell, C2DtoSell} = this.state;
    return (
        <div className="station">
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

    );
  }
}

export default C2DInterface;
