import { sendLEDBrightness } from "./send.js"

// Event Listener for LED Brightness range input
$("#led-control").change((event) => {
    // Get value from slider
    const value = event.target.value
    // Update label
    $("#led-brightness").text(value);
    // Send to NodeMCU to send to Arduino
    sendLEDBrightness(value)
});

export const displayFilterQuality = (filter_time) => {
    const filter_time_val = Math.floor((parseInt(filter_time))/1000);
    $("#maintenance-filter-quality").text(filter_time_val);
    let color;
    if (filter_time_val < 60) color = "lightgreen"; // 1 minute
    else if (filter_time < 120) color = "yellow"; // 2 minutes
    else color = "red";
    $("#maintenance-filter").css("backgroundColor", color);
}

export const displayWaterLevelStatus = (water_level_bool) => {
    $("#maintenance-wl-indicator").text(`${(parseInt(water_level_bool) === 1) ? "Good" : "Low"}`);
}