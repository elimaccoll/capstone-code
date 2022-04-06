import { createChart } from "./create_chart.js";
import { storeDataBuffer, storeThresholds } from "./store.js";
import { sendPlotThresholds } from "./send.js";
import { calculateStatus, updateStatus } from "./status_bar.js";

let chart_info = {};
let name2chart = {};

const getChartFromName = (chart_name) => name2chart[chart_name];

export const addPlotPoint = (chart_name, data_point, series_ind = 0) => {
  const chart = getChartFromName(chart_name);
  const time = new Date(Date.now());
  const plot_point = { x: time, y: data_point };

  chart.series[series_ind].addPoint(plot_point);
  const CONFIG = chart_info[chart_name].config;
  updateStatus(
    chart_name,
    calculateStatus(data_point, CONFIG.minThreshold, CONFIG.maxThreshold)
  );
  storeDataBuffer(chart_name, plot_point, series_ind);
};

const verifyPlotThresholds = (
  minThreshold,
  maxThreshold,
  minBound,
  maxBound
) => {
  // Not a number (empty)
  if (isNaN(minThreshold) || isNaN(maxThreshold)) {
    return false;
  }
  if (
    minThreshold < minBound ||
    minThreshold >= maxThreshold ||
    maxThreshold > maxBound ||
    maxThreshold <= minThreshold
  ) {
    return false;
  }
  return true;
};

const displayThresholds = (chart_name, minThreshold, maxThreshold) => {
  $(`#${chart_name}-max-threshold`).val(maxThreshold);
  $(`#${chart_name}-min-threshold`).val(minThreshold);
};

// Draw updated plot thresholds - updates plot zone
const drawUpdatedPlotThresholds = (chart_name, minThreshold, maxThreshold) => {
  const chart = getChartFromName(chart_name);
  chart.update({
    yAxis: {
      plotBands: [
        {
          color: "lightgreen",
          from: minThreshold,
          to: maxThreshold,
        },
      ],
    },
    series: [
      {
        // Threshold Zones only apply to this series
        zones: [
          {
            value: minThreshold,
            color: "red",
          },
          {
            value: maxThreshold,
            color: "blue",
          },
          {
            value: Number.MAX_SAFE_INTEGER,
            color: "red",
          },
        ],
      },
    ],
  });
};

const handleThresholdUpdate = (chart, is_min) => {
  const chart_config = chart.config;
  // Get the element of the threshold value being updated
  const bound = is_min ? "min" : "max";
  const threshold_value = parseFloat(
    $(`#${chart.name}-${bound}-threshold`).val()
  );

  // Get current chart threshold values of corresponding chart
  const curr_maxThreshold = chart_config.maxThreshold;
  const curr_minThreshold = chart_config.minThreshold;

  // Boolean flag to indicate if values are updated - means they are valid
  let update = false;
  // Condition for updating min threshold
  if (
    is_min &&
    verifyPlotThresholds(
      threshold_value,
      curr_maxThreshold,
      chart_config.minBound,
      chart_config.maxBound
    )
  ) {
    chart_config.minThreshold = threshold_value;
    update = true;
  }
  // Condition for updating max threshold
  else if (
    !is_min &&
    verifyPlotThresholds(
      curr_minThreshold,
      threshold_value,
      chart_config.minBound,
      chart_config.maxBound
    )
  ) {
    chart_config.maxThreshold = threshold_value;
    update = true;
  }
  // Display the current threshold values in their respective input fields
  displayThresholds(
    chart.name,
    chart_config.minThreshold,
    chart_config.maxThreshold
  );
  // Invalid threshold entry
  if (!update) {
    alert(`Invalid ${chart.name} threshold.`);
    return;
  }
  chart.config = chart_config;
  // Store in localstorage for persistence
  storeThresholds(
    chart.name,
    chart_config.minThreshold,
    chart_config.maxThreshold
  );
  // Update drawn threshold zone for new thresholds on the plot
  drawUpdatedPlotThresholds(
    chart.name,
    chart_config.minThreshold,
    chart_config.maxThreshold
  );
  // Send updated thresholds to arduino
  sendPlotThresholds(
    chart_config.symbol,
    chart_config.minThreshold,
    chart_config.maxThreshold
  );
};

export const setupChart = (chart) => {
  chart_info[chart.name] = chart;
  const chart_config = chart.config;
  // Event listeners for min and max threshold submit buttons
  $(`#${chart.name}-min-btn`).click(() => {
    handleThresholdUpdate(chart, true);
  });
  $(`#${chart.name}-max-btn`).click(() => {
    handleThresholdUpdate(chart, false);
  });
  // Create initial plot
  const highchart = createChart(chart);
  name2chart[chart.name] = highchart;
  // Write initial threshold values to their corresponding labels
  displayThresholds(
    chart.name,
    chart_config.minThreshold,
    chart_config.maxThreshold
  );
};
