import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import InputGroup from "react-bootstrap/InputGroup";

class ConsentForm extends Component {
  render() {
    const { validated } = this.props;
    return (
      <Container className="px-5">
        <Row>
          <Col>
            <p className="lead"><b>Consent Form for Participation in Portrait Relighting Study</b></p>
            <p>Estimated time: 10 minutes</p>

            <h4>Purpose</h4>
            <p>
              You are invited to participate in a study on portrait relighting, which explores how people perceive changes in lighting within images. This research benefits fields such as telepresence and film, where realistic lighting is essential.
            </p>

            <h4>Procedures</h4>
            <p>The study includes three phases:</p>
            <p>
              <b>Phase 1</b>: Compare images for visual quality, evaluating factors like composition and artifacts.
            </p>
            <p>
              <b>Phase 2</b>: Compare images for lighting accuracy, focusing on shadows and face lighting.
            </p>
            <p>
              <b>Phase 3</b>: Compare images for identity preservation, determining how closely the images maintain the person’s appearance.
            </p>

            <h4>Risks</h4>
            <p>
              We use cookies to track session activity and store your email ID, which may pose some privacy risks.
            </p>

            <h4>Benefits</h4>
            <p>
              Participation may be engaging for those interested in photography, computer graphics, or related technology.
            </p>

            <h4>Participation Rights</h4>
            <ol>
              <li>Participation is voluntary.</li>
              <li>You may withdraw at any time by closing the browser.</li>
              <li>Contact us for assistance if needed.</li>
            </ol>
          </Col>
        </Row>

        <Row>
          <Form noValidate id="turker-form" validated={validated} method="post">
            <Row className="g-5">
              <Form.Group as={Col} md="6" controlId="validationCustomEmail">
                <Form.Label>Email address</Form.Label>
                <InputGroup hasValidation>
                  <Form.Control
                    name="email"
                    type="email"
                    placeholder="Enter email"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid email
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Row>
          </Form>
        </Row>
      </Container>
    );
  }
}

export default ConsentForm;

