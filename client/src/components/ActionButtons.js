import React from 'react';
import axios from 'axios';

export default class ActionButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
      success: ''
    };
  }

  handleAnswerAccept = async e => {
    const { aId, qId, contract, account } = this.props;

    let tx = await contract.methods.acceptAnswer(aId).send({
      from: account
    });

    let winner = tx.events.answerAccepted.returnValues.winner;
    console.log(winner);

    axios
      .post('http://127.0.0.1:8080/acceptAnswer', {
        aId,
        qId,
        winner
      })
      .then(res => {
        this.setState({ disabled: true, success: 'Winning answer selected!' });
      })
      .catch(e => console.log(e));
  };

  render() {
    const { disabled } = this.state;

    return (
      <React.Fragment>
        <input
          type="button"
          name="accept"
          className="btn btn-success"
          value="Accept"
          disabled={disabled}
          onClick={this.handleAnswerAccept}
        />
        <br />
        {this.state.success}
      </React.Fragment>
    );
  }
}
