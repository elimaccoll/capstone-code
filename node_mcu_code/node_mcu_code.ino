// Library for Serial Connection b/w NodeMCU and Arduino
#include <SoftwareSerial.h>
// Libraries for Async Web Server
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
// Library for File system (use HTML and CSS files)
#include <FS.h>

// TODO: Work on timing of loading scripts to improve page load
// TODO: Work on timings to minimize corrupted messages
//        - Gets pretty bad with a lot of sensors - message queueing?
// TODO: Responses - response->send() ?

SoftwareSerial nodeSerial(D1, D2);

#define EOF '\n'
#define delim ','

// Credentials whne using NodeMCU as an Access Point (AP)
const char* ssid = "Capstone";
const char* password = "123456789";

// Create Async Web Server
AsyncWebServer server(80);

String intAirTemp;
String intHumidity;
String extAirTemp;
String extHumidity;
String waterTemp;
String soilMoisture;
String soilTemp;
String tds;

String waterLevel;
String filterAge;

// Maintenance Data
String getWaterLevel() {
  return waterLevel;
}
String getFilterAge() {
  return filterAge;
}
// Sensor Data
String getInternalAirTemp() {
  return intAirTemp;
}
String getExternalAirTemp() {
  return extAirTemp;
}
String getInternalHumidity() {
  return intHumidity;
}
String getExternalHumidity() {
  return extHumidity;
}
String getWaterTemp() {
  return waterTemp;
}
String getSoilTemp() {
  return soilTemp;
}
String getSoilMoisture() {
  return soilMoisture;
}
String getTDS() {
  return tds;
}

void sendSerial(String msg) {
  nodeSerial.print(msg);
  delay(100);
}

void setup() {
  Serial.begin(115200);
  
  // Setup Serial Connection
  nodeSerial.begin(57600);
  delay(1000);

  // Setup Async Web Server
  Serial.println();
  Serial.println("Configuring access point...");

  // Initialize SPIFFS for using HTML and CSS file
  if (!SPIFFS.begin()) {
    Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  }

  WiFi.softAP(ssid, password);

  IPAddress myIP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(myIP);

  // TODO: Add delays between these?

  // Route for root / web page
  server.on("/", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/index.html", String(), false);
  });

  // Route to load styling
  server.on("/style.css", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/style.css", "text/css");
  });
  server.on("/bootstrap.min.css", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/bootstrap.min.css", "text/css");
  });

  // Routes to load libraries
  server.on("/js/vendors/highcharts.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/vendors/highcharts.js", "text/javascript");
  });
  server.on("/js/vendors/jquery.min.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/vendors/jquery.min.js", "text/javascript");
  });

  // Routes to load scripts
  server.on("/charts_to_render.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/charts_to_render.js", "text/javascript");
  });
  server.on("/chart_list_item_component.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/chart_list_item_component.js", "text/javascript");
  });
  server.on("/chart_list_component.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/chart_list_component.js", "text/javascript");
  });
  server.on("/header_component.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/header_component.js", "text/javascript");
  });
  server.on("/info_panel_component.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/info_panel_component.js", "text/javascript");
  });
  server.on("/status_bar_component.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/status_bar_component.js", "text/javascript");
  });
  server.on("/dashboard.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/dashboard.js", "text/javascript");
  });
  server.on("/status_bar.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/status_bar.js", "text/javascript");
  });
  server.on("/info_panel.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/info_panel.js", "text/javascript");
  });
  server.on("/create_chart.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/create_chart.js", "text/javascript");
  });
  server.on("/store.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/store.js", "text/javascript");
  });
  server.on("/send.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/send.js", "text/javascript");
  });
  server.on("/charts.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/charts.js", "text/javascript");
  });
  server.on("/load.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/load.js", "text/javascript");
  });
  server.on("/maintenance.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/maintenance.js", "text/javascript");
  });
  server.on("/receive.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/receive.js", "text/javascript");
  });
  delay(1000);

  // Routes to send data to web page
  // Route to send internal air temperature reading
  server.on("/internal_air_temp", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getInternalAirTemp().c_str());
    intAirTemp = "";
  });
  // Route to send internal humidity reading
  server.on("/internal_humidity", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getInternalHumidity().c_str());
    intHumidity = "";
  });
  // Route to send external temperature reading
  server.on("/external_air_temp", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getExternalAirTemp().c_str());
    extAirTemp = "";
  });
  // Route to send external humidity reading
  server.on("/external_humidity", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getExternalHumidity().c_str());
    extHumidity = "";
  });
  // Route to send water temperature reading
  server.on("/water_temp", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getWaterTemp().c_str());
    waterTemp = "";
  });
  // Route to send soil temperature reading
  server.on("/soil_temp", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getSoilTemp().c_str());
    soilTemp = "";
  });
  // Route to send soil moisture reading
  server.on("/soil_moisture", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getSoilMoisture().c_str());
    soilMoisture = "";
  });
  // Route to send tds reading
  server.on("/tds", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getTDS().c_str());
    tds = "";
  });

  // Route to send maintenance notifications
  server.on("/water_level", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getWaterLevel().c_str());
    waterLevel = "";
  });
  server.on("/filter_age", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getFilterAge().c_str());
    filterAge = "";
  });
  
  // Route to get threshold values from UI and send to Arduino
  server.on("/threshold_control", HTTP_GET, [](AsyncWebServerRequest * request) {
    String type, minThresh, maxThresh, msg;
    // Can check for multiple specific parameters when dealing different controls on actuators being changed (min, max, etc.)
    if (request->hasParam("type") && request->hasParam("min") && request->hasParam("max")) {
      // Parse Route URL for parameters
      type = request->getParam("type")->value();
      minThresh = request->getParam("min")->value();
      maxThresh = request->getParam("max")->value();
      // Send to Arduino
      msg = "t:" + type + ":" + minThresh + "," + maxThresh + EOF;
      sendSerial(msg);
    }
    else {
      Serial.println("Missing parameter");
    }
  });

  // Route to control LED from UI and send to Arduino
  server.on("/led_control", HTTP_GET, [](AsyncWebServerRequest * request) {
    String brightness, msg;
    if (request->hasParam("brightness")) {
      // Parse Route URL for parameters
      brightness = request->getParam("brightness")->value();
      // Send to Arduino
      msg = "l:" + brightness + EOF;
      sendSerial(msg);
    }
    else {
      Serial.println("Missing parameter");
    }
  });

  // Route to set day/night cycle from UI and send to Arduino
  server.on("/day_night_cycle", HTTP_GET, [](AsyncWebServerRequest * request) {
    String cycleLength, cycleStart, isDay, msg;
    if (request->hasParam("length") && request->hasParam("start") && request->hasParam("day")) {
      // Parse Route URL for parameters
      cycleLength = request->getParam("length")->value();
      cycleStart = request->getParam("start")->value();
      isDay = request->getParam("day")->value();
      // Send to Arduino
      msg = "d:" + cycleLength + "," + cycleStart + "," + isDay + EOF;
      sendSerial(msg);
    }
    else {
      Serial.println("Missing parameter(s)");
    }
  });

  // Route to reset filter age in Arduino
  server.on("/filter_changed", HTTP_GET, [](AsyncWebServerRequest * request) {
    String age, msg;
    if (request->hasParam("age")) {
      age = request->getParam("age")->value();
      // Send to Arduino
      msg = "f:" + age + EOF;
      sendSerial(msg);
    }
    else {
      Serial.println("Missing parameter");
    }
  });

  server.begin();
}


