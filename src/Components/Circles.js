import React from "react";
import PropTypes from "prop-types";
import { AlbersUsa } from "@vx/geo";
import { Circle } from "@vx/shape";
import { scaleSqrt } from "@vx/scale";

// Representation
const circleFillColorForCases = "#ff000022";
const circleStrokeColorForCases = "#88000088";
const circleFillColorForDeaths = "#80000022";
const circleStrokeColorForDeaths = "#60000088";
const circlesMaxRadius = 80;

class Circles extends React.Component {
  // Props
  static propTypes = {
    data: PropTypes.object.isRequired,
    topology: PropTypes.array.isRequired,
    dataType: PropTypes.string.isRequired,
    maxCountyCases: PropTypes.number.isRequired,
    maxCountyDeaths: PropTypes.number.isRequired,
    mapCenterX: PropTypes.number.isRequired,
    mapCenterY: PropTypes.number.isRequired,
    mapScale: PropTypes.number.isRequired,
  };

  // State
  currentCircleFillColor = circleFillColorForCases;
  currentCircleStrokeColor = circleStrokeColorForCases;

  updateState() {
    this.currentCircleFillColor =
      this.props.dataType === "cases"
        ? circleFillColorForCases
        : circleFillColorForDeaths;
    this.currentCircleStrokeColor =
      this.props.dataType === "cases"
        ? circleStrokeColorForCases
        : circleStrokeColorForDeaths;
  }

  // Representation
  // QUESTION: How to properly initialize members that depend props?
  countyCasesRadius = null;
  countyDeathsRadius = null;

  constructor(props) {
    super(props);

    this.countyCasesRadius = scaleSqrt({
      domain: [0, props.maxCountyCases],
      range: [0, circlesMaxRadius],
    });

    this.countyDeathsRadius = scaleSqrt({
      domain: [0, props.maxCountyDeaths],
      range: [0, circlesMaxRadius],
    });
  }

  render() {
    this.updateState();

    return (
      <React.Fragment>
        <AlbersUsa
          data={this.props.topology} // Not to be confused with our COVID-19 data. This is actually topology.
          scale={this.props.mapScale}
          translate={[this.props.mapCenterX, this.props.mapCenterY]}
        >
          {(data) => {
            return (
              <g>
                {data.features.map((feature, i) => {
                  const {
                    feature: f,
                    centroid: [cx, cy],
                  } = feature;
                  return this.props.data[parseInt(f.id).toString()] ? (
                    <Circle
                      key={`circle-${i}`}
                      className="circle"
                      cx={cx}
                      cy={cy}
                      r={
                        this.props.data[parseInt(f.id).toString()]
                          ? this.props.dataType === "cases"
                            ? this.countyCasesRadius(
                                this.props.data[parseInt(f.id).toString()][
                                  this.props.dataType
                                ]
                              )
                            : this.countyDeathsRadius(
                                this.props.data[parseInt(f.id).toString()][
                                  this.props.dataType
                                ]
                              )
                          : 0
                      }
                      fill={this.currentCircleFillColor}
                      stroke={this.currentCircleStrokeColor}
                      style={{
                        pointerEvents: "none", // Don't block mouse events
                      }}
                    />
                  ) : (
                    <g key={`circle-${i}`} />
                  );
                })}
              </g>
            );
          }}
        </AlbersUsa>
      </React.Fragment>
    );
  }
}

export default Circles;
