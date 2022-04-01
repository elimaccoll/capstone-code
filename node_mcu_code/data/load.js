import { setupChart } from "./charts.js";
import {sendPlotThresholds} from "./send.js"

const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

const parseLoadedData = (data_arr) => {
    let data_out = [];
    for (let point of data_arr) {
        const t = Date.parse(point.x);
        const entry = [t, point.y];
        data_out.push(entry);
    }
    return data_out;
}

// Load data on page load
window.onload = async () => {
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

    // Send initial plot thresholds so arduino and node mcu are in sync
    sendPlotThresholds("it", load_int_air_temp.min, load_int_air_temp.max);
    await delay(100);
    sendPlotThresholds("ih", load_int_humidity.min, load_int_humidity.max);
    await delay(100);
    sendPlotThresholds("wt", load_water_temp.min, load_water_temp.max);
    await delay(100);
    sendPlotThresholds("st", load_soil_temp.min, load_soil_temp.max);
    await delay(100);
    sendPlotThresholds("td", load_tds.min, load_tds.max);
    await delay(100);
    sendPlotThresholds("sm", load_soil_moisture.min, load_soil_moisture.max);
    await delay(100);

    // The chart-id must match the DOM elements
    setupChart("chart-air-temp", "it", "Air Temperature", "Temperature (°C)", "°C", 0, 100, load_int_air_temp.min, load_int_air_temp.max, int_air_temp_data, ext_air_temp_data); 
    setupChart("chart-humidity", "ih", "Humidity", "% Humidity", '%', 0, 100, load_int_humidity.min, load_int_humidity.max, int_humidity_data, ext_humidity_data);
    setupChart("chart-water-temp", "wt", "Water Temperature", "Temperature (°C)", '°C', 0, 100, load_water_temp.min, load_water_temp.max, water_temp_data);
    setupChart("chart-soil-temp", "st", "Soil Temperature", "Temperature (°C)", '°C', 0, 100, load_soil_temp.min, load_soil_temp.max, soil_temp_data);
    setupChart("chart-tds", "td", "Total Dissolved Solids (TDS)", "TDS (ppm)", "ppm", 0, 1000, load_tds.min, load_tds.max, tds_data);
    setupChart("chart-soil-moisture", "sm", "Soil Moisture", "Soil Moisture (%)", "%", 0, 100, load_soil_moisture.min, load_soil_moisture.max, soil_moisture_data);
}