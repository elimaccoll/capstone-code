import charts from "./charts_to_render.js";

// Returns 0 if recent sensor value is in threshold, 1 otherwise
export const calculateStatus = (value, minThresh, maxThresh) => {
  return value >= minThresh && value <= maxThresh;
};

export const updateStatus = (chart_name, status) => {
  const color = status ? "lightgreen" : "lightcoral";
  $(`#${chart_name}-status`).css("backgroundColor", color);
};

export const StatusBar = () => {
  return `
      <div class="fixed-bottom">
        <ul class="row list-group list-group-horizontal">
          ${charts
            .map((chart) =>
              StatusBarItem(chart["name"], chart["config"]["title"])
            )
            .join("")}
        </ul>
      </div>
    `;
};

const StatusBarItem = (chart_name, chart_title) => {
  const col_size = Math.floor(12 / charts.length);
  const col_size2 = 2 * col_size;
  return `
    <li class="list-group-item col-${col_size2} col-md-${col_size} text-center d-flex justify-content-center align-items-center" id=${chart_name}-status>
      <strong>${chart_title}</strong>
    </li>
  `;
};
