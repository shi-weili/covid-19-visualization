import React from "react";
import PropTypes from "prop-types";
import * as topojson from "topojson-client";
import { AlbersUsa } from "@vx/geo";
import { Circle } from "@vx/shape";
import { withTooltip, TooltipWithBounds } from "@vx/tooltip";
import { scaleSqrt } from "@vx/scale";
import { Container } from "react-bootstrap";

// Topology
const topology = require("../Assets/counties-simplified.json"); // Processed with toposimplify

const statesTopology = topojson.feature(topology, topology.objects.states);
const countiesTopology = topojson.feature(topology, topology.objects.counties);

// Data
const data = require("../Assets/data.json");

const maxStateCases = data["max_state_cases"];
const maxStateDeaths = data["max_state_deaths"];
const maxCountyCases = data["max_county_cases"];
const maxCountyDeaths = data["max_county_deaths"];

const latestStatesData =
  data["states_snapshots"][data["states_snapshots"].length - 1]["data"];
const latestCountiesData =
  data["counties_snapshots"][data["counties_snapshots"].length - 1]["data"];

// Representation
// QUESTION: What the best practice on making sizing/positioning responsive?
const mapWidth = 960;
const mapHeight = 680;
const mapCenterX = mapWidth / 2;
const mapCenterY = mapHeight / 2;
const mapScale = mapHeight * 1.8;

const mapStrokeColor = "#ffffff";
const defaultMapColor = "silver";
const circleFillColorForCases = "#ff000022";
const circleStrokeColorForCases = "#88000088";
const circleFillColorForDeaths = "#80000022";
const circleStrokeColorForDeaths = "#60000088";
const circlesMaxRadius = 80;

const stateCasesColor = scaleSqrt({
  domain: [0, maxStateCases],
  range: [defaultMapColor, "red"],
});

const stateDeathsColor = scaleSqrt({
  domain: [0, maxStateDeaths],
  range: [defaultMapColor, "maroon"],
});

const countyCasesRadius = scaleSqrt({
  domain: [0, maxCountyCases],
  range: [0, circlesMaxRadius],
});

const countyDeathsRadius = scaleSqrt({
  domain: [0, maxCountyDeaths],
  range: [0, circlesMaxRadius],
});

class DataMap extends React.Component {
  // Props
  static propTypes = {
    dataScale: PropTypes.string.isRequired,
    dataType: PropTypes.string.isRequired,
  };

  // State
  // QUESTION: The following states will be set according to props.
  // However, I can't find a way to properly set/update React state after props value change.
  // What's the correct way to do it?
  currentTopology = statesTopology;
  currentData = latestStatesData;
  currentStateFillColor = stateCasesColor;
  currentCircleFillColor = circleFillColorForCases;
  currentCircleStrokeColor = circleStrokeColorForCases;

  updateState() {
    this.currentTopology =
      this.props.dataScale == "states" ? statesTopology : countiesTopology;
    this.currentData =
      this.props.dataScale == "states" ? latestStatesData : latestCountiesData;
    this.currentStateFillColor =
      this.props.dataType == "cases" ? stateCasesColor : stateDeathsColor;
    this.currentCircleFillColor =
      this.props.dataType == "cases"
        ? circleFillColorForCases
        : circleFillColorForDeaths;
    this.currentCircleStrokeColor =
      this.props.dataType == "cases"
        ? circleStrokeColorForCases
        : circleStrokeColorForDeaths;
  }

