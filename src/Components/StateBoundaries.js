import React from "react";
import PropTypes from "prop-types";
import { AlbersUsa } from "@vx/geo";

class StateBoundaries extends React.Component {
  // Props
  static propTypes = {
    topology: PropTypes.array.isRequired,
    mapCenterX: PropTypes.number.isRequired,
    mapCenterY: PropTypes.number.isRequired,
    mapScale: PropTypes.number.isRequired,
    mapStrokeColor: PropTypes.string.isRequired,
  };

  render() {
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
                  const { feature: f } = feature;
                  return (
                    <path
                      key={`map-feature-${i}`}
                      d={data.path(f)}
                      fill="none"
                      stroke={this.props.mapStrokeColor}
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
      </React.Fragment>
    );
  }
}

export default StateBoundaries;
