import charts from "./charts_to_render.js";

// Returns 0 if recent sensor value is in threshold, 1 otherwise
export const calculateStatus = (value, minThresh, maxThresh) => {
  return value >= minThresh && value <= maxThresh;
};

export const updateStatus = (chart_name, status) => {
  const color = status ? "lightgreen" : "lightcoral";
  $(`#${chart_name}-status`).css("backgroundColor", color);
};

// Event listeners for each status bar item - scrolls to corresponding chart on click
charts.forEach((chart) => {
  $(`#${chart.name}-status`).click(() => {
    const chart_container = document.getElementById(`chart-${chart.name}`);
    chart_container.scrollIntoView({
      behavior: "smooth",
      inline: "center",
    });
  });
});
