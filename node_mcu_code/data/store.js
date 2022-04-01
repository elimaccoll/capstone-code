const DATA_BUFFER = 20; // Store a buffer of 20 data points for each plot

// Clear local storage
const clear_btn = document.getElementById("clear-data-btn");
clear_btn.addEventListener('click', () => {
    window.onload = () => {
        localStorage.clear();
    }
    window.onunload = () => {
        localStorage.clear();
    }
    window.location.reload();
});

// Store current thresholds in local storage - Called whenever one is changed
// TODO: Store chart_info instead?
export function storeThreshold(chart_id, min, max) {
    let obj;
    if (chart_id == "chart-air-temp") {
        obj = JSON.parse(localStorage.int_air_temp);
        obj.min = min;
        obj.max = max;
        localStorage.int_air_temp = JSON.stringify(obj);
    }
    else if (chart_id == "chart-humidity") {
        obj = JSON.parse(localStorage.int_humidity);
        obj.min = min;
        obj.max = max;
        localStorage.int_humidity = JSON.stringify(obj);
    }
    else if (chart_id == "chart-water-temp") {
        obj = JSON.parse(localStorage.water_temp);
        obj.min = min;
        obj.max = max;
        localStorage.water_temp = JSON.stringify(obj);
    }
    else if (chart_id == "chart-soil-temp") {
        obj = JSON.parse(localStorage.soil_temp);
        obj.min = min;
        obj.max = max;
        localStorage.soil_temp = JSON.stringify(obj);
    }
    else if (chart_id == "chart-soil-moisture") {
        obj = JSON.parse(localStorage.soil_moisture);
        obj.min = min;
        obj.max = max;
        localStorage.soil_moisture = JSON.stringify(obj);
    }
    else if (chart_id == "chart-tds") {
        obj = JSON.parse(localStorage.tds);
        obj.min = min;
        obj.max = max;
        localStorage.tds = JSON.stringify(obj);
    }
}

// Add a data point to local storage for corresponding chart
export function bufferData(chart_id, plot_point, series_ind) {
    // Call inside of `AddPlotPoint`
    // If length of chart.data > DATA_BUFFER then remove first element and add new data to end
    let curr_buffer = [];
    let obj;
    if (chart_id == "chart-air-temp") {
        if (series_ind == 0) {
            obj = JSON.parse(localStorage.int_air_temp);
            curr_buffer = obj.data;
            if (curr_buffer.length >= DATA_BUFFER) { curr_buffer.shift(); }
            curr_buffer.push(plot_point);
            obj.data = curr_buffer;
            localStorage.int_air_temp = JSON.stringify(obj);
        }
        else {
            if (localStorage.ext_air_temp) { curr_buffer = JSON.parse(localStorage.ext_air_temp); }
            if (curr_buffer.length >= DATA_BUFFER) { curr_buffer.shift(); }
            curr_buffer.push(plot_point);
            localStorage.ext_air_temp = JSON.stringify(curr_buffer);
        }
    }
    else if (chart_id == "chart-humidity") {
        if (series_ind == 0) {
            obj = JSON.parse(localStorage.int_humidity);
            curr_buffer = obj.data;
            if (curr_buffer.length >= DATA_BUFFER) { curr_buffer.shift(); }
            curr_buffer.push(plot_point);
            obj.data = curr_buffer;
            localStorage.int_humidity = JSON.stringify(obj);
        }
        else {
            if (localStorage.ext_humidity) { curr_buffer = JSON.parse(localStorage.ext_humidity); }
            if (curr_buffer.length >= DATA_BUFFER) { curr_buffer.shift(); }
            curr_buffer.push(plot_point);
            localStorage.ext_humidity = JSON.stringify(curr_buffer);
        }
    }
    else if (chart_id == "chart-water-temp") {
        obj = JSON.parse(localStorage.water_temp);
        curr_buffer = obj.data;
        if (curr_buffer.length >= DATA_BUFFER) { curr_buffer.shift(); }
        curr_buffer.push(plot_point);
        obj.data = curr_buffer;
        localStorage.water_temp = JSON.stringify(obj);
    }
    else if (chart_id == "chart-soil-temp") {
        obj = JSON.parse(localStorage.soil_temp);
        curr_buffer = obj.data;
        if (curr_buffer.length >= DATA_BUFFER) { curr_buffer.shift(); }
        curr_buffer.push(plot_point);
        obj.data = curr_buffer;
        localStorage.soil_temp = JSON.stringify(obj);
    }
    else if (chart_id == "chart-soil-moisture") {
        obj = JSON.parse(localStorage.soil_moisture);
        curr_buffer = obj.data;
        if (curr_buffer.length >= DATA_BUFFER) { curr_buffer.shift(); }
        curr_buffer.push(plot_point);
        obj.data = curr_buffer;
        localStorage.soil_moisture = JSON.stringify(obj);
    }
    else if (chart_id == "chart-tds") {
        obj = JSON.parse(localStorage.tds);
        curr_buffer = obj.data;
        if (curr_buffer.length >= DATA_BUFFER) { curr_buffer.shift(); }
        curr_buffer.push(plot_point);
        obj.data = curr_buffer;
        localStorage.tds = JSON.stringify(obj);
    }
}