import {createChart} from "./create_chart.js"
import {storeThreshold, bufferData} from "./store.js"
import {sendPlotThresholds} from "./send.js"

let chart_info = {};

const getChartInfo = (chart_id) => chart_info[chart_id];
const getFormIDFromChartID = (chart_id) => chart_id.slice(6);

export const addPlotPoint = (chart_id, data_point, series_ind = 0) => {
    let chart = getChartInfo(chart_id)["chart"];
    let time = new Date(Date.now());
    let plot_point = {x:time, y:data_point};

    chart.series[series_ind].addPoint(plot_point);
    bufferData(chart_id, plot_point, series_ind);
}


const verifyPlotThresholds = (chart_id, min, max) => {
    // Not a number (empty)
    if (isNaN(min) || isNaN(max)) { return false; }
    let chart_config = getChartInfo(chart_id)["config"];
    if ((min < chart_config.min_bound) || (min >= max)
        || (max > chart_config.max_bound) || (max <= min)) {
        return false;
    }
    return true;
}

const displayThresholds = (chart_id) => {
    const chart_config = getChartInfo(chart_id)["config"];
    const form_id = getFormIDFromChartID(chart_id)
    $(`#${form_id}-max-threshold`).val(chart_config.max_threshold)
    $(`#${form_id}-min-threshold`).val(chart_config.min_threshold);
}

// Draw updated plot thresholds - updates plot zone
const drawUpdatedPlotThresholds = (chart_id) => {
    const chart_info = getChartInfo(chart_id);
    const chart = chart_info["chart"];
    const chart_config = chart_info["config"];
    chart.update({
        yAxis: {
            plotBands: [{
                color: 'lightgreen',
                from: chart_config.min_threshold,
                to: chart_config.max_threshold
            }]
        },
        series: [
            {
                // Threshold Zones only apply to this series
                zones: [{
                    value: chart_config.min_threshold,
                    color: 'red'
                }, {
                    value: chart_config.max_threshold,
                    color: 'blue'
                }, {
                    value: Number.MAX_SAFE_INTEGER,
                    color: 'red'
                }]
            },
        ]
    });
}

const handleThresholdUpdate = (chart_id, is_min) => {
    let chart_config = getChartInfo(chart_id)["config"];

    // Get the element of the threshold value being updated
    const bound = is_min ? "min" : "max";
    const form_id = getFormIDFromChartID(chart_id);
    const threshold_value = parseFloat($(`#${form_id}-${bound}-threshold`).val());

    // Get current chart threshold values of corresponding chart
    const curr_max = parseFloat(chart_config.max_threshold);
    const curr_min = parseFloat(chart_config.min_threshold);

    // Boolean flag to indicate if values are updated - means they are valid
    let update = false;
    // Condition for updating min threshold
    if (is_min && verifyPlotThresholds(chart_id, threshold_value, curr_max)) {
        chart_config.min_threshold = threshold_value;
        update = true;
    }
    // Condition for updating max threshold
    else if (!is_min && verifyPlotThresholds(chart_id, curr_min, threshold_value)) {
        chart_config.max_threshold = threshold_value;
        update = true;
    }
    // Display the current threshold values in their respective input fields
    displayThresholds(chart_id);
    // Invalid threshold entry
    if (!update) {
        const form_id = getFormIDFromChartID(chart_id);
        alert(`Invalid ${form_id} threshold.`);
        return;
    }
    getChartInfo(chart_id)["config"] = chart_config;
    // Store in localstorage for persistence
    storeThreshold(chart_id, chart_config.min_threshold, chart_config.max_threshold);
    // Update drawn threshold zone for new thresholds on the plot
    drawUpdatedPlotThresholds(chart_id);
    // Send updated thresholds to arduino
    sendPlotThresholds(getChartInfo(chart_id)["msg_id"], chart_config.min_threshold, chart_config.max_threshold);
}

export const setupChart = (
    chart_id, 
    msg_id, 
    chart_title, 
    y_axis_title, 
    unit, 
    min_bound, 
    max_bound, 
    min_threshold, 
    max_threshold, 
    chart_data1, 
    chart_data2 = []
    ) => {
    const form_id = getFormIDFromChartID(chart_id) // Remove the "chart-"
    // Event listeners for min and max threshold submit buttons
    $(`#${form_id}-min-btn`).click(() => {
        handleThresholdUpdate(chart_id, true);
    });
    $(`#${form_id}-max-btn`).click(() => {
        handleThresholdUpdate(chart_id, false);
    });
    
    let chart_config = {
        min_bound: min_bound,
        max_bound: max_bound,
        min_threshold: min_threshold,
        max_threshold: max_threshold
    }
    // Create chart and store info
    chart_info[chart_id] = {};
    chart_info[chart_id]["config"] = chart_config;
    // Create initial plot
    let chart = createChart(chart_id, chart_title, y_axis_title, unit, chart_config, chart_data1, chart_data2);
    chart_info[chart_id]["chart"] = chart;
    chart_info[chart_id]["msg_id"] = msg_id;

    // Write initial threshold values to their corresponding labels
    displayThresholds(chart_id);
}