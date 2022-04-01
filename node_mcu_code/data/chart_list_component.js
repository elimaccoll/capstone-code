import ChartListItem from "./chart_list_item_component.js";
import charts from "./charts_to_render.js";

const ChartList = () => {
    return (`
        <ul class="row list-group list-group-horizontal d-flex flex-nowrap overflow-auto">
            ${charts.map(chart => ChartListItem(chart["name"])).join('')}
        </ul>
    `);
};
export default ChartList;