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

String maint_msg;

String getMaintenanceMsg() {
  return maint_msg;
}
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
  server.on("/bootstrap.min.css", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/bootstrap.min.css", "text/css");
  });

  // Routes to load javascript libraries
  server.on("/js/vendors/highcharts.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/vendors/highcharts.js", "text/javascript");
  });
  server.on("/js/vendors/jquery.min.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/vendors/jquery.min.js", "text/javascript");
  });


  // Routes to load javascript scripts
  server.on("/js/scripts/charts_to_render.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/scripts/charts_to_render.js", "text/javascript");
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
  server.on("/dashboard.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/dashboard.js", "text/javascript");
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
  server.on("/receive.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/receive.js", "text/javascript");
  });
//  server.on("/js/scripts/components/chart_list_item_component.js", HTTP_GET, [](AsyncWebServerRequest * request) {
//    request->send(SPIFFS, "/js/scripts/chart_list_item_component.js", "text/javascript");
//  });
//  server.on("/js/scripts/chart_list_component.js", HTTP_GET, [](AsyncWebServerRequest * request) {
//    request->send(SPIFFS, "/js/scripts/chart_list_component.js", "text/javascript");
//  });
//  server.on("/js/scripts/header_component.js", HTTP_GET, [](AsyncWebServerRequest * request) {
//    request->send(SPIFFS, "/js/scripts/header_component.js", "text/javascript");
//  });
//  server.on("/js/scripts/info_panel_component.js", HTTP_GET, [](AsyncWebServerRequest * request) {
//    request->send(SPIFFS, "/js/scripts/info_panel_component.js", "text/javascript");
//  });
//  delay(1000);
//  server.on("/js/scripts/dashboard.js", HTTP_GET, [](AsyncWebServerRequest * request) {
//    request->send(SPIFFS, "/js/scripts/dashboard.js", "text/javascript");
//  });
//  server.on("/js/scripts/create_chart.js", HTTP_GET, [](AsyncWebServerRequest * request) {
//    request->send(SPIFFS, "/js/scripts/create_chart.js", "text/javascript");
//  });
//  server.on("/js/scripts/charts.js", HTTP_GET, [](AsyncWebServerRequest * request) {
//    request->send(SPIFFS, "/js/scripts/charts.js", "text/javascript");
//  });
//  server.on("/js/scripts/load.js", HTTP_GET, [](AsyncWebServerRequest * request) {
//    request->send(SPIFFS, "/js/scripts/load.js", "text/javascript");
//  });
//  server.on("/js/scripts/store.js", HTTP_GET, [](AsyncWebServerRequest * request) {
//    request->send(SPIFFS, "/js/scripts/store.js", "text/javascript");
//  });
//  server.on("/js/scripts/send.js", HTTP_GET, [](AsyncWebServerRequest * request) {
//    request->send(SPIFFS, "/js/scripts/send.js", "text/javascript");
//  });
//  server.on("/js/scripts/receive.js", HTTP_GET, [](AsyncWebServerRequest * request) {
//    request->send(SPIFFS, "/js/scripts/receive.js", "text/javascript");
//  });
//  server.on("/js/scripts/info_panel.js", HTTP_GET, [](AsyncWebServerRequest * request) {
//    request->send(SPIFFS, "/js/scripts/info_panel.js", "text/javascript");
//  });
  
  // Routes to send data to web page
  // Route to send internal air temperature reading
  server.on("/internal_air_temp", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getInternalAirTemp().c_str());
  });
  // Route to send internal humidity reading
  server.on("/internal_humidity", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getInternalHumidity().c_str());
  });
  // Route to send external temperature reading
  server.on("/external_air_temp", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getExternalAirTemp().c_str());
  });
  // Route to send external humidity reading
  server.on("/external_humidity", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getExternalHumidity().c_str());
  });
  // Route to send water temperature reading
  server.on("/water_temp", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getWaterTemp().c_str());
  });
  // Route to send soil temperature reading
  server.on("/soil_temp", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getSoilTemp().c_str());
  });
  // Route to send soil moisture reading
  server.on("/soil_moisture", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getSoilMoisture().c_str());
  });
  // Route to send tds reading
  server.on("/tds", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getTDS().c_str());
  });

  // Route to send maintenance notifications
  server.on("/maintenance", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/plain", getMaintenanceMsg().c_str());
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
  if (maint_type == "wl") {
    // TODO: Inform user of water level
    // maint here is percentage of water level
    maint_msg = "wl:" + String(maint) + EOF;
  }
  else if (maint_type == "ft") {
    // TODO: Inform time to change filter
    // maint here is time since last filter change?
    maint_msg = "ft:" + maint + EOF;
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
