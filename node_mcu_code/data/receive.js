import { addPlotPoint } from "./charts.js";

let active = false;

$("#testing-btn").click(() => {
    generateTestData();
});


// Read intervals for different sensor values - Match the arduino timings
const READ_INTERNAL_AIR_TEMP = 1;
const READ_INTERNAL_HUMIDITY = 1;
const READ_EXTERNAL_AIR_TEMP = 3;
const READ_EXTERNAL_HUMIDITY = 3;
const READ_WATER_TEMP = 3;
const READ_SOIL_TEMP = 3;
const READ_SOIL_MOISTURE = 5;
const READ_TDS = 5;
const READ_MAINTENANCE = 10;


const handleMaintenance = (maint_msg) => {
    // 1. Parse maint msg for type (first 2 chars)
    let maint_type = maint_msg.substring(0, 2);
    switch (maint_type) {
        case "wl":
            let wl_element = $("#maintenance-wl-indicator");
            let wl_bool = maint_msg.substring(3); // Don't want to include the ':'
            wl_element.textContent = `${(wl_bool == 1) ? "Good" : "Low"}`; // %`;
            // setWaterLevel(wl_content);
            break;
        case "ft":
            // let ft_element = $("#maintenance-ft");
            // let ft_content = maint_msg.substring(3); // Don't want to include the ':'
            // ft_element.textContent = ft_content;
            // setFilterTime(ft_content);
            break;
        default:
            console.log("Unrecognized maintenance type.");
            break;
    }
}

// TODO: Remove this conditional when done testing
if (active) {
    // Maintenance
    setInterval(function ( ) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let maint_msg = this.responseText;
                console.log(maint_msg);
                if (maint_msg) { handleMaintenance(maint_msg); }
            }
        };
        xhttp.open("GET", "/maintenance", true);
        xhttp.send();
    }, READ_MAINTENANCE * 1000 ) ;
    

    // Request sensor data on their specific routes

    // Internal Air Temperature
    setInterval(function ( ) {
    var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let internal_air_temp = parseFloat(this.responseText);
                addPlotPoint("chart-air-temp", internal_air_temp);
            }
        };
        xhttp.open("GET", "/internal_air_temp", true);
        xhttp.send();
    }, READ_INTERNAL_AIR_TEMP * 1000 ) ;

    // Internal Humidity
    setInterval(function ( ) {
    var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let internal_humidity = parseFloat(this.responseText);
                addPlotPoint("chart-humidity", internal_humidity);
            }
        };
        xhttp.open("GET", "/internal_humidity", true);
        xhttp.send();
    }, READ_INTERNAL_HUMIDITY * 1000 ) ;

    // External Air Temperature
    setInterval(function ( ) {
        var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let external_air_temp = parseFloat(this.responseText);
                    addPlotPoint("chart-internal-air-temp", external_air_temp, 1);
                }
            };
            xhttp.open("GET", "/external_air_temp", true);
            xhttp.send();
        }, READ_EXTERNAL_AIR_TEMP * 1000 ) ;

    // External Humidity
    setInterval(function ( ) {
        var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let external_humidity = parseFloat(this.responseText);
                    addPlotPoint("chart-internal-humidity", external_humidity, 1);
                }
            };
            xhttp.open("GET", "/external_humidity", true);
            xhttp.send();
        }, READ_EXTERNAL_HUMIDITY * 1000 ) ;
    
    // Water Temperature
    setInterval(function ( ) {
        var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let water_temp = parseFloat(this.responseText);
                    addPlotPoint("chart-water-temp", water_temp);
                }
            };
            xhttp.open("GET", "/water_temp", true);
            xhttp.send();
        }, READ_WATER_TEMP * 1000 ) ;

    // Soil Temperature
    setInterval(function ( ) {
        var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let soil_temp = parseFloat(this.responseText);
                    addPlotPoint("chart-soil-temp", soil_temp);
                }
            };
            xhttp.open("GET", "/soil_temp", true);
            xhttp.send();
        }, READ_SOIL_TEMP * 1000 ) ;

    // Soil Moisture
    setInterval(function ( ) {
        var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let soil_moisture = parseFloat(this.responseText);
                    addPlotPoint("chart-soil-moisture", soil_moisture);
                }
            };
            xhttp.open("GET", "/soil_moisture", true);
            xhttp.send();
        }, READ_SOIL_MOISTURE * 1000 ) ;

    // TDS
    setInterval(function ( ) {
        var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let tds = parseFloat(this.responseText);
                    addPlotPoint("chart-tds", tds);
                }
            };
            xhttp.open("GET", "/tds", true);
            xhttp.send();
        }, READ_TDS * 1000 ) ;
}

const generateTestData = () => {
    // Add fake data points to plot - Used for testing
    let data;
    setInterval(() => {
        data = Math.random() * 10 + 15;
    });
    // Temperature and Humidity
    setInterval(() => {
        addPlotPoint("humidity", data + (Math.random() * 10 + 50), 1); // Plotting points on multiple series on same graph
        addPlotPoint("humidity", data + (Math.random() * 10 + 30));
        addPlotPoint("air-temp", data + (Math.random() * 10 + 50), 1); // Plotting points on multiple series on same graph
        addPlotPoint("air-temp", data + (Math.random() * 10 + 30));
    }, 1000);
    // Soil Moisture
    setInterval(() => {
        addPlotPoint("soil-moisture", data + (Math.random() * 10 + 30));
    }, 3000);
    // TDS
    setInterval(() => {
        addPlotPoint("tds", data);
    }, 5000);
    // Water Temperature
    setInterval(() => {
        let wt_data = Math.random() * 30 + 10;
        addPlotPoint("water-temp", wt_data);
    }, 3000);
    // Soil Temperature
    setInterval(() => {
        let st_data = Math.random() * 20 + 15;
        addPlotPoint("soil-temp", st_data);
    }, 3000);

    // Testing Maintenance Messages
    setInterval(() => {
        let water_level = Math.round(Math.random() * 100);
        let maint_msg = `wl:${water_level}`;
        handleMaintenance(maint_msg);
    }, 3000);
    let filter_time = 0;
    setInterval(() => {
        filter_time = (filter_time + 1) % 11;
        let maint_msg = `ft:${filter_time}`;
        handleMaintenance(maint_msg);
    }, 1000);
}


// Trigger different maintenenace notifications for testing
// Maintenance Display - Control
const setFilterTime = (filter_time) => {
    var elem = document.getElementById("maintenance-ft-container");
    let filter_time_val = parseInt(filter_time);
    let color;
    if (filter_time_val < 7) {
        color = "lightgreen";
    }
    else if (filter_time < 9) {
        color = "yellow";
    }
    else {
        color = "red";
    }
    elem.style.backgroundColor = color;

    return;
}

const setWaterLevel = (water_level) => {
    let time_to_fill = 10;
    var elem = document.getElementById("wl-fill");
    let curr_height = elem.style.height;
    if (curr_height) {
        curr_height = parseInt(curr_height.substring(0, curr_height.length - 1));
    }
    let new_height = Math.round(parseFloat(water_level));

    var id = setInterval(fill, time_to_fill);
    function fill() {
      if (curr_height == new_height) {
        clearInterval(id);
      }
      if (new_height < curr_height) {
          curr_height--;
      }
      else if (new_height > curr_height) {
        curr_height++;
      }
      elem.style.height = curr_height + '%';
      // Write text content inside of fill bar
      // elem.textContent = curr_height * 1 + '%';
    }
}