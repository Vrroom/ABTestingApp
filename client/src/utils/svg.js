/**
 * @file Functions related the SVGs.
 *
 * @author Sumit Chaturvedi
 */
import { svgTags } from "./svgtags";
import { parse } from "svg-parser";
import { propertiesToCamelCase } from "./reacthelpers";

/**
 * Calculate the height or width from the SVG 
 * document property. 
 *
 * It is possible that the units are in px. This
 * convenience function extracts all the digits.
 *
 * @param   {Object}  dim - SVG document property for either
 * width or height.
 * 
 * @return  {Number}  Extracted width or height value.
 */
function extractDims(dim) {
  if (typeof dim === "string") {
    return dim.replace(/\D/g, "");
  } else {
    return dim;
  }
}

/**
 * Parse the SVG document's viewbox.
 *
 * @param   {string}  vb - Viewbox of the SVG.
 *
 * @return  {Object}  List of 4 numbers specifying the 
 * viewbox.
 */
function extractViewBox(vb) {
  return vb.split(/ |,|, /).map(parseFloat);
}

/**
 * Calculate the width and height of the SVG document.
 *
 * @param   {Object}  props - SVG document properties. 
 *
 * @return  {Object}  { width, height } as numbers.
 */
function getWidthHeight(props) {
  let height, width;
  if (props.height) {
    height = extractDims(props.height);
  }
  if (props.width) {
    width = extractDims(props.width);
  }
  if (!props.height && !props.width) {
    const vb = extractViewBox(props.viewBox);
    width = vb[2] - vb[0];
    height = vb[3] - vb[1];
  }
  return { width, height };
}

/**
 * Modify the graphic such that the SVG's viewbox 
 * is a square and the original graphic window is
 * placed in the middle of the square.
 *
 * Since we might have arbitrary vector graphics
 * in our database, it makes sense to normalize them
 * by making them fit in a square so that they are 
 * rendered properly on the browser.
 *
 * @param   {Object}  graphic - The SVG document representation.
 *
 * @return  {Object}  Graphic object whose height and width have
 * been made equal.
 */
function normalizeGraphic(graphic) {
  let { svg, paths, bboxes, defs } = graphic;
  if (svg.properties.viewBox) {
    const vb = extractViewBox(svg.properties.viewBox);
    if (vb[2] < vb[3]) {
      svg.properties.viewBox = `${vb[0] - (vb[3] - vb[2]) / 2} ${vb[1]} ${
        vb[3]
      } ${vb[3]}`;
    } else {
      svg.properties.viewBox = `${vb[0]} ${vb[1] - (vb[2] - vb[3]) / 2} ${
        vb[2]
      } ${vb[2]}`;
    }
  }
  if (svg.properties.height && svg.properties.width) {
    const h = extractDims(svg.properties.height);
    const w = extractDims(svg.properties.width);
    const max = Math.max(h, w);
    svg.properties.height = max;
    svg.properties.width = max;
    svg.properties.viewBox = `0 0 ${max} ${max}`;
  }
  return { svg, paths, bboxes, defs };
}

/**
 * Find the bounding box of a path.
 *
 * 1. Create a temporary SVG element in browser. 
 * 2. Add the path to that SVG element.
 * 3. Use the browser function getBBox to calculate
 *    the bounding box.
 * 4. Clean up the temporary element.
 *
 * @param   {Object}  path - SVG path.
 *
 * @return  {Object}  A bounding box for the path.
 */
function findBBox(path, viewBox) {
  const svgElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  svgElement.setAttribute("id", "temp-svg");
  document.body.appendChild(svgElement);
  const pathElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    path.tagName
  );
  for (const p in path.properties) {
    pathElement.setAttribute(p, path.properties[p]);
  }
  svgElement.appendChild(pathElement);
  const pathBox = svgElement.lastChild.getBoundingClientRect();
  const { x, y, height, width } = pathBox; 
  const pt = convertCoordinates('temp-svg', x, y);  
  const di = convertDimensions('temp-svg', width, height);
  svgElement.removeChild(pathElement);
  svgElement.remove();
  return { ...pt, ...di };
}

/**
 * Extract the paths from SVG parse tree.
 *
 * While flattening the parse tree, it is ensured that the inherited properties
 * are set correctly.
 *
 * @param   {Object}  tree - SVG parse tree.
 *
 * @return  {Object}  The object consists of an svg and a paths
 * property. The svg property stores information about the whole
 * document. The paths property is a list of paths.
 */
function flattenTree(tree) {
  let stack = [];
  let elements = [];
  let defs = undefined;
  const helper = node => {
    if (node.tagName === "defs") {
      defs = node;
      return;
    }
    stack.push(node.properties);
    const properties = stack.reduceRight(function(a, b) {
      return { ...b, ...a };
    });
    let { children, ...rest } = node;
    if (svgTags.includes(rest.tagName) || rest.tagName === "svg") {
      rest.properties = properties;
      if (rest.tagName === 'text') {
        rest.children = children;
      }
      elements.push(rest);
    } 
    if (children !== undefined) {
      children.forEach(helper);
    }
    stack.pop();
  };
  helper(tree);
  const paths = elements.slice(1); 
  console.log(paths)
  return { svg: elements[0], paths, defs };
}

