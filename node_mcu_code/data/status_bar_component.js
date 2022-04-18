import charts from "./charts_to_render.js";

const col_size = Math.floor(12 / charts.length);
const col_size2 = 2 * col_size;

const StatusBarItem = (chart_name, chart_title) => {
  return `
    <li class="status-item list-group-item col-${col_size2} col-md-${col_size} text-center d-flex justify-content-center align-items-center" id=${chart_name}-status>
      <strong>${chart_title}</strong>
    </li>
  `;
};

const StatusBar = () => {
  return `
      <div class="fixed-bottom d-none d-md-block">
        <ul class="row list-group list-group-horizontal">
          ${charts
            .map((chart) =>
              StatusBarItem(chart["name"], chart["config"]["title"])
            )
            .join("")}
            <li class="list-group-item col-${col_size2} col-md-${col_size} text-center d-flex justify-content-center align-items-center" id=empty-status>
            </li>
        </ul>
      </div>
    `;
};
export default StatusBar;