  render() {
    // QUESTION: I can't find a way to update internal states before render().
    // componentDidUpdate() seems to be called after render().
    // What's the proper approach?
    this.updateState();

    return (
      <React.Fragment>
        {/* Map */}
        <Container>
          <svg width={mapWidth} height={mapHeight}>
            {/* States or counties shapes */}
            <AlbersUsa
              data={this.currentTopology.features}
              scale={mapScale}
              translate={[mapCenterX, mapCenterY]}
            >
              {(data) => {
                return (
                  <g>
                    {data.features.map((feature, i) => {
                      const {
                        feature: f,
                        centroid: [cx, cy],
                      } = feature;
                      return (
                        <path
                          key={`map-feature-${i}`}
                          d={data.path(f)}
                          fill={
                            this.currentTopology === statesTopology &&
                            this.currentData[parseInt(f.id).toString()]
                              ? this.currentStateFillColor(
                                  this.currentData[parseInt(f.id).toString()][
                                    this.props.dataType
                                  ]
                                )
                              : defaultMapColor
                          }
                          stroke={mapStrokeColor}
                          strokeWidth={
                            this.currentTopology === statesTopology ? 0.5 : 0.25
                          }
                          onMouseEnter={() => {
                            // Don't show tooltip if no data is available
                            if (
                              this.currentData[parseInt(f.id).toString()] ==
                              null
                            ) {
                              return;
                            }

                            if (
                              this.currentData[parseInt(f.id).toString()][
                                this.props.dataType
                              ] == 0
                            ) {
                              return;
                            }

                            this.props.showTooltip({
                              tooltipLeft: cx,
                              tooltipTop: cy,
                              tooltipData: `${
                                this.currentData[parseInt(f.id).toString()][
                                  "area_name"
                                ]
                              }: ${
                                this.currentData[parseInt(f.id).toString()]
                                  ? this.currentData[parseInt(f.id).toString()][
                                      this.props.dataType
                                    ]
                                  : 0
                              } ${this.props.dataType}`,
                            });
                          }}
                          onMouseLeave={this.props.hideTooltip}
                        />
                      );
                    })}
                  </g>
                );
              }}
            </AlbersUsa>

            {/* For counties data, draw bold states boundaries, and use circles to represent data. */}
            {this.currentTopology === countiesTopology && (
              <React.Fragment>
                {/* Bold states boundaries */}
                <AlbersUsa
                  data={statesTopology.features}
                  scale={mapScale}
                  translate={[mapCenterX, mapCenterY]}
                >
                  {(data) => {
                    return (
                      <g>
                        {data.features.map((feature, i) => {
                          const { feature: f } = feature;
                          return (
                            <path
                              key={`map-feature-${i}`}
                              d={data.path(f)}
                              fill="none"
                              stroke={mapStrokeColor}
                              strokeWidth={0.5}
                              style={{
                                pointerEvents: "none", // Don't block mouse events
                              }}
                            />
                          );
                        })}
                      </g>
                    );
                  }}
                </AlbersUsa>

                {/* Circles */}
                <AlbersUsa
                  data={this.currentTopology.features}
                  scale={mapScale}
                  translate={[mapCenterX, mapCenterY]}
                >
                  {(data) => {
                    return (
                      <g>
                        {data.features.map((feature, i) => {
                          const {
                            feature: f,
                            centroid: [cx, cy],
                          } = feature;
                          return this.currentData[parseInt(f.id).toString()] ? (
                            <Circle
                              key={`circle-${i}`}
                              className="circle"
                              cx={cx}
                              cy={cy}
                              r={
                                this.currentData[parseInt(f.id).toString()]
                                  ? this.props.dataType == "cases"
                                    ? countyCasesRadius(
                                        this.currentData[
                                          parseInt(f.id).toString()
                                        ][this.props.dataType]
                                      )
                                    : countyDeathsRadius(
                                        this.currentData[
                                          parseInt(f.id).toString()
                                        ][this.props.dataType]
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
            )}
          </svg>
          {/* Details tooltip */}
          {this.props.tooltipOpen && (
            <TooltipWithBounds
              // set this to random so it correctly updates with parent bounds
              key={Math.random()}
              top={this.props.tooltipTop}
              left={this.props.tooltipLeft}
            >
              {this.props.tooltipData}
            </TooltipWithBounds>
          )}
        </Container>
      </React.Fragment>
    );
  }
}

export default withTooltip(DataMap);
