import { setupChart } from "./charts.js";
import { sendPlotThresholds } from "./send.js";
import charts from "./charts_to_render.js";

const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

// Load data on page load
window.onload = async () => {
  // Load charts
  let loadCharts = charts;
  if (localStorage.charts) {
    loadCharts = JSON.parse(localStorage.charts);
  }

  loadCharts.forEach(async (chart) => {
    // Send initial plot thresholds so arduino and node mcu are in sync
    sendPlotThresholds(
      chart.config.symbol,
      chart.config.minThreshold,
      chart.config.maxThreshold
    );
    setupChart(chart);
    await delay(100);
  });
  localStorage.charts = JSON.stringify(loadCharts);
};

// Load day night cycle
export const loadDayNightCycle = () => {
  // TODO: Update this - default day night cycle is 60s
  let dayNightCycle = 60;
  if (!localStorage.dayNightCycle) localStorage.dayNightCycle = dayNightCycle;
  dayNightCycle = localStorage.dayNightCycle;
  return dayNightCycle;
};
