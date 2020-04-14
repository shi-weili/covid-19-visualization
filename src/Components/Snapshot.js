import React from "react";
import SnapshotControls from "./SnapshotControls";
import DataMap from "./DataMap";
import Bars from "./Bars";

class Snapshot extends React.Component {
  // State
  state = {
    dataScale: "states",
    dataType: "cases",
  };

  // Event handlers
  handleDataScaleChange = (value) => {
    this.setState({
      dataScale: value,
    });
  };

  handleDataTypeChange = (value) => {
    this.setState({
      dataType: value,
    });
  };

  render() {
    return (
      <React.Fragment>
        <SnapshotControls
          onDataScaleChange={this.handleDataScaleChange}
          onDataTypeChange={this.handleDataTypeChange}
        />
        <DataMap
          dataScale={this.state.dataScale}
          dataType={this.state.dataType}
        />
        <Bars dataScale={this.state.dataScale} dataType={this.state.dataType} />
      </React.Fragment>
    );
  }
}

export default Snapshot;
