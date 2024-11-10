import React, { useState } from "react";
import IconButton from "./iconbutton";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import ListGroup from "react-bootstrap/ListGroup";
import { postData, postCurrentTime } from "../utils/post";
import { Fireworks } from "fireworks-js/dist/react";
import PageTransition from "./transition";

function Comments(props) {
  const [page, setPage] = useState(0);
  const [cid, setCid] = useState("");
  const postComments = () => {
    const comments = document.getElementById("comments").value;
    postData("/comments", { comments }).then((data) => {
      setCid(data["cid"]);
      setPage(1);
    });
    postCurrentTime({ end: true });
  };
  return (
    <PageTransition page={page}>
      <>
        <Row className="py-3 align-content-center">
          <Col className="d-flex justify-content-center col-12">
            <Form>
              <Form.Group controlId="comments">
                <Form.Label>
                  <h4>Share your experience!</h4>
                </Form.Label>
                <Form.Control as="textarea" rows={4} />
              </Form.Group>
            </Form>
          </Col>
          <Col className="py-3 d-flex justify-content-center">
            <IconButton
              name="Submit"
              active={true}
              variant="primary"
              onClick={postComments}
            >
              Submit
            </IconButton>
          </Col>
        </Row>
      </>
      <Row className="py-3 align-content-center">
        <Col className="d-flex justify-content-center col-12">
          <ListGroup variant="flush">
            <ListGroup.Item className="py-2">
              <h4>Thanks for completing the study! You may now close this window.</h4>
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col className="d-flex justify-content-center">
          <Fireworks />
        </Col>
      </Row>
    </PageTransition>
  );
}

export default Comments;
