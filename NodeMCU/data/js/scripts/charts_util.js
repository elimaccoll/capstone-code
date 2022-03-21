import {sendPlotThresholds} from"./send_config.js"
import { getChartInfo, getFormIDFromChartID } from "./charts.js"
import { bufferData, storeThreshold } from "./datastore.js";

// TODO: response Highcharts - https://www.highcharts.com/demo/stock/responsive
// Buttons for different premade display formats

// Plot new data as it is received - used in get_sensor_data
export function addPlotPoint(chart_id, data_point, series_ind = 0) {
    let chart = getChartInfo(chart_id)["chart"];
    let time = new Date(Date.now());
    let plot_point = {x:time, y:data_point};
    // TODO: Fix time
    chart.series[series_ind].addPoint(plot_point);
    bufferData(chart_id, plot_point, series_ind);
}

 /* Verifies given threshold values for the given chart
  * Returns true if valid, false otherwise
  */
function verifyPlotThresholds(chart_id, min, max) {
    // Not a number (empty)
    if (isNaN(min) || isNaN(max)) { return false; }
    let chart_config = getChartInfo(chart_id)["config"];
    if ((min < chart_config.min_bound) || (min >= max)
        || (max > chart_config.max_bound) || (max <= min)) {
        return false;
    }
    return true;
}

// Displays the given chart's threshold values in the corresponding input label - updates text
export function displayThresholds(chart_id) {
    const chart_config = getChartInfo(chart_id)["config"];
    const form_id = getFormIDFromChartID(chart_id)
    const chart_max_threshold_label = document.getElementById(`${form_id}-max-threshold`);
    const chart_min_threshold_label = document.getElementById(`${form_id}-min-threshold`);
    chart_max_threshold_label.value = chart_config.max_threshold;
    chart_min_threshold_label.value = chart_config.min_threshold;
}

// Draw updated plot thresholds - updates plot zone
function drawUpdatedPlotThresholds(chart_id) {
    let chart = getChartInfo(chart_id)["chart"];
    let chart_config = getChartInfo(chart_id)["config"];
    chart.update({
        yAxis: {
            plotBands: [{
                color: 'lightgreen',
                from: chart_config.min_threshold,
                to: chart_config.max_threshold
            }]
        },
        // Applies zones to all series
        // plotOptions: {
        //     series: {
        //         zones: [{
        //             value: chart_config.min_threshold,
        //             color: 'red'
        //         }, {
        //             value: chart_config.max_threshold,
        //             color: 'blue'
        //         }, {
        //             value: Number.MAX_SAFE_INTEGER,
        //             color: 'red'
        //         }]
        //     }
        // },
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
            {
            }
        ]
    });
}

