import React, { Component } from 'react';
import {
  Container, Col, Form,
  FormGroup, Label, Input,
  Button, FormText, FormFeedback,
} from 'reactstrap';
import './Station.css'
class CloverInterface extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: props.web3,
      accounts: props.accounts,
      CLVcontract: props.CLVcontract,
      CLVscalar: props.CLVscalar,
      clvToMint: 0
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
      () => this.fetchCLVbalance(),
      5000
    );
    this.fetchCLVbalance();
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {    
    this.calculateRemainingTime();
  }

  fetchCLVbalance = async () => {
    const { accounts, CLVcontract, clvToMint, CLVscalar } = this.state;
    // Get the value from the contract to prove it worked.
    const response = await CLVcontract.methods.balanceOf(accounts[0]).call();
    // Update state with the result.
    this.setState({
      clvBal: this.state.web3.utils.fromWei(response, "mwei"),
    });
  }

  mintCLV = async () => {
    const { accounts, CLVcontract, clvToMint, CLVscalar } = this.state;
    //console.log(CLVcontract);
    var amount = clvToMint*CLVscalar;//must multiply bc CLV has 6 decimals
    //first add me to minters
    console.log("going to mint: "+amount );
    
    await CLVcontract.methods.mint(accounts[0], amount).send();
    this.fetchCLVbalance();
  };

  submitFormMint(e) {
    e.preventDefault();
    this.mintCLV();
  };
  
  handleChange = async (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    await this.setState({
      [ name ]: value,
    });
  };

  render() {
    return (
        <div className="station">
          <h2>CLV station</h2>
          <p>You currently own: {this.state.clvBal}CLV</p>
          <Form className="form" onSubmit={ (e) => this.submitFormMint(e) }>
            <Col>
              <FormGroup>
                <Label>Amount to Mint</Label>
                <Input
                name="clvToMint"
                type="number"
                id="inputClvToMint"
                placeholder = {this.state.clvBal}
                value={this.state.clvToMint}
                onChange={ (e) => {
                            this.handleChange(e);
                          } }
                />
                <Button>Mint Clv</Button>
              </FormGroup>
            </Col>
          </Form> 
        </div>
    );
  }
}

export default CloverInterface;
