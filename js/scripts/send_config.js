// type would represent which type of data these thresholds are for (e.g. humidity, air temp, etc.)
export function sendPlotThresholds(type, min_threshold, max_threshold) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", `/threshold_control?type=${type}&min=${min_threshold}&max=${max_threshold}`, true);
    xhttp.send();
}


// Event listener for Controlling LED
const led_listener = document.getElementById("led-button");
led_listener.addEventListener('click', () => {
    updateLEDState();
});
// LED Control
function updateLEDState() {
    let button = document.getElementById("led-button");
    let button_value = button.value;
    let led_state;
    if (button_value == "ON") {
        led_state = "1";
        button.value = "OFF";
        button.textContent = "Turn off";
    }
    else if (button_value == "OFF") {
        led_state = "0";
        button.value = "ON";
        button.textContent = "Turn on";
    }
    sendLEDState(led_state);
}
function sendLEDState(led_state) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/led?state="+led_state, true);
    xhttp.send();
}