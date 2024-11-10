import React, { Component } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import PageTransition from "./transition";
import GroupUI from "./groupui";
import IconButton from "./iconbutton";
import Emoji from "./emoji";
import { identical } from "../utils/listOps";
import { range } from "lodash";
import { ReactComponent as Retry } from "../icons/retry.svg";

function allBut(len, id) {
  return range(0, len).filter((i) => i !== id);
}

class Tutorial extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messageId: 0,
      highlightSvg: [],
      disableNodes: ["A", "B"],
    };
    this.ref = React.createRef();
    this.callbacks = [];
  }

  reset = () => {
    this.setState({
      messageId: 0,
      highlightSvg: [],
      disableNodes: ["A", "B"],
    });
    this.ref.current.resetToInit();
  };

  chainMessages = (ids) => {
    if (ids.length === 0) {
      return;
    }
    this.callbacks.push(
      setTimeout(() => {
        this.setMessage(ids[0]);
        this.chainMessages(ids.slice(1));
      }, 2500)
    );
  };

  setMessage = (id) => {
    this.setState({ messageId: id });
    this.childNotification({ type: "next-state" });
  };

  childNotification = (msg) => {
    this.setState((prevState) => {
      const { messageId } = prevState;
      let { current } = this.ref;
      if (messageId === 0) {
        if (msg.type === "new-svg") {
          this.callbacks.push(
            setTimeout(() => {
              this.setMessage(1);
            }, 3500)
          );
          return {
            highlightSvg: ['input']
          }
        }
      } else if (messageId === 1) {
        this.callbacks.push(
          setTimeout(() => {
            this.setMessage(2);
          }, 3500)
        );
        return { highlightSvg: ['light_ref'], };
      } else if (messageId === 2) {
        return { highlightSvg: [], disableNodes: [] };
      } 
    });
  };

  componentWillUnmount() {
    const { setHighlight, setShowNext } = this.props;
    setHighlight(false);
    setShowNext(false);
    this.callbacks.map((cb) => clearTimeout(cb));
  }

  render() {
    const {
      highlightSvg,
      disableNodes,
    } = this.state;
    return (
      <Row className="py-3 justify-content-center">
        <Col className="d-flex col-10 justify-content-center">
          <PageTransition page={this.state.messageId}>
            <h4>Here is an input image</h4>
            <h4>We want to relight so that lighting matches this reference</h4>
            <h4>Which of <b>Output A</b> or <b>Output B</b> matches the lighting and input better?</h4>
          </PageTransition>
        </Col>
        <GroupUI
          ref={this.ref}
          src="tutorialgraphic"
          target="/checktutorial"
          metadata={{}}
          notifyParent={this.childNotification}
          highlightSvg={highlightSvg}
          setHighlight={this.props.setHighlight}
          setShowNext={this.props.setShowNext}
          disableNodes={disableNodes}
        />
      </Row>
    );
  }
}

export default Tutorial;
