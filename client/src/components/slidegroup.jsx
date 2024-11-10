import React, { Component } from "react";
import SlideNav from "./slidenav";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import PageTransition from "./transition";
import { postCurrentTime } from "../utils/post";

class SlideGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slideId: 0,
      showNext: false,
      highlightPrev: false,
      highlightNext: false,
    };
  }

  onPrev = () => {
    this.setState((prevState) => {
      const { slideId } = prevState;
      return { slideId: Math.max(0, slideId - 1) };
    });
  };

  onNext = () => {
    const nSlides = this.props.children.length;
    this.setState((prevState) => {
      const { slideId } = prevState;
      postCurrentTime({ slideId });
      return { slideId: Math.min(nSlides - 1, slideId + 1) };
    });
  };

  setHighlight = (val) => {
    this.setState({ highlightNext: val });
  };

  setShowNext = (val) => {
    this.setState({ showNext: val });
  };

  render() {
    const { children } = this.props;
    const { slideId, highlightPrev, highlightNext, showNext } = this.state;
    return (
      <Container id="app-container">
        <Row className="slide-content">
          <PageTransition
            page={slideId}
            children={children}
            setHighlight={this.setHighlight}
            setShowNext={this.setShowNext}
            onNext={this.onNext}
          />
        </Row>
        <Row className="border-top mt-3">
          <SlideNav
            onPrev={this.onPrev}
            onNext={this.onNext}
            nSlides={children.length}
            slideId={slideId}
            showNext={showNext}
            highlightPrev={highlightPrev}
            highlightNext={highlightNext}
          />
        </Row>
      </Container>
    );
  }
}

export default SlideGroup;
