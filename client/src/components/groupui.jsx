import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner"; 
import GraphicDisplay from "./graphicdisplay";
import { preprocessSVG } from "../utils/svg";
import { boxforce } from "../utils/boxforce";
import { cloneDeep } from "lodash";
import {
  createEmptyGraph,
  isRoot,
  findRoot,
  updateVisualProperties,
  groupNodes,
  isTree,
} from "../utils/graph";
import { nodeColors } from "../utils/palette";
import * as d3 from "d3";
import { ReactComponent as Group } from "../icons/group.svg";
import IconButton from "./iconbutton";
import { isUndef } from "../utils/misc";
import { postData } from "../utils/post";

function skipClear(props) {
  const { disableClear } = props;
  return !isUndef(disableClear) && disableClear;
}

function skipGroup(props) {
  const { disableGroup } = props;
  return !isUndef(disableGroup) && disableGroup;
}

function skipNode(props, nid) {
  const { disableNodes } = props;
  return !isUndef(disableNodes) && disableNodes.includes(nid);
}

function getTaskDescription(type, kind) {
  const descriptions = {
    image_quality: (
      <h4>
        <b>[Phase 1]</b> Which image, <b>A</b> or <b>B</b>, has better visual quality? Consider composition and visible artifacts.
      </h4>
    ),
    image_lighting: (
      <h4>
        <b>[Phase 2]</b> Which image, <b>A</b> or <b>B</b>, better matches the lighting in <b>Reference</b>? Focus on shadows and face lighting.
      </h4>
    ),
    image_identity: (
      <h4>
        <b>[Phase 3]</b> Which image, <b>A</b> or <b>B</b>, better preserves the identity of the person in <b>Reference</b>?
      </h4>
    )
  };

  return descriptions[type] || descriptions.image_identity;
}

class GroupUI extends Component {
  /*
   * Set the initial state of the component.
   *
   * This is just a formality because the state
   * would be over-written when the component mounts
   * because there, we can do an AJAX call to retrieve
   * an SVG from the server.
   *
   * Here we use a placeholder SVG string.
   */
  constructor(props) {
    super(props);
    const graphic = preprocessSVG('<svg height="100" width="100"></svg>');
    const graph = createEmptyGraph(graphic, { nodes: {}, links: {} });
    this.state = {
      graphic,
      graph,
      hover: [],
      selected: [],
      filename: "",
      svgString: '<svg height="100" width="100"></svg>',
      nothingIn: true,
      type: "",
      kind: "",
    };
    // d3-force's simulation object for calculating
    // the graph layout and because it looks cool.
    this.sim = d3.forceSimulation();
  }

  resetToInit = () => {
    const { svgString, filename } = this.state;
    this.setStateWithNewSVG(svgString, filename);
  };

  /*
   * When the component mounts, add an event listener for
   * click. Any click which isn't caught by a child element
   * of window will be caught here and whatever has been
   * selected by the user would be cleared
   *
   * Also fetch a new graphic from the database.
   */
  componentDidMount() {
    window.addEventListener("click", this.handleClear);
    this.getNewSVGFromDB();
  }

  /*
   * When the component unmounts, remove the click
   * event listener.
   */
  componentWillUnmount() {
    if (!isUndef(this.props.setHighlight)) {
      const { setHighlight, setShowNext } = this.props;
      setHighlight(false); 
      setShowNext(false); 
    }
    this.sim.stop();
    window.removeEventListener("click", this.handleClear);
  }

  setStateWithNewSVG = (svgString, filename, groups) => {
    const graphic = preprocessSVG(svgString);
    this.setState({
      graphic,
      hover: [],
      selected: [],
      filename,
      svgString,
      nothingIn: false
    });
    this.tryNotifyParent({ type: "new-svg" });
  };

  /*
   * Fetch an SVG string from server.
   * Update the state of the component
   * with this SVG string and id.
   */
  getNewSVGFromDB = () => {
    const { src, metadata } = this.props;
    postData(src, metadata).then((item) => {
      const { svg, filename, groups, type, kind } = item;
      this.setState({
        type,
        kind
      });
      this.setStateWithNewSVG(svg, filename, groups);
    });
  };

  tryNotifyParent = (msg) => {
    const { notifyParent } = this.props;
    if (!isUndef(notifyParent)) {
      notifyParent(msg);
    }
  };

  /*
   * Handle Click event on a particular node.
   *
   * Whenever a click event occurs in either the svg handler or
   * the graph handler, this function is called. By clicking on
   * nodes, they either get selected/de-selected according to
   * whether they were de-selected or selected earlier.
   *
   * A node cannot be selected if it's ancestor or descendent is
   * already selected.
   *
   * @param   {Number}  id - Id of the node on which
   * the event was fired.
   */
  handleClick = (event, id, className) => {
    if (!isUndef(this.props.disableNodes) && this.props.disableNodes.includes(className)) {
      return;
    }
    const { setHighlight, setShowNext } = this.props;
    let selected = cloneDeep(this.state.selected);
    const isSelected = selected.includes(className);
    if (isSelected) {
      // unselect it.
      // setHighlight(false);
      // setShowNext(false);
      selected.splice(selected.indexOf(className), 1);
    } else {
      // setHighlight(true);
      // setShowNext(true);
      selected = [className];
      const { target, metadata } = this.props;
      const result = { ...metadata, choice: className };
      postData('/save', result);
    }
    this.setState({ selected });
    this.props.onNext();
    this.tryNotifyParent({ type: "select", selected });
  };

  /*
   * Handle the event when the pointer hovers over
   * some node.
   *
   * @param   {Number}  id - Id of the node.
   */
  handlePointerOver = (id, className) => {
    if (["A", "B"].includes(className)) {
      const hover = [className];
      this.setState({ hover });
    }
  };

  /*
   * Reset state when pointer leaves some node.
   *
   * @param   {Number}  id - Id of the node.
   */
  handlePointerLeave = (id, className) => {
    this.setState({ hover: [] });
  };


  /*
   * Clear the selections.
   *
   * Whenever any useless part of the window
   * is clicked, de-select all the selected paths.
   * This is what happens in a lot of graphics
   * editors.
   */
  handleClear = (event) => {
    if (skipClear(this.props)) return;
    const { setHighlight, setShowNext } = this.props;
    setHighlight(false);
    setShowNext(false);
    const selected = [];
    this.setState({ selected });
    this.tryNotifyParent({ type: "clear" });
  };

  render() {
    let { highlightSvg, highlightGroup, highlightGraph } = this.props;
    const { type, kind } = this.state;
    console.log(type, kind);
    if (this.state.nothingIn) {
      return (
        <Row className="py-3 align-items-center">
          <Col className="d-flex justify-content-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Col>
        </Row>
      );
    }

    if (isUndef(highlightSvg)) highlightSvg = [];
    if (isUndef(highlightGraph)) highlightGraph = [];
    if (isUndef(highlightGroup)) highlightGroup = false;

    return (
      <>
        <Row className="py-3 justify-content-center">
          <Col className="d-flex col-10 justify-content-center">
            {getTaskDescription(type, kind)}            
          </Col>
          <Row>
            <Col className="d-flex justify-content-center mt-3">
              <GraphicDisplay
                graphic={this.state.graphic}
                graph={this.state.graph}
                selected={this.state.selected}
                hover={this.state.hover}
                onClick={this.handleClick}
                onPointerOver={this.handlePointerOver}
                onPointerLeave={this.handlePointerLeave}
                highlight={highlightSvg}
              />
            </Col>
          </Row>
        </Row>
      </>
    );
  }
}

export default GroupUI;
