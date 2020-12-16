import React, { Component } from "react";

import { isMobile } from "react-device-detect";

import { Tabs, Tab, Form, Button, Col, InputGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

class WellInfo extends Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      addresses: props.addresses,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.addresses != this.props.addresses) {
      this.setState({
        addresses: this.props.addresses,
      });
    }
  }

  componentDidMount() {}
  componentWillUnmount() {}

  shortenAddress(addy) {
    if (addy == null) {
      return "0x00...000";
    }
    let str = addy.slice(0, 4) + "..." + addy.slice(-3);
    return str;
  }
  render() {
    const { addresses } = this.state;
    return (
      <div>
        <h2>Wishing Well</h2>
        <p>
          <a href="https://t.me/clvfi">Telegram</a>
        </p>
        <p>Contracts</p>
        <ul>
          <li>
            CLV:{" "}
            <a href={"https://rinkeby.etherscan.io/address/" + addresses.CLV}>
              {this.shortenAddress(addresses.CLV)}
            </a>
          </li>
          <li>
            C2D:{" "}
            <a href={"https://rinkeby.etherscan.io/address/" + addresses.C2D}>
              {this.shortenAddress(addresses.C2D)}
            </a>
          </li>
          <li>
            WishingWell:{" "}
            <a href={"https://rinkeby.etherscan.io/address/" + addresses.Well}>
              {this.shortenAddress(addresses.Well)}
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

export default WellInfo;