/**
 * Check whether bounding box is simply a point.
 * 
 * Many times, the paths in the document will
 * have no geometry. Such paths are useless 
 * for our purpose. 
 *
 * We detect them by determining whether they
 * occupy 0 area or not. 
 *
 * @param   {Object}  bbox - Bounding box.
 *
 * @return  {boolean} True if bounding box is simply a point.
 */
function degenerateBBox(bbox) {
  return bbox.width === 0 && bbox.height === 0;
}

function treeMap (node, fn) {
  node = fn(node); 
  if (node.children) {
    node.children = node.children.map(c => treeMap(c, fn));
  }
  return node;
}

/**
 * Process an SVG string.
 *
 * This function performs a bunch of operations
 * on the SVG string fetched from the database.
 *
 * 1. The string is parsed.
 * 2. The parse tree is flattened. We are only concerned
 *    with the paths in the SVG. Flattening the parse tree
 *    makes it more convenient to index the paths.
 * 3. Bounding boxes are computed for the paths.
 * 4. The SVG properties are converted to camel case
 *    so that they match React's requirements for 
 *    jsx elements.
 * 5. Finally, the SVG is normalized to fit into a 
 *    square viewbox.
 *
 * @param   {string}  svgString - SVG document as a string.
 *
 * @return  {object}  A graphic object having the SVG, it's
 * paths and their bounding boxes as properties.
 */
function preprocessSVG(svgString) {
  const parseTree = parse(svgString).children[0];
  let { svg, paths, defs } = flattenTree(parseTree);
  let bboxes = paths.map(path => findBBox(path, svg.properties.viewBox));
  // paths = paths.filter((_, i) => !degenerateBBox(bboxes[i]));
  // bboxes = bboxes.filter(b => !degenerateBBox(b));
  svg = propertiesToCamelCase(svg);
  if (typeof defs !== "undefined") {
    defs = treeMap(defs, propertiesToCamelCase);
  }
  paths = paths.map(propertiesToCamelCase);
  return { svg, paths, bboxes, defs };
}

/**
 * Calculate a bounding box which covers all the input 
 * bounding boxes.
 *
 * This function is used when we want to compute the 
 * bounding box for a set of paths which have been 
 * grouped by the user.
 *
 * @param   {Object}  bboxes - List of bounding boxes
 *
 * @return  {Object}  The smallest bounding box which
 * covers all bboxes.
 */
function coveringBBox(bboxes) {
  const x = Math.min(...bboxes.map(b => b.x));
  const y = Math.min(...bboxes.map(b => b.y));
  const maxX = Math.max(...bboxes.map(b => b.x + b.width));
  const maxY = Math.max(...bboxes.map(b => b.y + b.height));
  const height = maxY - y;
  const width = maxX - x;
  return { x, y, height, width };
}

/**
 * Calculate the center of a box.
 *
 * @param   {Object}  box - Must have x, y, width and height
 * properties.
 *
 * @return  {Object}  The center point as { cx, cy }
 */
function boxCenter(box) {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  return { cx, cy };
}

/**
 * Calculate euclidean distance between two points in 2D.
 *
 * @param   {Object}  a - Point a given as { x, y }.
 * @param   {Object}  b - Point b.
 *
 * @return  {Number}  Euclidean distance.
 */
function distance(a, b) {
  const d = { x: a.x - b.x, y: a.y - b.y };
  return Math.sqrt(d.x * d.x + d.y * d.y);
}

/**
 * Convert coordinates from the document's
 * to the element's whose id is supplied.
 *
 * Used to convert event coordinates on a 
 * particular element.
 *
 * @param   {string}  elementId - Id of element
 * @param   {Number}  x - x coordinate of the point.
 * @param   {Number}  y - y coordinate of the point.
 *
 * @return  {Object}  The transformed point with x and y
 * properties.
 */
function convertCoordinates(elementId, x, y) {
  const ctm = document.getElementById(elementId).getScreenCTM();
  return { x: (x - ctm.e) / ctm.a, y: (y - ctm.f) / ctm.d };
}

function convertDimensions(elementId, width, height) {
  const ctm = document.getElementById(elementId).getScreenCTM();
  return { width : width / ctm.a, height: height / ctm.d };
}

function isStyleNotNone(styleProperty, properties) {
  if (typeof properties[styleProperty] === "undefined") {
    if (typeof properties.style === "undefined") return true;
    else return properties.style[styleProperty].toLowerCase() !== "none";
  }
  return properties[styleProperty].toLowerCase() !== "none";
}

export {
  getWidthHeight,
  preprocessSVG,
  coveringBBox,
  boxCenter,
  distance,
  convertCoordinates,
  isStyleNotNone,
};
