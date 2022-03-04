import { setupChart } from "./charts.js";

const DATA_BUFFER = 20; // Store a buffer of 20 data points for each plot

// USED FOR TESTING - Clears local storage
const clear = false;
if (clear) {
    window.onload = () => {
        localStorage.clear();
    }
    window.onunload = () => {
        localStorage.clear();
    }
}

// Store current thresholds in local storage - Called whenever one is changed
export function storeThreshold(chart_id, min, max) {
    let obj;
    if (chart_id == "chart-internal-air-temp") {
        obj = JSON.parse(localStorage.int_air_temp);
        obj.min = min;
        obj.max = max;
        localStorage.int_air_temp = JSON.stringify(obj);
    }
    else if (chart_id == "chart-internal-humidity") {
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
    if (chart_id == "chart-internal-air-temp") {
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
    else if (chart_id == "chart-internal-humidity") {
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

function parseLoadedData(data_arr) {
    let data_out = [];
    for (let point of data_arr) {
        const t = Date.parse(point.x);
        const entry = [t, point.y];
        data_out.push(entry);
    }
    return data_out;
}

// Load data on page load
window.onload = () => {
    // TODO: 'min' and 'max' here would be the default thesholds for the corresponding plot
    let load_int_air_temp = {"min": 20, "max": 30, "data": []};
    let int_air_temp_data = [];

    let load_int_humidity = {"min": 40, "max": 50, "data": []};
    let int_humidity_data = [];

    let load_water_temp = {"min": 5, "max": 15, "data": []};
    let water_temp_data = [];

    let load_tds = {"min": 0, "max": 100, "data": []};
    let tds_data = [];

    let load_soil_temp = {"min": 20, "max": 30, "data": []};
    let soil_temp_data = [];

    let load_soil_moisture = {"min": 50, "max": 60, "data": []};
    let soil_moisture_data = [];

    let ext_air_temp_data = [];
    let ext_humidity_data = [];

    if (localStorage.int_air_temp) { 
        load_int_air_temp = JSON.parse(localStorage.int_air_temp); 
        int_air_temp_data = parseLoadedData(load_int_air_temp.data);
    }
    else { localStorage.int_air_temp = JSON.stringify(load_int_air_temp); }

    if (localStorage.int_humidity) { 
        load_int_humidity = JSON.parse(localStorage.int_humidity);
        int_humidity_data = parseLoadedData(load_int_humidity.data);
    }
    else { localStorage.int_humidity = JSON.stringify(load_int_humidity); }

    if (localStorage.water_temp) { 
        load_water_temp = JSON.parse(localStorage.water_temp); 
        water_temp_data = parseLoadedData(load_water_temp.data);
    }
    else { localStorage.water_temp = JSON.stringify(load_water_temp); }

    if (localStorage.tds) { 
        load_tds = JSON.parse(localStorage.tds);
        tds_data = parseLoadedData(load_tds.data);
    }
    else { localStorage.tds = JSON.stringify(load_tds); }

    if (localStorage.soil_temp) { 
        load_soil_temp = JSON.parse(localStorage.soil_temp);
        soil_temp_data = parseLoadedData(load_soil_temp.data);
    }
    else { localStorage.soil_temp = JSON.stringify(load_soil_temp); }

    if (localStorage.soil_moisture) { 
        load_soil_moisture = JSON.parse(localStorage.soil_moisture); 
        soil_moisture_data = parseLoadedData(load_soil_moisture.data);
    }
    else { localStorage.soil_moisture = JSON.stringify(load_soil_moisture); }

    // Just arrays for these
    if (localStorage.ext_air_temp) { 
        ext_air_temp_data = parseLoadedData(JSON.parse(localStorage.ext_air_temp)); 
    }
    else { localStorage.ext_air_temp = JSON.stringify(ext_air_temp_data); }

    if (localStorage.ext_humidity) { 
        ext_humidity_data = parseLoadedData(JSON.parse(localStorage.ext_humidity)); 
    }
    else { localStorage.ext_humidity = JSON.stringify(ext_humidity_data); }

    // The chart-id must match the DOM elements
    // TODO: remove internal from first 2 charts
    setupChart("chart-internal-air-temp", "it", "Air Temperature", "Temperature (°C)", "°C", 0, 100, load_int_air_temp.min, load_int_air_temp.max, int_air_temp_data, ext_air_temp_data); 
    setupChart("chart-internal-humidity", "ih", "Humidity", "% Humidity", '%', 0, 100, load_int_humidity.min, load_int_humidity.max, int_humidity_data, ext_humidity_data);
    setupChart("chart-water-temp", "wt", "Water Temperature", "Temperature (°C)", '°C', 0, 100, load_water_temp.min, load_water_temp.max, water_temp_data);
    setupChart("chart-soil-temp", "st", "Soil Temperature", "Temperature (°C)", '°C', 0, 100, load_soil_temp.min, load_soil_temp.max, soil_temp_data);
    setupChart("chart-tds", "td", "Total Dissolved Solids (TDS)", "TDS (ppm)", "ppm", 0, 500, load_tds.min, load_tds.max, tds_data);
    setupChart("chart-soil-moisture", "sm", "Soil Moisture", "Soil Moisture (unit)", "unit", 0, 100, load_soil_moisture.min, load_soil_moisture.max, soil_moisture_data);
}
