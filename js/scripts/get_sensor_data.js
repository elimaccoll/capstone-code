import { addPlotPoint } from "./charts_util.js";

// TODO: Line up request intervals with arduino read intervals
var interval = 3000; // 3 seconds

let active = false;
let testing = !active;

// TODO: Change chart-internal-air-temp to just air temp and simply determine which series to add the point to based on
//       the received data type (it for internal temperature (Series 0), et for external temperature (Series 1))
// TODO: Do the same thing for humidity (And any other sensor with internal and external values)
// TODO: Update route names too

function handleMaintenance(maint_msg) {
    // 1. Parse maint msg for type (first 2 chars)
    let maint_type = maint_msg.substring(0, 2);
    switch(maint_type) {
        case "wl":
            let wl_element = document.getElementById("maintenance-wl");
            let wl_content = maint_msg.substring(3); // Don't want to include the ':'
            wl_element.textContent = `Water Level: ${wl_content}%`;
            setWaterLevel(wl_content);
            break;
        case "ft":
            let ft_element = document.getElementById("maintenance-ft");
            let ft_content = maint_msg.substring(3); // Don't want to include the ':'
            ft_element.textContent = ft_content;
            setFilterTime(ft_content);
            break;
        default:
            console.log("Unrecognized maintenance type.");
            break;
    }
}

if (active) {
    // Maintenance
    setInterval(function ( ) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let maint_msg = this.responseText;
                handleMaintenance(maint_msg);
            }
        };
        xhttp.open("GET", "/maintenance", true);
        xhttp.send();
    }, 1000 ) ;
    


    // Request sensor data on their specific routes
    setInterval(function ( ) {
    var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let internal_air_temp = parseFloat(this.responseText);
                addPlotPoint("chart-internal-air-temp", internal_air_temp);
            }
        };
        xhttp.open("GET", "/internal_air_temp", true);
        xhttp.send();
    }, 1000 ) ;

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
    }, 1000 ) ;

    // FAKE DATA FOR DEMO
    // Soil Moisture
    setInterval(() => {
        let sm_data = Math.random() * 30 + 40;
        addPlotPoint("chart-soil-moisture", sm_data);
    }, 3000);
    // TDS
    setInterval(() => {
        let tds_data = Math.random() * 70 + 15;
        addPlotPoint("chart-tds", tds_data);
    }, 5000);
    // Water Temperature
    setInterval(() => {
        let wt_data = Math.random() * 30 + 10;
        addPlotPoint("chart-water-temp", wt_data);
    }, 3000);
    // Soil Temperature
    setInterval(() => {
        let st_data = Math.random() * 20 + 15;
        addPlotPoint("chart-soil-temp", st_data);
    }, 3000);
}

if (testing) {
    // Add fake data points to plot - Used for testing
    let data;
    setInterval(() => {
        data = Math.random() * 10 + 15;
    });
    // Temperature and Humidity
    setInterval(() => {
        addPlotPoint("chart-internal-humidity", data + (Math.random() * 10 + 50), 1); // Plotting points on multiple series on same graph
        addPlotPoint("chart-internal-humidity", data + (Math.random() * 10 + 30));
        addPlotPoint("chart-internal-air-temp", data + (Math.random() * 10 + 50), 1); // Plotting points on multiple series on same graph
        addPlotPoint("chart-internal-air-temp", data + (Math.random() * 10 + 30));
    }, 1000);
    // Soil Moisture
    setInterval(() => {
        addPlotPoint("chart-soil-moisture", data + (Math.random() * 10 + 30));
    }, 3000);
    // TDS
    setInterval(() => {
        addPlotPoint("chart-tds", data);
    }, 5000);
    // Water Temperature
    setInterval(() => {
        let wt_data = Math.random() * 30 + 10;
        addPlotPoint("chart-water-temp", wt_data);
    }, 3000);
    // Soil Temperature
    setInterval(() => {
        let st_data = Math.random() * 20 + 15;
        addPlotPoint("chart-soil-temp", st_data);
    }, 3000);

    // Testing Maintenance Messages
    setInterval(() => {
        let water_level = Math.round(Math.random() * 100);
        let maint_msg = `wl:${water_level}`;
        handleMaintenance(maint_msg);
    }, 3000);
    let filter_time = 0;
    setInterval(() => {
        // let filter_time = Math.round(Math.random() * 10);
        filter_time = (filter_time + 1) % 11;
        let maint_msg = `ft:${filter_time}`;
        handleMaintenance(maint_msg);
    }, 1000);
}


// Maintenance Display - Control
function setFilterTime(filter_time) {
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

function setWaterLevel(water_level) {
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