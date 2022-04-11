import { createChart } from "./create_chart.js";
import { storeDataBuffer, storeThresholds } from "./store.js";
import { sendPlotThresholds } from "./send.js";
import { calculateStatus, updateStatus } from "./status_bar.js";

let chartInfo = {};
let name2chart = {};

const getChartFromName = (chartName) => name2chart[chartName];

const verifyPlotPoint = (plotPoint, minBound, maxBound) => {
  return plotPoint >= minBound && plotPoint <= maxBound;
};

export const addPlotPoint = (chartName, plotPoint, seriesInd = 0) => {
  const chart = getChartFromName(chartName);
  const CONFIG = chartInfo[chartName].config;

  if (!verifyPlotPoint(plotPoint, CONFIG.minBound, CONFIG.maxBound)) return;

  const time = new Date(Date.now());
  const plot_point = { x: time, y: plotPoint };

  chart.series[seriesInd].addPoint(plot_point);
  storeDataBuffer(chartName, plot_point, seriesInd);

  if (seriesInd !== 0) return;
  updateStatus(
    chartName,
    calculateStatus(plotPoint, CONFIG.minThreshold, CONFIG.maxThreshold)
  );
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

const displayThresholds = (chartName, minThreshold, maxThreshold) => {
  $(`#${chartName}-max-threshold`).val(maxThreshold);
  $(`#${chartName}-min-threshold`).val(minThreshold);
};

// Draw updated plot thresholds - updates plot zone
const drawUpdatedPlotThresholds = (chartName, minThreshold, maxThreshold) => {
  const chart = getChartFromName(chartName);
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

const handleThresholdUpdate = (chart, isMin) => {
  const config = chart.config;
  // Get the element of the threshold value being updated
  const bound = isMin ? "min" : "max";
  const threshold_value = parseFloat(
    $(`#${chart.name}-${bound}-threshold`).val()
  );

  // Get current chart threshold values of corresponding chart
  const currMaxThreshold = config.maxThreshold;
  const currMinThreshold = config.minThreshold;

  // Boolean flag to indicate if values are updated - means they are valid
  let update = false;
  // Condition for updating min threshold
  if (
    isMin &&
    verifyPlotThresholds(
      threshold_value,
      currMaxThreshold,
      config.minBound,
      config.maxBound
    )
  ) {
    config.minThreshold = threshold_value;
    update = true;
  }
  // Condition for updating max threshold
  else if (
    !isMin &&
    verifyPlotThresholds(
      currMinThreshold,
      threshold_value,
      config.minBound,
      config.maxBound
    )
  ) {
    config.maxThreshold = threshold_value;
    update = true;
  }
  // Display the current threshold values in their respective input fields
  displayThresholds(chart.name, config.minThreshold, config.maxThreshold);
  // Invalid threshold entry
  if (!update) {
    alert(`Invalid ${chart.name} threshold.`);
    return;
  }
  chart.config = config;
  // Store in localstorage for persistence
  storeThresholds(chart.name, config.minThreshold, config.maxThreshold);
  // Update drawn threshold zone for new thresholds on the plot
  drawUpdatedPlotThresholds(
    chart.name,
    config.minThreshold,
    config.maxThreshold
  );
  // Send updated thresholds to arduino
  sendPlotThresholds(config.symbol, config.minThreshold, config.maxThreshold);
};

export const setupChart = (chart) => {
  chartInfo[chart.name] = chart;
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
