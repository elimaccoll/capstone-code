import { sendLEDBrightness } from "./send.js";

// Event Listener for LED Brightness range input
$("#led-control").change((event) => {
  // Get value from slider
  const value = event.target.value;
  // Update label
  $("#led-brightness").text(value);
  // Send to NodeMCU to send to Arduino
  sendLEDBrightness(value);
});

export const displayFilterQuality = (filterAgeStr) => {
  const filterAge = Math.floor(parseInt(filterAgeStr) / 1000);
  $("#maintenance-filter-quality").text(filterAge);
  let color;
  if (filterAge < 60) color = "lightgreen"; // 1 minute
  else if (filterAge < 120) color = "yellow"; // 2 minutes
  else color = "red";
  $("#maintenance-filter").css("backgroundColor", color);
};

export const displayWaterLevelStatus = (waterLevel) => {
  $("#maintenance-wl-indicator").text(
    `${parseInt(waterLevel) === 1 ? "Good" : "Low"}`
  );
};
