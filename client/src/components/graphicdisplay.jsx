/**
 * @file GraphicDisplay class implementation.
 *
 * @author Sumit Chaturvedi
 */
import React, { Component } from "react";
import addStopPropagation from "../utils/eventModifier";
import { selectColor, highlightColor, rgb2string } from "../utils/palette";
import { isStyleNotNone } from "../utils/svg";
import { node2ReactElement } from "../utils/reacthelpers";
import { isUndef } from "../utils/misc";
import alphaBlink from "../utils/math";

function validHighlight(hl) {
  return !isUndef(hl) && hl.length > 0;
}

  // const selectedId = selected.map((i) => graph.nodes[i].paths).flat();
  // if (
  //   !validHighlight(highlight) &&
  //   !selectedId.includes(key) &&
  //   !hover.includes(key)
  // ) {
  //   return null;
  // }
  // const { onClick } = props;
  // let color = "none";
  // if (validHighlight(highlight) && highlight.includes(key)) {
  //   color = rgb2string(highlightColor, alphaBlink(t));
  // } else if (selectedId.includes(key)) {
  //   color = rgb2string(selectColor, 1);
  // } else if (hover.includes(key)) {
  //   color = rgb2string(selectColor, 0.6);
  // }
  // const fill = isStyleNotNone("fill", path.properties) ? color : "none";
  // const stroke = isStyleNotNone("stroke", path.properties) ? color : "none";

// function coverElement(path, bbox, key, props, t) {
//   const { selected, hover, highlight } = props;
//   const myClass = path.properties["class"]
//   if (myClass in ["A", "B"]) {
//     const iSelected = selected.includes(myClass); 
//     if (iSelected) { 
//       // make a rectangle react svg element using bbox.x, bbox.y, width and height
//       // with rgb2string(selectColor, 1) as the color. The fill should be transparent.
//       // return this
//     } 
//     const iHover = hover.includes(myClass) 
//     if (iHover) { 
//       // make a rectangle like above, but it has the following fill rgb2string(selectColor, 0.6). 
//     }
//   } 
//   return < /> 
//   return React.createElement(path.tagName, {
//     ...path.properties,
//     id: "cover-element",
//     // fill,
//     // stroke,
//     // onClick: addStopPropagation((evt) => onClick(evt, key)),
//   });
// }
function coverElement(path, bbox, key, props, t) {
  const { selected, hover, highlight, onClick, onPointerOver, onPointerLeave } = props;
  const myClass = path.properties["class"];
  if (["A", "B"].includes(myClass)) {
    const iSelected = selected.includes(myClass);
    if (iSelected) {
      // Make a rectangle React SVG element for the selected state
      return (
        <rect
          x={bbox.x}
          y={bbox.y}
          width={bbox.width}
          height={bbox.height}
          stroke={rgb2string(selectColor, 1)}
          strokeWidth="20"
          fill="transparent"
          key={key}
          onClick={addStopPropagation((evt) => onClick(evt, key, path.properties["class"]))}
          onPointerOver={addStopPropagation(() => onPointerOver(key, myClass))}
          onPointerLeave={addStopPropagation(() => onPointerLeave(key, path.properties["class"]))}
        />
      );
    }

    const iHover = hover.includes(myClass);
    if (iHover) {
      // Make a rectangle React SVG element for the hover state
      return (
        <rect
          x={bbox.x}
          y={bbox.y}
          width={bbox.width}
          height={bbox.height}
          stroke={rgb2string(selectColor, 1)}
          fill={rgb2string(selectColor, 0.6)}
          key={key}
          onClick={addStopPropagation((evt) => onClick(evt, key, myClass))}
          onPointerOver={addStopPropagation(() => onPointerOver(key, myClass))}
          onPointerLeave={addStopPropagation(() => onPointerLeave(key, path.properties["class"]))}
        />
      );
    }
  }

  const iHighlight = validHighlight(highlight) && highlight.includes(myClass)
  if (iHighlight) {
    // Make a rectangle React SVG element for the hover state
    return (
      <rect
        x={bbox.x}
        y={bbox.y}
        width={bbox.width}
        height={bbox.height}
        stroke={rgb2string(highlightColor, alphaBlink(t))}
        strokeWidth="20"
        fill="transparent"
        key={key}
        onClick={addStopPropagation((evt) => onClick(evt, key, myClass))}
        onPointerOver={addStopPropagation(() => onPointerOver(key, myClass))}
        onPointerLeave={addStopPropagation(() => onPointerLeave(key, path.properties["class"]))}
      />
    );
  }

  // Return an empty element in the default case
  return (
    <rect
      x={bbox.x}
      y={bbox.y}
      width={bbox.width}
      height={bbox.height}
      stroke="transparent"
      strokeWidth="20"
      fill="transparent"
      key={key}
      onClick={addStopPropagation((evt) => onClick(evt, key, myClass))}
      onPointerOver={addStopPropagation(() => onPointerOver(key, myClass))}
      onPointerLeave={addStopPropagation(() => onPointerLeave(key, path.properties["class"]))}
    />
  )
}


function pathElement(path, key, events) {
  const { onClick, onPointerOver, onPointerLeave } = events;
  if (path.tagName === "text") {
    return React.createElement(path.tagName, {
      ...path.properties,
      id: `path-${key}`,
      children: path.children[0].value
    });
  }
  return React.createElement(path.tagName, {
    ...path.properties,
    id: `path-${key}`,
    onClick: addStopPropagation((evt) => onClick(evt, key, path.properties["class"])),
    onPointerOver: addStopPropagation(() => onPointerOver(key, path.properties["class"])),
    onPointerLeave: addStopPropagation(() => onPointerLeave(key, path.properties["class"])),
  });
}

class GraphicDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      x: 0,
    };
    if (validHighlight(props.highlight)) {
      this.counter = setInterval(this.increment, 40);
    }
  }

  increment = () => {
    this.setState((prevState) => {
      const { x } = prevState;
      return { x: x + 1 };
    });
  };

  componentDidUpdate(prevProps) {
    const { highlight } = this.props;
    if (!validHighlight(prevProps.highlight) && validHighlight(highlight)) {
      this.counter = setInterval(this.increment, 40);
    } else if (
      validHighlight(prevProps.highlight) &&
      !validHighlight(highlight)
    ) {
      clearInterval(this.counter, 40);
    }
  }

  componentWillUnmount() {
    clearInterval(this.counter);
  }

  /**
   * Create React Elements for SVG paths.
   *
   * @returns {Array}   List of graphic elements as React Elements.
   */
  graphicElements = () => {
    const { paths, bboxes, defs } = this.props.graphic;
    const elements = paths.map((path, key) => {
      return (
        <g key={`path-group-${key}`}>
          {pathElement(path, key, this.props)}
          {coverElement(path, bboxes[key], key, this.props, this.state.x)}
        </g>
      );
    });
    return elements;
  };

  render() {
    const { svg } = this.props.graphic;
    const children = this.graphicElements();
    return React.createElement(
      svg.tagName,
      { ...svg.properties, id: "svg-element" },
      children
    );
  }
}

export default GraphicDisplay;
