// type represents which type of data these thresholds are for (e.g. humidity, air temp, etc.)
export function sendPlotThresholds(type, min_threshold, max_threshold) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", `/threshold_control?type=${type}&min=${min_threshold}&max=${max_threshold}`, true);
    xhttp.send();
}