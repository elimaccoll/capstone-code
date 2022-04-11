import ChartList from "./chart_list_component.js";
import InfoPanel from "./info_panel_component.js";
import Header from "./header_component.js";
import StatusBar from "./status_bar_component.js";

(function ($) {
  $("#root").append(`
    <div class="container-fluid bg-light">
        ${Header()}
        ${ChartList()}
        ${InfoPanel()}
        ${StatusBar()}
    </div>
    `);
})($);
