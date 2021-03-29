import "./css/main.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import logo from "./img/DVRPC-logo.png";
import favicon from "./img/favicon.ico";

import makeMap from "./js/map.js";
import sources from "./js/mapSources.js";
import { layers, paint_props } from "./js/mapLayers.js";
import handleModal from "./js/modal.js";

import { sendPostToAPI, initialGeojsonLoad } from "./js/api.js";

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

  initialGeojsonLoad(map, firstSymbolId);

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

    sendPostToAPI(id_values, map, filter);
  });
});

// modal
handleModal(modal, modalToggle, closeModal);

const submitMods = () => {};
