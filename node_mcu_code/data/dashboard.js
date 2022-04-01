import ChartList from "./chart_list_component.js";
import InfoPanel from "./info_panel_component.js";
import Header from "./header_component.js";

(function ($) {
    $("#root").append(`
    <div class="container-fluid">
        ${Header()}
        ${ChartList()}
        ${InfoPanel()}
    </div>
    `);
})($);