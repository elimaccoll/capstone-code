import { ChartListItem } from "./chart_list_item_component.js";
import charts from "./js/scripts/charts_to_render.js";

export const ChartList = () => {
    return (`
        <ul class="row list-group list-group-horizontal d-flex flex-nowrap overflow-auto">
            ${charts.map(chart_name => ChartListItem(chart_name)).join('')}
        </ul>
    `);
};