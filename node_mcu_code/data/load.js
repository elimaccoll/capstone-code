import { setupChart } from "./charts.js";
import { sendPlotThresholds } from "./send.js";
import charts from "./charts_to_render.js";

const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

// Load data on page load
window.onload = async () => {
    let load_charts = charts
    if (localStorage.charts) { load_charts = JSON.parse(localStorage.charts); }

    load_charts.forEach(async (chart) => {
        // Send initial plot thresholds so arduino and node mcu are in sync
        sendPlotThresholds(chart.config.symbol, chart.config.minThreshold, chart.config.maxThreshold);
        setupChart(chart);
        await delay(100);
    });
    localStorage.charts = JSON.stringify(load_charts);
}