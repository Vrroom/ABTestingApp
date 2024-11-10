import React, { Component } from "react";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ConsentForm from "./consentform";
import PageTransition from "./transition";
import { postData } from "../utils/post";

class EntryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      allowNext: false,
      validated: false,
    };
  }

  onScroll = () => {
    const body = document.getElementById("informed-consent");
    if (body.scrollTop + body.clientHeight >= body.scrollHeight - 10) {
      this.setState((prevState) => {
        const { page, validated } = prevState;
        if (page === 0) {
          return { allowNext: true };
        }
      });
    }
  };

  handleNext = (event) => {
    this.setState((prevState) => {
      const form = document.getElementById("turker-form");
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
        return { validated: true};
      } else {
        const [email] = form.elements
        const { completeEntry } = this.props;
        postData("/validate", {
          email: email.value,
        }).then((res) => completeEntry(res));
      }
    });
  };

  render() {
    const { allowNext, page, validated } = this.state;
    return (
      <Modal show={true} size="lg" centered scrollable animation>
        <Modal.Header>
          <Modal.Title>
            <Container className="px-5">
              <Row>
                <Col md="auto"> Welcome to Portrait Relighting! </Col>
              </Row>
            </Container>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          key="informed-consent"
          id="informed-consent"
          onScroll={this.onScroll}
        >
            <ConsentForm validated={validated} />
        </Modal.Body>
        <Modal.Footer>
          <Button disabled={!allowNext} onClick={this.handleNext}>
            Next
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default EntryModal;
