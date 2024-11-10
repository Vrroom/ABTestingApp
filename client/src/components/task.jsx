import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap'; // Assuming you're using react-bootstrap
import GroupUI from "./groupui";

class Task extends Component {
  render() {
    const { taskNum, ...restProps } = this.props;

    return (
      <GroupUI src="task" target="/task" metadata={{ taskNum }} {...restProps} />
    );
  }
}

export default Task;
