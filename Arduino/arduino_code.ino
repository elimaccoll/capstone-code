#include <OneWire.h>
#include <DallasTemperature.h>
#include <SoftwareSerial.h>
#include <dht.h>

// TODO: Do we want to use some sort of algorithm (median filtering algorithm - see TDS sensor code)
// TODO: Use millis() for reading on different intervals - number of milliseconds since started runing current program

SoftwareSerial arduinoSerial(12, 13);

#define EOF '\n'
#define VREF 5.0 // analog reference voltage of the ADC


// TODO: Replace with actual sensor pin numbers
// Sensor Pins
const int LED_CONTROL_PIN = 8;

#define TDS_PIN A1

#define SOIL_MOISTURE_PIN A2

#define ONE_WIRE_PIN 3
OneWire oneWire(ONE_WIRE_PIN);
DallasTemperature ONE_WIRE(&oneWire);
int ONE_WIRE_COUNT = 0;

//const int DHT_PIN = 9;
#define DHT_PIN 9
dht DHT;

// Read Timings (seconds)
const int READ_INTERNAL_AIR_TEMP = 1;
const int READ_INTERNAL_HUMIDITY = 1;
const int READ_EXTERNAL_AIR_TEMP = 3;
const int READ_EXTERNAL_HUMIDITY = 3;
const int READ_SOIL_MOISTURE = 5;
const int READ_TDS = 5;
const int READ_WATER_LEVEL = 10;

float filter_timer;

// Initial control loop values - Have these intially match the js values
float int_humidity_max = 50;
float int_humidity_min = 40;

float int_air_temp_max = 30;
float int_air_temp_min = 20;

float soil_temp_max;
float soil_temp_min;

float soil_moisture_max;
float soil_moisture_min;

float water_temp_max;
float water_temp_min;

float tds_max;
float tds_min;


void setup() {
  // Serial to print
  Serial.begin(115200);

  // TODO: Replace with actual sensor and actuator setup - used for demo
  pinMode(LED_CONTROL_PIN, OUTPUT);

  pinMode(TDS_PIN, INPUT);
  pinMode(SOIL_MOISTURE_PIN, INPUT);

  ONE_WIRE.begin();
  ONE_WIRE_COUNT = ONE_WIRE.getDeviceCount();


  // TODO: Remove - used for demo
  digitalWrite(LED_CONTROL_PIN, LOW);

  filter_timer = 0;

  // Start serial connection to NodeMCU
  arduinoSerial.begin(57600);

  delay(1000);
}

// Read sensor data
void readDHT() {
  int chk = DHT.read11(DHT_PIN); 
  // TODO: Figure out chk codes and verify here
}
float readInternalAirTemp() {
  // readDHT();
  // return DHT.temperature;
  return readOneWire();
}
float readInternalHumidity() {
  readDHT();
  return DHT.humidity;
}
float readExternalAirTemp() {
  // TODO: Read from whichever temp sensor is outside enclosure
  return;
}
float readExternalHumidity() {
  // TODO: Read from whichever humidity sensor is outside enclosure
  return;
}
// TODO: Test this
float readTDS() {
  float analog_tds = analogRead(TDS_PIN);
  float voltage = analog_tds * (float)VREF / 1024.0; // convert to voltage value
  float curr_temp = readInternalAirTemp();
  float compensation_coeff = 1.0 + 0.02 * (curr_temp - 25.0); //temperature compensation formula: fFinalResult(25^C) = fFinalResult(current)/(1.0+0.02*(fTP-25.0));
  float compensation_voltage = voltage / compensation_coeff; //temperature compensation
  float tds_value = (133.42 * compensation_voltage * compensation_voltage * compensation_voltage - 255.86 * compensation_voltage * compensation_voltage + 857.39 * compensation_voltage) * 0.5; //convert voltage value to tds value
  return tds_value;
}
float readSoilMoisture() {
  float soil_moisture = analogRead(SOIL_MOISTURE_PIN);
  return soil_moisture;
}
float readOneWire() {
  ONE_WIRE.requestTemperatures();
  float avg_tempC = 0;
  for (int i = 0; i < ONE_WIRE_COUNT; i++) {
      float tempC = ONE_WIRE.getTempCByIndex(i);
      avg_tempC += tempC;
      // Serial.println(DallasTemperature::toFahrenheit(tempC));
  }
  avg_tempC = avg_tempC/ONE_WIRE_COUNT;
  return avg_tempC;
}
float readLiquidLevel() {
  // TODO: 
  // 1. Check the water level
  // 2. Do we want to estimate water level?
  // - If yes, return the estimate as a float
  // - If no, have this return a booelan (false means resevoir is running low)

  return;
}

/* ih - Internal humidity (inside enclosure)
 * eh - External humidity (outside enclosure)
 * it - Internal air temp. (inside enclosure)
 * et - External air temp. (outside enclosure)
 * wt - Water temp.
 * st - Soil temp.
 * sm - Soil moisture
 * td - TDS ppm
 * 
 * E.g., "d:ih:45\n"
 */
// Send sensor data to NodeMCU to be displayed
void sendDataMsg(String id, float data) {
  String msg = "";
  msg = "d:" + id + ":" + String(data) + EOF;
  Serial.println("Sending data: " + msg);
  arduinoSerial.print(msg);
}

/*
 * wl - Water level (Water level is low)
 * ft - Filter time (Need to change filter)
 * 
 * E.g., msg = "m:wl:15\n"
 */
