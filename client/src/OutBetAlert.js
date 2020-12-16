import React, { Component } from "react";

import { Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

class OutBetAlert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wasOutBet: props.wasOutBet,
      show: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.wasOutBet !== this.props.wasOutBet) {
      this.setState({
        wasOutBet: this.props.wasOutBet,
      });
      console.log(
        "outbid changed to " +
          this.state.wasOutBet +
          " props " +
          this.props.wasOutBet +
          " show is currently " +
          this.state.show
      );
      if (!this.state.show && this.props.wasOutBet) {
        this.setState({ show: true });
        console.log("show changed to " + this.state.show);
      }
    }
  }

  componentDidMount() {}
  componentWillUnmount() {}

  render() {
    const { wasOutBid, show } = this.state;
    if (show) {
      return (
        <Alert
          variant="danger"
          onClose={() => this.setState({ show: false })}
          dismissible
        >
          <Alert.Heading>OhSnap, someone beat you</Alert.Heading>
          <p>Bet again to win.</p>
        </Alert>
      );
    }
    return null;
  }
}

export default OutBetAlert;
