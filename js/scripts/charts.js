import { createPlot, displayThresholds, handleThresholdUpdate } from "./charts_util.js";

// chart-id: {"chart": Highcharts obj., config: Configuration obj.}
var chart_info = {};

export function getChartInfo(chart_id) {
    return chart_info[chart_id];
}

// Prevents the default behavior of submit button refreshing page
function handleForm(event) { event.preventDefault(); } 

// Creates a chart with the given parameters
function setupChart(chart_id, form_id, chart_title, y_axis_title, unit, min_bound, max_bound, min_threshold, max_threshold) {
    const min_humidity_threshold_form = document.getElementById(`${form_id}-min-threshold-form`);
    const max_humidity_threshold_form = document.getElementById(`${form_id}-max-threshold-form`);
    min_humidity_threshold_form.addEventListener('submit', (event) => {
        handleForm(event);
        handleThresholdUpdate(chart_id, true);
    });
    max_humidity_threshold_form.addEventListener('submit', (event) => {
        handleForm(event);
        handleThresholdUpdate(chart_id, false);
    });
    // Default humidity plot configurable settings
    var humidity_config = {
        min_bound: min_bound,
        max_bound: max_bound,
        min_threshold: min_threshold,
        max_threshold: max_threshold
    }
    // Create chart and store info
    chart_info[chart_id] = {};
    chart_info[chart_id]["config"] = humidity_config;
    // Create initial plot
    let humidity_data = []; // TODO: Load in data here
    let humidity_chart = createPlot(chart_id, chart_title, y_axis_title, unit, humidity_config, humidity_data);
    chart_info[chart_id]["chart"] = humidity_chart;

    // Write initial threshold values to their corresponding labels
    displayThresholds(chart_id);
}

function setup() {
    setupChart("chart-humidity", "humidity", "Humidity", "% Humidity", '%', 0, 100, 20, 30);
}

setup();