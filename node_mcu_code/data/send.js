// type represents which type of data these thresholds are for (e.g. humidity, air temp, etc.)
export const sendPlotThresholds = (type, minThresh, maxThresh) => {
  var xhttp = new XMLHttpRequest();
  xhttp.open(
    "GET",
    `/threshold_control?type=${type}&min=${minThresh}&max=${maxThresh}`,
    true
  );
  xhttp.send();
};

export const sendLEDBrightness = (brightness) => {
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", `/led_control?brightness=${brightness}`, true);
  xhttp.send();
};
