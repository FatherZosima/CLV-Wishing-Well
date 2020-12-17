import React, { Component } from "react";

import { Container, Col, Row } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { Bounce } from "react-awesome-reveal";

import "./WellInfo.css";

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

  InfoCol = (props) => {
    let object = "";
    object = props.text;
    if (props.bold) {
      object = <b>{object}</b>;
    }
    if (props.link) {
      object = <a href={props.link}>{object}</a>;
    }
    return (
      <Col>
        <Bounce triggerOnce={true} className="InfoCol">
          {object}
        </Bounce>
      </Col>
    );
  };

  render() {
    const { addresses } = this.state;
    return (
      <div className="WellInfo">
        <h1>Clover Wishing Well</h1>
        <p>
          The <b>Wishing Well</b> is a winner-take-all gambling platform, played
          using <a href="http://cloverprotocol.biz">Clover.</a> The last player
          to place a bet before the timer runs out wins all the other bets
          placed that round.
        </p>
        <h3>Gameplay</h3>
        <p>
          Each round starts with a minimum of 1CLV and 10 minute timer. Pot of Gold rounds start with 1 CLV + the profits from selling the Well's stored C2D. If the current round is over and the next round has not begun, you can start it by enter the amount you want to bet, and then clicking "Start Round". When a round starts, the previous round is finalized, and the winnings are sent to the last player's holdings.
          <br />
          <br />
          The minimum bet starts at 0.222222 CLV. As the round progresses, it increases to 1% of the current pot.
          While a round is active, users can bet&nbsp;
          <a href="http://cloverprotocol.biz">CLV</a>.&nbsp;
          <b>Betting CLV sends tokens to the Well's pot</b>. When a bet is placed, the
          remaining time increases by 5 minutes, or 1 minute if the player makes
          multiple conseuctive bets. When the time remaining hits 0, the last
          player wins.
          <br />
          <br />
          After each round, 5% of the winnings are invested in <a href="http://clv2d.cloverprotocol.biz">C2D</a>. The balance builds with each round, while also generating dividends for those holding C2D. Every 50 rounds, the C2D is sold, and the proceeds are fed back into the giant <b>Pot of Gold</b>. The winner takes everything minus the game fees (5% + 1 CLV to start the next round).
          <br />

          Play continues forever.
        </p>
        <h3>Winning Strategies</h3>
        <ol>
          <li>Bet big, bet often, bet when others aren't playing</li>
          <li>
            Invest in <a href="http://clv2d.cloverprotocol.biz">C2D</a> and make
            dividends on the Well's gameplay
          </li>
          <li>
            Provide <a href="http://clv3.cloverprotocol.biz">liquidity</a> for
            players
          </li>
        </ol>
        <Container fluid>
          <Row>
            <this.InfoCol text="Contracts" bold />
          </Row>
          <Row>
            <this.InfoCol
              link={"https://rinkeby.etherscan.io/address/" + addresses.CLV}
              text="CLV"
            />
            <this.InfoCol
              link={"https://rinkeby.etherscan.io/address/" + addresses.C2D}
              text="C2D"
            />
            <this.InfoCol
              link={"https://rinkeby.etherscan.io/address/" + addresses.Well}
              text="Well"
            />
          </Row>
          <Row>
            <this.InfoCol link="https://t.me/clvfi" text="Telegram" bold />
          </Row>
        </Container>
      </div>
    );
  }
}

export default WellInfo;
