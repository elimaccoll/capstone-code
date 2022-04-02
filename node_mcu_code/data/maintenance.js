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

const displayFilterQuality = (filter_time) => {
    $("#maintenance-filter-quality").text(filter_time);
    const filter_time_val = parseInt(filter_time);
    let color;
    if (filter_time_val < 7) color = "lightgreen";
    else if (filter_time < 9) color = "yellow";
    else color = "red";
    $("#maintenance-filter").css("backgroundColor", color);
}

export const handleMaintenance = (maint_msg) => {
    // 1. Parse maint msg for type (first 2 chars)
    const maint_type = maint_msg.substring(0, 2);
    const maint_content = maint_msg.substring(3); // Don't want to include the ':'
    switch (maint_type) {
        case "wl":
            $("#maintenance-wl-indicator").text(`${(maint_content == 1) ? "Good" : "Low"}`);
            break;
        case "ft":
            displayFilterQuality(maint_content);
            break;
        default:
            console.log("Unrecognized maintenance type.");
            break;
    }
}