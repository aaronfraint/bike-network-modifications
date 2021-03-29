import "./css/main.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import logo from "./img/DVRPC-logo.png";
import favicon from "./img/favicon.ico";

import makeMap from "./js/map.js";
import sources from "./js/mapSources.js";
import { layers, paint_props } from "./js/mapLayers.js";
import handleModal from "./js/modal.js";
// add additional imports here (popups, forms, etc)

const modal = document.getElementById("modal");
const modalToggle = document.getElementById("modal-toggle");
const closeModal = document.getElementById("close-modal");
// get additional elements here (forms, etc)

// Add DVRPC logo to nav bar
const logoSpot = document.querySelector("#mpo-logo");
const img = document.createElement("img");
img.src = logo;
img.id = "dvrpc-logo";
logoSpot.append(img);

const faviconLink = document.querySelector("#favicon");
faviconLink.href = favicon;

// map
const map = makeMap();

const reloadGeojson = (map, url) => {
  // make a GET request to parse the GeoJSON at the url
  // alert("Inside the reload block");
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      // retrieve the JSON from the response
      var json = JSON.parse(this.response);
      map.getSource("modified-links").setData(json);
    }
  };
  request.send();
};

map.on("load", async () => {
  var base_layers = map.getStyle().layers;
  var firstSymbolId;
  for (var i = 0; i < base_layers.length; i++) {
    if (base_layers[i].type === "symbol") {
      firstSymbolId = base_layers[i].id;
      break;
    }
  }

  for (const source in sources) map.addSource(source, sources[source]);
  for (const layer in layers) map.addLayer(layers[layer], firstSymbolId);
  for (const p in paint_props)
    map.setPaintProperty(
      paint_props[p].id,
      paint_props[p].prop,
      paint_props[p].style
    );

  var url = "http://127.0.0.1:8000/modified-links/";
  var request = new XMLHttpRequest();
  // make a GET request to parse the GeoJSON at the url
  request.open("GET", url, true);
  request.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      // retrieve the JSON from the response
      var json = JSON.parse(this.response);

      map.addSource("modified-links", {
        type: "geojson",
        data: json,
      });
      map.addLayer(
        {
          id: "links-that-were-modified",
          type: "line",
          source: "modified-links",
          paint: {
            "line-width": 8,
            "line-color": {
              property: "design",
              default: "black",
              stops: [
                [0, "rgba(0, 0, 0, 0.4)"],
                [1, "green"],
                [2, "blue"],
                [3, "yellow"],
                [4, "orange"],
                [5, "red"],
                [6, "purple"],
                [7, "magenta"],
              ],
            },
            "line-opacity": 1,
            "line-dasharray": [1, 0.5],
          },
        },
        firstSymbolId
      );
    }
  };
  request.send();

  // let response = await fetch("http://127.0.0.1:8000/modified-links/");

  // let data = await response.text();

  // console.log(data);

  // add map events here (click, mousemove, etc)
  map.on("draw.create", function (e) {
    // Spinner.show();

    var userPolygon = e.features[0];

    // generate bounding box from polygon the user drew
    var polygonBoundingBox = turf.bbox(userPolygon);

    var southWest = [polygonBoundingBox[0], polygonBoundingBox[1]];
    var northEast = [polygonBoundingBox[2], polygonBoundingBox[3]];

    var northEastPointPixel = map.project(northEast);
    var southWestPointPixel = map.project(southWest);

    var features = map.queryRenderedFeatures(
      [southWestPointPixel, northEastPointPixel],
      { layers: ["links"] }
    );

    let id_values = [];
    var filter = features.reduce(
      function (memo, feature) {
        if (turf.booleanWithin(turf.centroid(feature), userPolygon)) {
          // only add the property, if the feature intersects with the polygon drawn by the user

          id_values.push(feature.properties.gid);
          memo.push(feature.properties.gid);
        }
        return memo;
      },
      ["in", "gid"]
    );

    // Build the API URL
    let apiUrl =
      "https://lts-fastapi-c8pjh.ondigitalocean.app/network-update/?";
    // let apiUrl = "http://127.0.0.1:8000/network-update/?";

    // Add the link IDs
    for (var i = 0; i < id_values.length; i++) {
      if (i > 0) {
        apiUrl += "&";
      }
      apiUrl += "q=" + id_values[i];
    }

    // Get the design selected by the user and add to the URL
    var userDesign = document.getElementById("newbikedesign");

    apiUrl += "&design=" + userDesign.value;

    if (userDesign.value < 1) {
      alert("Please select a design and reselect your segments");
    } else {
      map.setFilter("links-highlighted", filter);
      // Send the POST request to the API
      fetch(apiUrl, { method: "POST" }).then(() => reloadGeojson(map, url));
    }
  });
});

// modal
handleModal(modal, modalToggle, closeModal);

const submitMods = () => {};
