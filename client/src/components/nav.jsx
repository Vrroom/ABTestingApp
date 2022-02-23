import React from "react";
import Container from "react-bootstrap/Container"; 
import Navbar from "react-bootstrap/Navbar"; 
import Row from "react-bootstrap/Row"; 
import Col from "react-bootstrap/Col"; 
import IconButton from "./iconbutton"; 
import { ReactComponent as ContactUs } from "../icons/contact.svg";
import { ReactComponent as Help } from "../icons/help.svg"; 

function sendEmail() {
  window.open(
    "mailto:sumit.chaturvedi@gmail.com?subject=VGTrees Annotation App"
  );
}

function Nav (props) {
  return (
    <Navbar>
      <Container className="border-bottom">
        <Navbar.Brand><h1>VGTrees</h1></Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Row> 
            <Col> 
            <IconButton
              name="About"
              active={true}
              onClick={() => {}}
            >
              <Help />
            </IconButton>
            </Col>
            <Col> 
            <IconButton
              name="Contact Us"
              active={true}
              onClick={sendEmail}
            >
              <ContactUs />
            </IconButton>
            </Col>
          </Row>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Nav;