void parseData(String msg) {
  unsigned int idDelim = msg.indexOf(':');
  String id = msg.substring(0, idDelim);
  String value = msg.substring(idDelim + 1, msg.length());
  if (id == "ih") {
    intHumidity = value;
  }
  else if (id == "eh") {
    extHumidity = value;
  }
  else if (id == "it") {
    intAirTemp = value;
  }
  else if (id == "et") {
    extAirTemp = value;
  }
  else if (id == "wt") {
    waterTemp = value;
  }
  else if (id == "st") {
    soilTemp = value;
  }
  else if (id == "sm") {
    soilMoisture = value;
  }
  else if (id == "td") {
    tds = value;
  }
  else {
    Serial.println("Unrecognized Data Type");
  }
}


void parseMaintenance(String msg) {
  unsigned int idDelim = msg.indexOf(':');
  String id = msg.substring(0, idDelim);
  String value = msg.substring(idDelim + 1, msg.length());
  if (id == "wl") {
    waterLevel = value;
  }
  else if (id == "ft") {
    filterAge = value;
  }
  else {
    Serial.println("Unrecognized Maint Type");
  }
}

void processMessage(String msg) {
  char msgType = msg.charAt(0);
  String msgContent = msg.substring(2, msg.length());
  switch(msgType) {
    case 'd':
      parseData(msgContent);
      break;
    case 'm':
      parseMaintenance(msgContent);
      break;
    default:
      Serial.println("Unrecognized Message Type");
      break;
  }
}

char c;
String dataIn;

void loop() {
  // Receive messages from Arduino
  while(nodeSerial.available()) {
    c = nodeSerial.read();
    if (c == EOF) {break;}
    else {dataIn += c;}
  }
  if (c == EOF) {
    // Serial.println(dataIn);
    processMessage(dataIn);
    c = 0;
    dataIn = "";
  }
}
