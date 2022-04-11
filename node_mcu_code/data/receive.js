import { addPlotPoint } from "./charts.js";
import {
  displayFilterQuality as displayFilterAge,
  displayWaterLevelStatus,
} from "./maintenance.js";
import charts from "./charts_to_render.js";

let active = false;

const MAINTENANCE_INTERVAL = 10;
if (active) {
  // Maintenance
  setInterval(function () {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const valueStr = this.responseText;
        displayWaterLevelStatus(valueStr);
      }
    };
    xhttp.open("GET", "/water_level", true);
    xhttp.send();
  }, MAINTENANCE_INTERVAL * 1000);

  setInterval(function () {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const valueStr = this.responseText;
        if (isNaN(valueStr)) return;
        displayFilterAge(valueStr);
      }
    };
    xhttp.open("GET", "/filter_age", true);
    xhttp.send();
  }, MAINTENANCE_INTERVAL * 1000);

  // Sensors
  charts.forEach((chart) => {
    const READ = chart.read;
    const ROUTES = READ.routes;
    const INTERVALS = READ.intervals;
    for (let i = 0; i < ROUTES.length; i++) {
      setInterval(() => {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            const valueStr = this.responseText;
            if (isNaN(valueStr)) return;
            const value = parseFloat(valueStr);
            addPlotPoint(chart.name, value, i);
          }
        };
        xhttp.open("GET", `/${ROUTES[i]}`, true);
        xhttp.send();
      }, INTERVALS[i] * 1000);
    }
  });
}

// Event listener for "TESTING" button to generate fake data

let filterAge = 0;

export const resetFilterAge = () => {
  filterAge = 0;
};

$("#testing-btn").click(() => {
  generateTestData();
});
const generateTestData = () => {
  charts.forEach((chart) => {
    const READ = chart.read;
    const CONFIG = chart.config;
    const ROUTES = READ.routes;
    const INTERVALS = READ.intervals;
    for (let i = 0; i < ROUTES.length; i++) {
      setInterval(() => {
        let value = Math.random() * CONFIG.maxBound;
        addPlotPoint(chart.name, value, i);
      }, INTERVALS[i] * 1000);
    }
  });
  // Testing Maintenance
  setInterval(() => {
    let waterLevel = Math.floor(Math.random() * 2);
    displayWaterLevelStatus(waterLevel);
  }, 1000);
  setInterval(() => {
    filterAge += 1000;
    displayFilterAge(filterAge);
  }, 1000);
};
