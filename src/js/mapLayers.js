const layers = {
  countyOutline: {
    id: "county-outline",
    type: "line",
    source: "boundaries",
    "source-layer": "county",
    paint: {
      "line-width": 2.5,
      "line-color": "#505a5e",
    },
    filter: ["==", "dvrpc", "Yes"],
  },
  muniOutline: {
    id: "municipality-outline",
    type: "line",
    source: "boundaries",
    "source-layer": "municipalities",
    paint: {
      "line-width": 0.5,
      "line-color": "#4a5c64",
    },
  },
  links: {
    id: "links",
    type: "line",
    source: "lts_tool",
    "source-layer": "links",
    paint: {
      "line-width": 1,
      "line-color": "rgba(255, 255, 255, 0.2)",
    },
  },
  linksHighlighted: {
    id: "links-highlighted",
    type: "line",
    source: "lts_tool",
    "source-layer": "links",
    paint: {
      "line-width": 10,
      "line-color": "cyan",
      "line-opacity": 0.5,
    },
    filter: ["in", "gid", ""],
  },
  existingBikeNetwork: {
    id: "existingBikeNetwork",
    type: "line",
    source: "lts_tool",
    "source-layer": "links",
    paint: {
      "line-width": 4,
      "line-color": {
        property: "bikefac",
        default: "black",
        stops: [
          [0, "rgba(0, 0, 0, 0.4)"],
          [1, "maroon"],
          [2, "red"],
          [3, "orange"],
          [4, "blue"],
          [5, "green"],
          [6, "yellow"],
          [7, "magenta"],
        ],
      },
      // "line-dasharray": [2, 4],
    },
    filter: ["!=", "bikefac", 0],
  },
};

const paint_props = {
  linksHighlighted: {
    id: "links-highlighted",
    prop: "line-width",
    style: ["interpolate", ["exponential", 0.5], ["zoom"], 10, 4, 12, 10],
  },

  links: {
    id: "links",
    prop: "line-width",
    style: ["interpolate", ["exponential", 0.5], ["zoom"], 10, 0.01, 15, 0.1],
  },
};

export { layers, paint_props };
