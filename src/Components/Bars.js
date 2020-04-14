import React from "react";
import PropTypes from "prop-types";
import { Bar } from "@vx/shape";
import { Group } from "@vx/group";
import { scaleLinear, scaleSqrt } from "@vx/scale";

// Data
const data = require("../Assets/data-for-bars.json");

const maxStateCases = data["max_state_cases"];
const maxStateDeaths = data["max_state_deaths"];
const maxCountyCases = data["max_county_cases"];
const maxCountyDeaths = data["max_county_deaths"];

const numBars = 10;

const latestStatesCases = data["states_snapshots"]["cases"][
  data["states_snapshots"]["cases"].length - 1
]["data"].slice(0, numBars);

const latestStatesDeaths = data["states_snapshots"]["deaths"][
  data["states_snapshots"]["deaths"].length - 1
]["data"].slice(0, numBars);

const latestCountiesCases = data["counties_snapshots"]["cases"][
  data["counties_snapshots"]["cases"].length - 1
]["data"].slice(0, numBars);

const latestCountiesDeaths = data["counties_snapshots"]["deaths"][
  data["counties_snapshots"]["deaths"].length - 1
]["data"].slice(0, numBars);

// Representation
const width = 900;
const height = 180;

const barWidth = (width / numBars) * 0.6;
const barGap = (width / numBars) * 0.4;

const x = (d) => d["area_name"];
const y = (d) => d["number"];

const barX = scaleLinear({
  domain: [0, numBars],
  range: [0, width],
});

const yScaleStateCases = scaleSqrt({
  domain: [0, maxStateCases],
  range: [0, height],
});

const yScaleStateDeaths = scaleSqrt({
  domain: [0, maxStateDeaths],
  range: [0, height],
});

const yScaleCountyCases = scaleSqrt({
  domain: [0, maxCountyCases],
  range: [0, height],
});

const yScaleCountyDeaths = scaleSqrt({
  domain: [0, maxCountyDeaths],
  range: [0, height],
});

const defaultMapColor = "silver";

const stateCasesColor = scaleSqrt({
  domain: [0, maxStateCases],
  range: [defaultMapColor, "red"],
});

const stateDeathsColor = scaleSqrt({
  domain: [0, maxStateDeaths],
  range: [defaultMapColor, "maroon"],
});

const countyCasesColor = scaleSqrt({
  domain: [0, maxCountyCases],
  range: [defaultMapColor, "red"],
});

const countyDeathsColor = scaleSqrt({
  domain: [0, maxCountyDeaths],
  range: [defaultMapColor, "maroon"],
});

class Bars extends React.Component {
  // Props
  static propTypes = {
    dataScale: PropTypes.string.isRequired,
    dataType: PropTypes.string.isRequired,
  };

  // State
  currentData = latestStatesCases;
  currentYScale = yScaleStateCases;
  currentColor = stateCasesColor;

  updateState() {
    if (this.props.dataScale === "states") {
      if (this.props.dataType === "cases") {
        this.currentData = latestStatesCases;
        this.currentYScale = yScaleStateCases;
        this.currentColor = stateCasesColor;
      } else {
        this.currentData = latestStatesDeaths;
        this.currentYScale = yScaleStateDeaths;
        this.currentColor = stateDeathsColor;
      }
    } else {
      if (this.props.dataType === "cases") {
        this.currentData = latestCountiesCases;
        this.currentYScale = yScaleCountyCases;
        this.currentColor = countyCasesColor;
      } else {
        this.currentData = latestCountiesDeaths;
        this.currentYScale = yScaleCountyDeaths;
        this.currentColor = countyDeathsColor;
      }
    }
  }

  render() {
    this.updateState();

    return (
      <React.Fragment>
        <h2>
          Top {numBars} {this.props.dataScale}
        </h2>
        <svg className="bars-canvas" width={width} height={height}>
          <Group>
            {this.currentData.map((d, i) => {
              const barHeight = this.currentYScale(y(d));
              const barY = height - barHeight;
              return (
                <Bar
                  key={`bar-${i}`}
                  x={barX(i)}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill={this.currentColor(y(d))}
                />
              );
            })}
          </Group>
        </svg>
      </React.Fragment>
    );
  }
}

export default Bars;
