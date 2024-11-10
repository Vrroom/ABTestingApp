/**
 * @file Helper functions for React
 *
 * @author Sumit Chaturvedi
 */
import React from "react";
import { camelCase } from "lodash";
import { v4 as uuidv4 } from "uuid";

/**
 * Convert all properties to camel case.
 *
 * SVG attributes usually have an hyphen in the
 * middle. This is not allowed when we use them 
 * as React components.
 *
 * @param   {Object}  node - A node in the SVG parse tree
 *
 * @return  {Object}  Node with property names changed
 * to camel case.
 */
function propertiesToCamelCase(node) {
  let { properties, ...rest } = node;
  if (!properties) {
    return rest;
  }
  let oldKeys = Object.keys(properties);
  let newKeys = Object.keys(properties).map(camelCase);
  let oldValues = Object.values(properties);
  let newProperties = {};
  for (let i = 0; i < oldValues.length; i++) {
    let key;
    if (oldKeys[i].includes(':')) {
      key = oldKeys[i].split(':')[1];
    } else {
      key = newKeys[i];
    }
    const val = oldValues[i];
    newProperties[key] = val;
  }
  return { ...rest, properties: newProperties };
}

function node2ReactElement (node) { 
  let children = [];
  if (typeof node.children !== "undefined") {
    children = node.children.map(node2ReactElement);
  }
  return React.createElement(
    node.tagName,
    {
      ...node.properties,
      key: uuidv4()
    },
    children
  );
}

export {
  propertiesToCamelCase,
  node2ReactElement
};
