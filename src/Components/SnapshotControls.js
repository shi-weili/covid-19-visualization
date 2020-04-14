import React from "react";
import PropTypes from "prop-types";
import { ToggleButtonGroup, Container, Col } from "react-bootstrap";
import { ToggleButton } from "react-bootstrap";
import { Row } from "react-bootstrap";

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
          <Row>
            <Col md={{ span: 3, offset: 3 }}>
              <span className="control-title">Data Scale</span>
              <ToggleButtonGroup
                className="control-toggle-group"
                type="radio"
                name="topology"
                defaultValue={"states"}
                onChange={(value) => {
                  this.props.onDataScaleChange(value);
                }}
              >
                <ToggleButton value={"states"} variant="light">
                  States
                </ToggleButton>
                <ToggleButton value={"counties"} variant="light">
                  Counties
                </ToggleButton>
              </ToggleButtonGroup>
            </Col>

            <Col md={{ span: 3 }}>
              <span className="control-title">Data Sype</span>
              <ToggleButtonGroup
                className="control-toggle-group"
                type="radio"
                name="data-type"
                defaultValue={"cases"}
                onChange={(value) => {
                  this.props.onDataTypeChange(value);
                }}
              >
                <ToggleButton value={"cases"} variant="light">
                  Cases
                </ToggleButton>
                <ToggleButton value={"deaths"} variant="light">
                  Deaths
                </ToggleButton>
              </ToggleButtonGroup>
            </Col>
          </Row>
        </Container>
      </React.Fragment>
    );
  }
}

export default SnapshotControls;
