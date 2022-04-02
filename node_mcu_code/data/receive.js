import { addPlotPoint } from "./charts.js";
import { handleMaintenance } from "./maintenance.js";
import charts from "./charts_to_render.js";

let active = false;

const MAINTENANCE_INTERVAL = 10;
if (active) {
    // Maintenance
    setInterval(function ( ) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let maint_msg = this.responseText;
                if (maint_msg) { handleMaintenance(maint_msg); }
            }
        };
        xhttp.open("GET", "/maintenance", true);
        xhttp.send();
    }, MAINTENANCE_INTERVAL * 1000 ) ;

    // Sensors
    charts.forEach((chart) => {
        const READ = chart.read;
        const ROUTES = READ.routes;
        const INTERVALS = READ.intervals;
        for (let i = 0; i < ROUTES.length; i++) {
            setInterval(() => {
                var xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function() {
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
        const ROUTES = READ.routes;
        const INTERVALS = READ.intervals;
        for (let i = 0; i < ROUTES.length; i++) {
            setInterval(() => {
                let value = Math.random() * chart.config.maxBound;
                addPlotPoint(chart.name, value, i);
                }, INTERVALS[i] * 1000);
        }
    });
    // Testing Maintenance Messages
    setInterval(() => {
        let water_level = Math.floor(Math.random() * 2);
        let maint_msg = `wl:${water_level}`;
        handleMaintenance(maint_msg);
    }, 1000);
    let filter_time = 0;
    setInterval(() => {
        filter_time = (filter_time + 1) % 11;
        let maint_msg = `ft:${filter_time}`;
        handleMaintenance(maint_msg);
    }, 1000);
}