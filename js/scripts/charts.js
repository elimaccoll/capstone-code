import { createPlot, displayThresholds, handleThresholdUpdate } from "./charts_util.js";

// chart-id: {"chart": Highcharts obj., config: Configuration obj.}
var chart_info = {};

export function getChartInfo(chart_id) {
    return chart_info[chart_id];
}

export function getAllCharts() {
    let charts = [];
    for (const [id, _] of Object.entries(chart_info)) {
        charts.push(chart_info[id]["chart"]);
    }
    return charts;
}

export function getFormIDFromChartID(chart_id) {
    return chart_id.slice(6);
}

// Prevents the default behavior of submit button refreshing page
function handleForm(event) { event.preventDefault(); } 

// Creates a chart with the given parameters
function setupChart(chart_id, msg_id, chart_title, y_axis_title, unit, min_bound, max_bound, min_threshold, max_threshold) {
    const form_id = getFormIDFromChartID(chart_id) // Remove the "chart-"
    const min_threshold_form = document.getElementById(`${form_id}-min-threshold-form`);
    const max_threshold_form = document.getElementById(`${form_id}-max-threshold-form`);
    min_threshold_form.addEventListener('submit', (event) => {
        handleForm(event);
        handleThresholdUpdate(chart_id, true);
    });
    max_threshold_form.addEventListener('submit', (event) => {
        handleForm(event);
        handleThresholdUpdate(chart_id, false);
    });
    // Default humidity plot configurable settings
    var chart_config = {
        min_bound: min_bound,
        max_bound: max_bound,
        min_threshold: min_threshold,
        max_threshold: max_threshold
    }
    // Create chart and store info
    chart_info[chart_id] = {};
    chart_info[chart_id]["config"] = chart_config;
    // Create initial plot
    let chart_data = []; // TODO: Load in data here
    let chart = createPlot(chart_id, chart_title, y_axis_title, unit, chart_config, chart_data);
    chart_info[chart_id]["chart"] = chart;
    chart_info[chart_id]["msg_id"] = msg_id;

    // Write initial threshold values to their corresponding labels
    displayThresholds(chart_id);
}

function setup() {
    // The chart-id must match the DOM elements
    setupChart("chart-internal-air-temp", "it", "Greenhouse Air Temperature", "Temperature (°C)", "°C", 0, 100, 20, 30); 
    setupChart("chart-internal-humidity", "ih", "Greenhouse Humidity", "% Humidity", '%', 0, 100, 40, 50);

    setupChart("chart-water-temp", "wt", "Water Temperature", "Temperature (°C)", '°C', 0, 100, 20, 30);
    setupChart("chart-soil-temp", "st", "Soil Temperature", "Temperature (°C)", '°C', 0, 100, 20, 30);

    // TODO: BETTER OPTION - Add a second series to air temp and humidity plots (series 1 -internal, series 2 - external)
    // setupChart("chart-external-air-temp", "et", "External Air Temperature", "Temperature (°C)", '%', 0, 100, 0, 100);
    // setupChart("chart-external-humidity", "eh", "External Humidity", "% Humidity", '%', 0, 100, 0, 100);


    setupChart("chart-tds", "td", "Total Dissolved Solids (TDS)", "TDS (ppm)", "ppm", 0, 500, 0, 100);
    setupChart("chart-soil-moisture", "sm", "Soil Moisture", "Soil Moisture (unit)", "unit", 0, 100, 50, 60);
}

setup();