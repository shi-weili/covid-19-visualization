import React from "react";
import PropTypes from "prop-types";
import * as topojson from "topojson-client";
import { AlbersUsa } from "@vx/geo";
import { withTooltip, TooltipWithBounds } from "@vx/tooltip";
import { scaleSqrt } from "@vx/scale";
import Circles from "./Circles";
import StateBoundaries from "./StateBoundaries";
import { Container, Row, Col } from "react-bootstrap";

// Topology
const topology = require("../Assets/counties-simplified.json"); // Processed with toposimplify; added NYC with fips=-1

const statesTopology = topojson.feature(topology, topology.objects.states);
const countiesTopology = topojson.feature(topology, topology.objects.counties);

// Data
const data = require("../Assets/data-for-map.json");

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

const stateCasesColor = scaleSqrt({
  domain: [0, maxStateCases],
  range: [defaultMapColor, "red"],
});

const stateDeathsColor = scaleSqrt({
  domain: [0, maxStateDeaths],
  range: [defaultMapColor, "maroon"],
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

  updateState() {
    this.currentTopology =
      this.props.dataScale === "states" ? statesTopology : countiesTopology;
    this.currentData =
      this.props.dataScale === "states" ? latestStatesData : latestCountiesData;
    this.currentStateFillColor =
      this.props.dataType === "cases" ? stateCasesColor : stateDeathsColor;
  }

  render() {
    // QUESTION: I can't find a way to update internal states before render().
    // componentDidUpdate() seems to be called after render().
    // What's the proper approach?
    this.updateState();

    return (
      <React.Fragment>
        {/* Map */}
        <svg className="data-map-canvas" width={mapWidth} height={mapHeight}>
          {/* State or county shapes */}
          <AlbersUsa
            data={this.currentTopology.features} // Not to be confused with our COVID-19 data. This is actually topology.
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
                          // Use color to represent states data, but not counties data
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
                            this.currentData[parseInt(f.id).toString()] == null
                          ) {
                            return;
                          }

                          if (
                            this.currentData[parseInt(f.id).toString()][
                              this.props.dataType
                            ] === 0
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

          {/* For counties data, draw bold state boundaries, and use circles to represent data. */}
          {this.currentTopology === countiesTopology && (
            <React.Fragment>
              <StateBoundaries
                topology={statesTopology.features}
                mapCenterX={mapCenterX}
                mapCenterY={mapCenterY}
                mapScale={mapScale}
                mapStrokeColor={mapStrokeColor}
              />
              <Circles
                data={latestCountiesData}
                topology={countiesTopology.features}
                maxCountyCases={maxCountyCases}
                maxCountyDeaths={maxCountyDeaths}
                dataType={this.props.dataType}
                mapCenterX={mapCenterX}
                mapCenterY={mapCenterY}
                mapScale={mapScale}
              />
            </React.Fragment>
          )}
        </svg>

        {/* Exact numbers as tooltip */}
        <Container>
          <Col md={{ span: 9, offset: 1 }}>
            <p className="tooltip-hint">
              Hover mouse on the map to show numbers.
            </p>
          </Col>
        </Container>
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
      </React.Fragment>
    );
  }
}

export default withTooltip(DataMap);
