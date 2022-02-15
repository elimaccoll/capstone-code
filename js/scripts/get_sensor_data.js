import { addPlotPoint } from "./charts_util.js";
// Request sensor readings every 3 seconds
var interval = 3000;

let active = false;
let testing = true;

if (active) {

    setInterval(function ( ) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // console.log(parseFloat(this.responseText));
            document.getElementById("temperature").innerHTML = this.responseText;
        }
    };
    xhttp.open("GET", "/temperature", true);
    xhttp.send();
    }, interval ) ;

    setInterval(function ( ) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let humidity_value = parseFloat(this.responseText);
            // console.log(humidity_value);
            addPlotPoint("chart-humidity", humidity_value);
            document.getElementById("humidity").innerHTML = this.responseText;
        }
    };
    xhttp.open("GET", "/humidity", true);
    xhttp.send();
    }, interval ) ;

}

if (testing) {
    // Test for addPlotPoint using new data points
    setInterval(() => {
        let data = Math.random() * 10 + 15;
        addPlotPoint("chart-humidity", data);
    }, interval);
}