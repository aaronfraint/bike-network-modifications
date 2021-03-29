import { bikeNetworkStyleStops } from "./mapLayers.js";

const APIsource = "digitalocean";

const urlPOSTdata = () => {
  if (APIsource === "localhost") {
    return "http://127.0.0.1:8000/network-update/?";
  } else {
    return "https://lts-fastapi-c8pjh.ondigitalocean.app/network-update/?";
  }
};

const urlGETGeojson = () => {
  if (APIsource === "localhost") {
    return "http://127.0.0.1:8000/modified-links/?";
  } else {
    return "https://lts-fastapi-c8pjh.ondigitalocean.app/modified-links/?";
  }
};

const sendPostToAPI = (idList, map, linkFilter) => {
  // Send a POST request to FastAPI
  // This assigns a design value to a list of link IDs

  // Production API URL
  let apiUrl = urlPOSTdata();
  let geojsonUrl = urlGETGeojson();

  // Get the design selected by the user and add to the URL
  var userDesign = document.getElementById("newbikedesign");

  if (userDesign.value < 0) {
    alert("Please select a design and reselect your segments");
  } else {
    // Add the link IDs to the URL
    for (var i = 0; i < idList.length; i++) {
      if (i > 0) {
        apiUrl += "&";
      }
      apiUrl += "q=" + idList[i];
    }
    // Add the design value to the URL
    apiUrl += "&design=" + userDesign.value;

    map.setFilter("links-highlighted", linkFilter);
    // Send the POST request to the API
    fetch(apiUrl, { method: "POST" }).then(() =>
      reloadGeojson(map, geojsonUrl)
    );
  }
};

const initialGeojsonLoad = (map, firstSymbolId) => {
  let url = urlGETGeojson();

  // make a GET request to parse the GeoJSON at the url
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.setRequestHeader("Access-Control-Allow-Origin", "*");
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
          id: "black-underline-of-links-that-were-modified",
          type: "line",
          source: "modified-links",
          paint: {
            "line-width": 12,
            "line-color": "black",
          },
        },
        firstSymbolId
      );
      map.addLayer(
        {
          id: "links-that-were-modified",
          type: "line",
          source: "modified-links",
          paint: {
            "line-width": 6,
            "line-color": {
              property: "design",
              default: "black",
              stops: bikeNetworkStyleStops,
            },
            "line-opacity": 1,
            "line-dasharray": [1, 1],
          },
        },
        firstSymbolId
      );
    }
  };
  request.send();
};

const reloadGeojson = (map) => {
  let url = urlGETGeojson();

  // make a GET request to parse the GeoJSON at the url
  // alert("Inside the reload block");
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.setRequestHeader("Access-Control-Allow-Origin", "*");
  request.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      // retrieve the JSON from the response
      var json = JSON.parse(this.response);
      map.getSource("modified-links").setData(json);
    }
  };
  request.send();
};

export { sendPostToAPI, initialGeojsonLoad };
