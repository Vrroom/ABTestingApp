import React, { Component } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form"; // Added import
import IconButton from "./iconbutton";
import PageTransition from "./transition";
import { postData } from "../utils/post";
import { Fireworks } from "fireworks-js/dist/react";

class TextSurvey extends Component {
  constructor(props) {
    super(props);
  }

  postRatings = () => {
    const { setHighlight, setShowNext } = this.props;
    const responses = [0, 1, 2, 3].map((qnum) => {
      const text = document.getElementById(`textbox-${qnum}`).value;
      return text;
    });
    postData("/survey", responses);
    setShowNext(true);
    setHighlight(true);
  };

  componentWillUnmount() {
    const { setHighlight, setShowNext } = this.props;
    setHighlight(false);
    setShowNext(false);
  }

  render() {
    const questions = [
      // "Please describe your background", 
      // "What does photo-realism mean to you?",
      // "What would you like to do with this technology?",
      // "What are the potential problems with this technology?",
    ];
    return (
      <>
        <Row className="py-2 justify-content-center">
          <Col className="d-flex justify-content-center col-12">
            <h4>Thank you for participating!</h4>
          </Col>
        </Row>
        <Row className="py-2 justify-content-center">
          <Col className="d-flex justify-content-center col-12">
            <p>You can now close this window</p>
          </Col>
        </Row>
        <Row className="py-2 align-items-center">
          <Col className="d-flex justify-content-center">
            <ListGroup variant="flush">
              {questions.map((question, index) => (
                <ListGroup.Item className="py-2" key={index}>
                  <Form.Group controlId={`textbox-${index}`}>
                    <Form.Label>{question}</Form.Label>
                    <Form.Control as="textarea" rows={3} />
                  </Form.Group>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
        </Row>
        <Row>
        <Fireworks/>
        </Row>
      </>
    );
  }
}

export default TextSurvey;