// TODO: Decide what to put as content of maintence message (do I even need content?)
// Send maintenance message to NodeMCU (Node has full versions of the maintenance msgs)
void sendMaintenanceMsg(String id, String maint_msg) {
  String msg = "";
  msg = "m:" + id + ":" + maint_msg + EOF;
  Serial.println("Sending maintenance: " + msg);
  arduinoSerial.print(msg);
}


void configThreshold(String config_str) {
  String config_type = config_str.substring(0, config_str.indexOf(':'));
  String config_set = config_str.substring(config_str.indexOf(':') + 1, config_str.length());

  // TODO: Should check if valid before doing this
  String min_value_str = config_set.substring(0, config_set.indexOf(','));
  float min_value = min_value_str.toFloat();
  String max_value_str = config_set.substring(config_set.indexOf(',') + 1, config_set.length());
  float max_value = max_value_str.toFloat();

  Serial.println("Threshold Update for " + config_type);
  Serial.println("MIN: " + String(min_value) + " | MAX: " + String(max_value));
  
  if (config_type == "it") {
    int_air_temp_min = min_value;
    int_air_temp_max = max_value;
  }
  else if (config_type == "ih") {
    int_humidity_min = min_value;
    int_humidity_max = max_value;
  }
  else if (config_type == "st") {
    soil_temp_min = min_value;
    soil_temp_max = max_value;
  }
  else if (config_type == "wt") {
    water_temp_min = min_value;
    water_temp_max = max_value;
  }
  else if (config_type == "sm") {
    soil_moisture_min = min_value;
    soil_moisture_max = max_value;
  }
  else if (config_type == "td") {
    tds_min = min_value;
    tds_max = max_value;
  }
  else {
    Serial.println("Unrecognized message type");
  }
}


void processMessage(String msg) {
  /* Parse the message type received from NodeMCU
   *  t - Threshold change
   *  f - Filter changed (?)
   *  l - Lights (?)
   */ 
  char msg_type = msg.charAt(0);
  String config_str = msg.substring(2, msg.length());
  
  switch(msg_type) {
    case 't':
      configThreshold(config_str);
      break;
    case 'f':
      // Reset filter timer - the message being received indicates that user changed filter
      filter_timer = 0;
      break;
    case 'l':
      // TODO: Control lights
      break;
    default:
      Serial.println("Unrecognized Message type");
      break;
  }
}

char c; // Used for reading characters over serial connection
String dataIn; // Used to build strings using the characters (c) read over serial connection
int clk = 0; // Used to read sensors on different intervals

// TODO: Calculate this as max(all read times) + 1 | Manually set for now
const int CLK_RESET = 11; // Reset timer to 0 when it reaches this value (read time of sensor with max read time)

// TODO: Pick amount of time to change filters
// const int FILTER_SWAP = 
unsigned long current_time;

// Main loop
void loop() {
  current_time = millis();
  
  // Read sensor data on different intervals
  if (clk % READ_INTERNAL_AIR_TEMP == 0) {
    float int_air_temp = readInternalAirTemp();
    sendDataMsg("it", int_air_temp);
  }
  if (clk % READ_INTERNAL_HUMIDITY == 0) {
    float int_humidity = readInternalHumidity();

    // Control loop logic for internal humidity
    if (int_humidity > int_humidity_max || int_humidity < int_humidity_min) {
      digitalWrite(LED_CONTROL_PIN, HIGH);
    }
    else {
      digitalWrite(LED_CONTROL_PIN, LOW);
    }
    
    sendDataMsg("ih", int_humidity);
  }
  if (clk % READ_EXTERNAL_AIR_TEMP == 0) {
    float ext_air_temp = readExternalAirTemp();
//    sendDataMsg("et", ext_air_temp);
  }
  if (clk % READ_EXTERNAL_HUMIDITY == 0) {
    float ext_humidity = readExternalHumidity();
//    sendDataMsg("eh", ext_humidity);
  }
  if (clk % READ_SOIL_MOISTURE == 0) {
    float soil_moisture = readSoilMoisture();
//    sendDataMsg("sm", soil_moisture);
  }
  if (clk % READ_TDS == 0) {
    float tds = readTDS();
//    sendDataMsg("td", tds);
  }
  if (clk % READ_WATER_LEVEL == 0) {
    // TODO: Update this depending on how we decide to use liquid level info
    float water_level = readLiquidLevel();
    // TODO: Send water level on a consistent interval so user can see when resevoir is low

    // Estimate water level
    float perc_water_level;
    
    // sendMaintenanceMsg("wl", String(perc_water_level));
  }
 /*
 if ((current_time - filter_timer) >= FILTER_SWAP) {
   unsigned long time_since_last_filter_change = (current_time - filter_timer);
   // Send filter timer maintenance to be displayed on webpage
   // sendMaintenanceMsg("ft", String(time_since_last_filter_change)); // Not sure what the msg should be/if there needs to be one
 }
 */ 

  // Receive messages over Serial connection
  while (arduinoSerial.available() > 0) {
    // Build dataIn message string
    c = arduinoSerial.read();
    if (c == EOF) {break;}
    else {dataIn += c;}
  }
  // EOF is reached
  if (c == EOF) {
    Serial.println(dataIn);
    // Process the completed message
    processMessage(dataIn);
    // Reset variables
    c = 0;
    dataIn = "";
  }

  clk = (clk + 1) % CLK_RESET;
  delay(1000); // Wait 1 second between each reading
}
