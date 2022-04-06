import { addPlotPoint } from "./charts.js";
import {
  displayFilterQuality,
  displayWaterLevelStatus,
} from "./maintenance.js";
import charts from "./charts_to_render.js";

let active = true;

const MAINTENANCE_INTERVAL = 10;
if (active) {
  // Maintenance
  setInterval(function () {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const value = this.responseText;
        displayWaterLevelStatus(value);
      }
    };
    xhttp.open("GET", "/water_level", true);
    xhttp.send();
  }, MAINTENANCE_INTERVAL * 1000);

  setInterval(function () {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const value = this.responseText;
        displayFilterQuality(value);
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
            const value = parseFloat(this.responseText);
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
    let water_level = Math.floor(Math.random() * 2);
    displayWaterLevelStatus(water_level);
  }, 1000);
  let filter_time = 0;
  setInterval(() => {
    filter_time += 1000;
    displayFilterQuality(filter_time);
  }, 1000);
};
