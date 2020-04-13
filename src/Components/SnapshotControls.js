import React from "react";
import PropTypes from "prop-types";
import { ToggleButtonGroup, Container } from "react-bootstrap";
import { ToggleButton } from "react-bootstrap";

class SnapshotControls extends React.Component {
  // Props
  static propTypes = {
    onDataScaleChange: PropTypes.func.isRequired,
    onDataTypeChange: PropTypes.func.isRequired,
  };

  render() {
    return (
      <React.Fragment>
        <Container>
          Data Scale
          <ToggleButtonGroup
            type="radio"
            name="topology"
            defaultValue={"states"}
            onChange={(value) => {
              this.props.onDataScaleChange(value);
            }}
            style={{ paddingLeft: 10, paddingRight: 100 }}
          >
            <ToggleButton value={"states"}>States</ToggleButton>
            <ToggleButton value={"counties"}>Counties</ToggleButton>
          </ToggleButtonGroup>
          Data Sype
          <ToggleButtonGroup
            type="radio"
            name="data-type"
            defaultValue={"cases"}
            onChange={(value) => {
              this.props.onDataTypeChange(value);
            }}
            style={{ paddingLeft: 10 }}
          >
            <ToggleButton value={"cases"}>Cases</ToggleButton>
            <ToggleButton value={"deaths"}>Deaths</ToggleButton>
          </ToggleButtonGroup>
        </Container>
      </React.Fragment>
    );
  }
}

export default SnapshotControls;
