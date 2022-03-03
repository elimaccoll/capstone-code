import { addPlotPoint } from "./charts_util.js";

// TODO: Line up request intervals with arduino read intervals
var interval = 3000; // 3 seconds

let active = false;
let testing = !active;

// TODO: Change chart-internal-air-temp to just air temp and simply determine which series to add the point to based on
//       the received data type (it for internal temperature (Series 0), et for external temperature (Series 1))
// TODO: Do the same thing for humidity (And any other sensor with internal and external values)
// TODO: Update route names too

if (active) {
    // Maintenance
    setInterval(function ( ) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let maint_msg = this.responseText;
                // 1. Parse maint msg for type (first 2 chars)
                let maint_type = maint_msg.substring(0, 2);
                // 2. Use maint msg type to get the corresponding DOM element
                let maint_element = document.getElementById(`maintenance-${maint_type}`);
                // 3. Write the maint msg (not including type) to textContent
                let maint_content = maint_msg.substring(2);
                maint_element.textContent = maint_content;
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
        addPlotPoint("chart-internal-humidity", data);
        addPlotPoint("chart-internal-humidity", data + 30, 1); // Plotting points on multiple series on same graph
        addPlotPoint("chart-internal-air-temp", data + (Math.random() * 10 + 50));
        addPlotPoint("chart-internal-air-temp", data + 30, 1); // Plotting points on multiple series on same graph
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
}