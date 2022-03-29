import { getAllCharts } from "./charts.js"

let active_layout = 1;
const layout1_btn = document.getElementById("layout1");
const layout2_btn = document.getElementById("layout2");

// Default class is chart-panel-hor
const chart_panel = document.getElementById("chart-panel");
const info_panel = document.getElementById("info-panel");
const all_charts = getAllCharts();
const chart_containers = document.getElementsByClassName("chart-container");
const chart_threshold_containers = document.getElementsByClassName("chart-threshold-container");
const chart_threshold_forms = document.getElementsByClassName("chart-threshold-form");

// TODO: Abstract the on click function
// Layout 1
layout1_btn.addEventListener('click', () => {
    if (active_layout == 1) { return; } // Already on layout 1
    active_layout = 1;
    for (const container of chart_containers) {
        container.classList.add("chart-container-layout1");
        container.classList.remove("chart-container-layout2");
    }
    for (const container of chart_threshold_containers) {
        container.classList.add("chart-threshold-container-layout1");
        container.classList.remove("chart-threshold-container-layout2");
    }
    for (const form of chart_threshold_forms) {
        form.classList.add("chart-threshold-form-layout1");
        form.classList.remove("chart-threshold-form-layout2");
    }
    all_charts.forEach(chart => {
        chart.setSize(500, 270);
    });
    layout1_btn.classList.add("active-layout");
    layout2_btn.classList.remove("active-layout");
    chart_panel.classList.remove("chart-panel-vert");
    chart_panel.classList.add("chart-panel-hor");
    info_panel.classList.remove("info-panel-layout2");
    info_panel.classList.add("info-panel-layout1");

});
// Layout 2
layout2_btn.addEventListener('click', () => {
    if (active_layout == 2) { return; } // Already on layout 2
    active_layout = 2;
    for (const container of chart_containers) {
        container.classList.add("chart-container-layout2");
        container.classList.remove("chart-container-layout1");
    }
    for (const container of chart_threshold_containers) {
        container.classList.remove("chart-threshold-container-layout1");
        container.classList.add("chart-threshold-container-layout2");
    }
    for (const form of chart_threshold_forms) {
        form.classList.remove("chart-threshold-form-layout1");
        form.classList.add("chart-threshold-form-layout2");
    }
    all_charts.forEach(chart => {
        chart.setSize(750, 300);
    });
    layout2_btn.classList.add("active-layout");
    layout1_btn.classList.remove("active-layout");
    chart_panel.classList.add("chart-panel-vert");
    chart_panel.classList.remove("chart-panel-hor");
    info_panel.classList.remove("info-panel-layout1");
    info_panel.classList.add("info-panel-layout2");
});
