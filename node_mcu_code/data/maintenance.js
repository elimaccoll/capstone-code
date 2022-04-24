import {
  sendLEDBrightness,
  sendFilterChanged,
  sendDayNightCycle,
} from "./send.js";
import { resetFilterAge } from "./receive.js"; // For testing
import { storeDayNightCycle } from "./store.js";
import { loadDayNightCycle } from "./load.js";

// Filter stuff
$("#filter-btn").click(() => {
  sendFilterChanged();
  $("#maintenance-filter-age").text("0");
  resetFilterAge(); // For testing
});

export const displayFilterQuality = (filterAgeStr) => {
  const filterAge = Math.floor(parseInt(filterAgeStr) / 1000 / 60);
  $("#maintenance-filter-age").text(filterAge + " mins");
  let color;
  if (filterAge < 1000) color = "lightgreen"; // 1 minute
  else if (filterAge < 2000) color = "yellow"; // 2 minutes
  else color = "lightcoral";
  $("#maintenance-filter").css("backgroundColor", color);
};

// Water level stuff
export const displayWaterLevelStatus = (waterLevelStr) => {
  const waterLevel = parseInt(waterLevelStr);
  let waterLevelMsg = "Good";
  let color = "lightgreen";
  if (waterLevel === 0) {
    waterLevelMsg = "Low";
    color = "lightcoral";
  }
  $("#maintenance-wl-indicator").text(waterLevelMsg);
  $("#maintenance-water-level").css("backgroundColor", color);
};

// LED stuff
// Event Listener for LED Brightness range input
$("#led-control").change((event) => {
  // Get value from slider
  const value = event.target.value;
  // Update label
  $("#led-brightness").text(value);
  // Send to NodeMCU to send to Arduino
  sendLEDBrightness(value);
});

const displayDayNightCycle = (cycleLength) => {
  $("#day-night-length-display").text(cycleLength);
};

// Display current day night cycle length
displayDayNightCycle(loadDayNightCycle());

$("#day-night-btn").click(() => {
  const minCycleLength = 1;
  const minCycleStart = 0;
  const cycleLengthStr = $("#day-night-length").val();
  const cycleStartStr = $("#day-night-start").val();
  let isDayStr = $("#day-night-day").val();
  // Missing fields
  if (!cycleLengthStr || !cycleStartStr) return;

  const cycleLength = parseFloat(cycleLengthStr);
  const cycleStart = parseFloat(cycleStartStr);

  // Invalid input
  if (
    cycleLength < minCycleLength ||
    cycleStart < minCycleStart ||
    cycleStart >= cycleLength
  )
    return;

  sendDayNightCycle(cycleLengthStr, cycleStartStr, isDayStr);
  storeDayNightCycle(cycleLength);
  displayDayNightCycle(cycleLength);
});
