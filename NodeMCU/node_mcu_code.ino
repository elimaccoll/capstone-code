// Library for Serial Connection b/w NodeMCU and Arduino
#include <SoftwareSerial.h>
// Libraries for Async Web Server
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
// Library for File system (use HTML and CSS files)
#include <FS.h>

SoftwareSerial nodeSerial(D1, D2);

#define EOF '\n'
#define delim ','

// Credentials whne using NodeMCU as an Access Point (AP)
const char* ssid = "Capstone";
const char* password = "123456789";

// Create Async Web Server
AsyncWebServer server(80);

String internal_air_temp;
String internal_humidity;
String external_air_temp;
String external_humidity;
String water_temp;
String soil_moisture;
String soil_temp;
String tds;

String maint_msg = "";

String getInternalAirTemp() {
  return internal_air_temp;
}
String getExternalAirTemp() {
  return external_air_temp;
}
String getInternalHumidity() {
  return internal_humidity;
}
String getExternalHumidity() {
  return external_humidity;
}
String getWaterTemp() {
  return water_temp;
}
String getSoilTemp() {
  return soil_temp;
}
String getSoilMoisture() {
  return soil_moisture;
}
String getTDS() {
  return tds;
}

void setup() {
  Serial.begin(115200);
  
  // Setup Serial Connection
  nodeSerial.begin(57600);

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

  // Route for root / web page
  server.on("/", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/index.html", String(), false);
  });

  // Route to load style.css file
  server.on("/style.css", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/style.css", "text/css");
  });

  // Routes to load javascript libraries
  server.on("/js/libraries/highcharts.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/libraries/highcharts.js", "text/javascript");
  });
  server.on("/js/libraries/jquery.min.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/libraries/jquery.min.js", "text/javascript");
  });

  // Routes to load javascript scripts
  server.on("/js/scripts/get_sensor_data.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/scripts/get_sensor_data.js", "text/javascript");
  });
  server.on("/js/scripts/send_config.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/scripts/send_config.js", "text/javascript");
  });
  server.on("/js/scripts/charts_util.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/scripts/charts_util.js", "text/javascript");
  });
  server.on("/js/scripts/layout.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/scripts/layout.js", "text/javascript");
  });
  server.on("/js/scripts/info_panel.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/scripts/info_panel.js", "text/javascript");
  });
  server.on("/js/scripts/charts.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/scripts/charts.js", "text/javascript");
  });
  server.on("/js/scripts/datastore.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/scripts/datastore.js", "text/javascript");
  });


  // Routes to send data to web page
  // Route to send temperature reading
  server.on("/internal_air_temp", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getInternalAirTemp().c_str());
  });
  // Route to send humidity reading
  server.on("/internal_humidity", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getInternalHumidity().c_str());
  });

  // Route to send maintenance notifications
  server.on("/maintenance", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", maint_msg);
    maint_msg = "";
  });
  
  // Route to get threshold values from web page
  server.on("/threshold_control", HTTP_GET, [](AsyncWebServerRequest * request) {
    String type, min_value, max_value, msg;
    // Can check for multiple specific parameters when dealing different controls on actuators being changed (min, max, etc.)
    if (request->hasParam("type") && request->hasParam("min") && request->hasParam("max")) {
      // Parse Route URL for parameters
      type = request->getParam("type")->value();
      min_value = request->getParam("min")->value();
      max_value = request->getParam("max")->value();
      // Send to Arduino
      msg = "t:" + type + ":" + min_value + "," + max_value + EOF;
      nodeSerial.print(msg);
    }
    else {
      Serial.println("Type value field was missing");
    }
  });

  server.begin();
}


void parseData(String data_str) {
  String data_type = data_str.substring(0, data_str.indexOf(':'));
  String data = data_str.substring(data_str.indexOf(':') + 1, data_str.length());
  if (data_type == "ih") {
    internal_humidity = data;
  }
  else if (data_type == "eh") {
    external_humidity = data;
  }
  else if (data_type == "it") {
    internal_air_temp = data;
  }
  else if (data_type == "et") {
    external_air_temp = data;
  }
  else if (data_type == "wt") {
    water_temp = data;
  }
  else if (data_type == "st") {
    soil_temp = data;
  }
  else if (data_type == "sm") {
    soil_moisture = data;
  }
  else if (data_type == "td") {
    tds = data;
  }
  else {
    Serial.println("Unrecognized Data Type");
  }
}


void parseMaintenance(String maint_str) {
  String maint_type = maint_str.substring(0, maint_str.indexOf(':'));
  String maint = maint_str.substring(maint_str.indexOf(':') + 1, maint_str.length());
  String maint_msg = "";
  if (maint_type == "wl") {
    // TODO: Inform user of water level
    // maint here is percentage of water level
    maint_msg = "wl:" + String(maint) + EOF;
    return;
  }
  else if (maint_type == "ft") {
    // TODO: Inform time to change filter
    // maint here is time since last filter change?
    maint_msg = "ft:" + maint + EOF;
    return;
  }
  else {
    Serial.println("Unrecognized Maint Type");
  }
}

void processMessage(String msg) {
  char msg_type = msg.charAt(0);
  String msg_str = msg.substring(2, msg.length());
  switch(msg_type) {
    case 'd':
      parseData(msg_str);
      break;
    case 'm':
      parseMaintenance(msg_str);
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
    Serial.println(dataIn);
    processMessage(dataIn);
    c = 0;
    dataIn = "";
  }
}