// Handler for when a chart's threshold values are changed
export function handleThresholdUpdate(chart_id, is_min) {
    // Get the element of the threshold value being updated
    const bound = is_min ? "min" : "max";
    const form_id = getFormIDFromChartID(chart_id);
    const threshold_input = document.getElementById(`${form_id}-${bound}-threshold`);
    const threshold_value = parseFloat(threshold_input.value);
    // Get current chart threshold values of corresponding chart
    let chart_config = getChartInfo(chart_id)["config"];
    const curr_max = parseFloat(chart_config.max_threshold);
    const curr_min = parseFloat(chart_config.min_threshold);
    // Boolean flag to indicate if values are updated - means they are valid
    let update = false;
    // Condition for updating min threshold
    if (is_min && verifyPlotThresholds(chart_id, threshold_value, curr_max)) {
        getChartInfo(chart_id)["config"].min_threshold = threshold_value;
        update = true;
    }
    // Condition for updating max threshold
    else if (!is_min && verifyPlotThresholds(chart_id, curr_min, threshold_value)) {
        getChartInfo(chart_id)["config"].max_threshold = threshold_value;
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
    // Store in localstorage for persistence
    storeThreshold(chart_id, getChartInfo(chart_id)["config"].min_threshold, getChartInfo(chart_id)["config"].max_threshold);
    // Update drawn threshold zone for new thresholds on the plot
    drawUpdatedPlotThresholds(chart_id);
    // Send updated thresholds to arduino
    sendPlotThresholds(getChartInfo(chart_id)["msg_id"], getChartInfo(chart_id)["config"].min_threshold, getChartInfo(chart_id)["config"].max_threshold);
}


// Creates initial plot
export function createPlot(chart_id, plot_title, y_axis_title, y_axis_unit, config, data_arr1, data_arr2 = []) {
    return Highcharts.chart(chart_id, {
        // TODO: Timezone is still wrong
        global: {
            UTC: false,
            timezone: "EST",
            timezoneOffset: 180
        },
        chart: {
            // TODO: Find a better way than hard coding this
            height: 270, // 270, 350
            width: 500, // 500, 635
            backgroundColor: 'azure', // Same as body background color
            zoomType: 'x',
            panning: true,
            panKey: 'shift'
        },
        title: {
            text: plot_title
        },
        subtitle: {
            text: "Click and drag to zoom in. Hold down shift key to pan."
        },
        legend: {
            enabled: false
        },
        xAxis: {
            title: {
                text: 'Datetime'
            },
            type: 'datetime',
            labels: {
                format: '{value:%b. %e}'
            }
        },
        yAxis: {
            title: {
                text: y_axis_title
            },
            min: config.min_bound,
            max: config.max_bound,
            tickInterval: 5,
            plotBands: [{
                color: 'lightgreen',
                from: config.min_threshold,
                to: config.max_threshold
            }]
        },
        plotOptions: {
            series: {
                stickyTracking: false,
                cursor: 'pointer',
                // Apply zones to all series
                // zones: [{
                //     value: config.min_threshold,
                //     color: 'red'
                // }, {
                //     value: config.max_threshold,
                //     color: 'blue'
                // }, {
                //     value: Number.MAX_SAFE_INTEGER,
                //     color: 'red'
                // }]
            }
        },
        tooltip: {
            crosshairs: true,
            //snap: 5,
            valueSuffix: y_axis_unit,
            valueDecimals: 2,
            formatter: function() {
                const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
                let x_raw = this.x;
                let x;
                // If it is a number (from loaded data)
                if (!isNaN(x_raw)) {
                    x = new Date(x_raw);
                }
                else {
                    x = JSON.stringify(x_raw);
                    x = x.substring(1, x.length-2);
                }
                const series_name = this.series.name;
                const dt = new Date(Date.parse(x));
                const dt_str = monthLabels[dt.getMonth()] + " " + dt.getDate() + 
                " "+ (dt.getHours() + 4) + ":"+ dt.getMinutes()+ ":"+ dt.getSeconds();
                return series_name + '<br>' + dt_str + '<br>' + this.y.toFixed(2) + y_axis_unit;
            }
        },
        series: [
            {
                // TODO: Derive this name from params
                name: 'Internal Sensor Data',
                type: 'line', // spline
                data: data_arr1,
                marker: {
                    //fillColor: 'white', // Set marker fill color
                    lineWidth: 1,
                    lineColor: 'black',
                    //lineColor: Highcharts.getOption().colors[0]
                },
                lineWidth: 1.5,
                // Threshold Zones only apply to this series
                zones: [{
                    value: config.min_threshold,
                    color: 'red'
                }, {
                    value: config.max_threshold,
                    color: 'blue'
                }, {
                    value: Number.MAX_SAFE_INTEGER,
                    color: 'red'
                }]
            },
            {
                // TODO: Derive this name from params
                name: 'External Sensor Data',
                type: 'line', // spline
                data: data_arr2,
                marker: {
                    fillColor: 'white', // Set marker fill color
                    lineWidth: 1,
                    lineColor: 'black',
                },
                lineWidth: 1.5,
                color: 'black',
            }
        ]
    });
}