import React, { Component } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Likert from "./likert";
import IconButton from "./iconbutton";
import PageTransition from "./transition";
import { postData } from "../utils/post";
import { Fireworks } from "fireworks-js/dist/react";

class Survey extends Component {
  constructor(props) {
    super(props);
  }

  postRatings = () => {
    const { setHighlight, setShowNext } = this.props;
    const ratings = [0, 1, 2, 3].map((qnum) => {
      const opt = [1, 2, 3, 4, 5].filter((option) => {
        const radio = document.getElementById(`likert-${qnum}-${option}`);
        return radio.checked;
      });
      if (opt.length > 0) {
        return opt[0];
      } else {
        return "none";
      }
    });
    postData("/survey", ratings);
    setShowNext(true);
    setHighlight(true);
  };

  componentWillUnmount() {
    const { setHighlight, setShowNext } = this.props;
    setHighlight(false);
    setShowNext(false);
  }

  render() {
    return (
      <>
        <Row className="py-2 justify-content-center">
          <Col className="d-flex justify-content-center col-12">
            <h4>Survey (Part 1)</h4>
          </Col>
        </Row>
        <Row className="py-2 align-items-center">
          <Col className="d-flex justify-content-center">
            <ListGroup variant="flush">
              <ListGroup.Item className="py-2">
                <Likert qnum={0}>I found the tasks easy to complete</Likert>
              </ListGroup.Item>
              <ListGroup.Item className="py-2">
                <Likert qnum={1}>The instructions were clear</Likert>
              </ListGroup.Item>
              <ListGroup.Item className="py-2">
                <Likert qnum={2}>
                  I was attentive while completing the task
                </Likert>
              </ListGroup.Item>
              <ListGroup.Item className="py-2">
                <Likert qnum={3}>
                  Estimated time for task completion was accurate
                </Likert>
              </ListGroup.Item>
              <ListGroup.Item className="py-2">
                <IconButton
                  name="Submit"
                  active={true}
                  variant="primary"
                  onClick={this.postRatings}
                >
                  Submit
                </IconButton>
              </ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
      </>
    );
  }
}

export default Survey;
