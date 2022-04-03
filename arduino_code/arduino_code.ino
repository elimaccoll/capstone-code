#include <OneWire.h>
#include <DallasTemperature.h>
#include <SoftwareSerial.h>
#include <dht.h>

// TODO: Clean up message parsing

class Sensor {
    private:
        String id;
        int pin;
        int readInterval;
        int lastRead;
        float minThresh;
        float maxThresh;
    public:
        Sensor(String _id, int _pin, int _readInterval, float _minThresh, float _maxThresh) {
            id = _id;
            pin = _pin;
            readInterval = _readInterval;
            minThresh = _minThresh;
            maxThresh = _maxThresh;
        }
        void setMinThresh(float _minThresh) { minThresh = _minThresh; }
        void setMaxThresh(float _maxThresh) { maxThresh = _maxThresh; }
        String getId() { return id; }
        // Override this function if setup is different than just setting pinMode - OneWires
        virtual void setup() {
            pinMode(pin, INPUT);
        }
        void updateLastRead() { /* TODO: set lastRead to current time - call in read() */ return; }
        bool readyToRead(); // TODO: return ((current_time - lastRead) >= readInterval)
        void print() {
            Serial.println("Min thresh: " + String(minThresh) + " | Max thresh: " + String(maxThresh));
        };
        virtual float read() { return (float) 0; };
};

class Temperature : public Sensor {
    public:
        Temperature(String id, int pin, int readInterval, float minThresh, float maxThresh) 
            : Sensor(id, pin, readInterval, minThresh, maxThresh) {}
        float read() override {
            Serial.println("Read temperature");
            updateLastRead();
            return (float) 1.1;
        }
};

class Humidity : public Sensor {
    public:
        Humidity(String id, int pin, int readInterval, float minThresh, float maxThresh) 
            : Sensor(id, pin, readInterval, minThresh, maxThresh) {}
        float read() override {
            Serial.println("Read humidity");
            updateLastRead();
            return (float) 2.2;
        }
};

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
 * E.g., msg = "m:wl:0\n"
 */
void sendMaintenanceMsg(String id, String maint_msg) {
  String msg = "";
  msg = "m:" + id + ":" + maint_msg + EOF;
  Serial.println("Sending maintenance: " + msg);
  arduinoSerial.print(msg);
}

// Sensor Suite Operations
void print(Sensor* sensors[], int size) {
    for (int i = 0; i < size; i++) {
        sensors[i]->print();
    }
}

void read(Sensor* sensors[], int size) {
    for (int i = 0; i < size; i++) {
        // if (sensors[i].readyToRead()) {
        //   sendDataMsg(sensors[i]->getId(), sensors[i]->read());
        //}
        sendDataMsg(sensors[i]->getId(), sensors[i]->read());
    }
}

// TODO: Abstract these pin numbers
SoftwareSerial arduinoSerial(12, 13);

#define EOF '\n'
#define VREF 5.0 // analog reference voltage of the ADC

// Control Pins
const int DEMO_LED_PIN = 8;

// Sensor Pins
#define SOIL_MOISTURE_PIN A1

#define TDS_PIN A2

#define LIQUID_LEVEL_PIN 52

#define ONE_WIRE_PIN 3
OneWire oneWire(ONE_WIRE_PIN);
DallasTemperature ONE_WIRE(&oneWire);
int ONE_WIRE_COUNT = 0;

#define DHT_PIN 9
dht DHT;

// Read Timings (seconds)
const int READ_INTERNAL_AIR_TEMP = 1;
const int READ_INTERNAL_HUMIDITY = 1;
const int READ_EXTERNAL_AIR_TEMP = 3;
const int READ_EXTERNAL_HUMIDITY = 3;
const int READ_SOIL_TEMP = 3;
const int READ_WATER_TEMP = 3;
const int READ_SOIL_MOISTURE = 5;
const int READ_TDS = 5;
const int READ_WATER_LEVEL = 10;

float filter_timer;

// Default control loop values - make these match the default javascript thresholds
float int_humidity_max = 50;
float int_humidity_min = 40;

float int_air_temp_max = 30;
float int_air_temp_min = 20;

float soil_temp_max = 15;
float soil_temp_min = 5;

float soil_moisture_max = 60;
float soil_moisture_min = 50;

float water_temp_max = 15;
float water_temp_min = 5;

float tds_max = 100;
float tds_min = 0;


void setup() {
  // Serial to print
  Serial.begin(115200);

  // TODO: replace current setup with this for each sensor
  // Temperature *it1 = new Temperature("it", pin, READ_INTERNAL_AIR_TEMP, int_air_temp_min, int_air_temp_max)

  pinMode(TDS_PIN, INPUT);
  pinMode(SOIL_MOISTURE_PIN, INPUT);
  pinMode(LIQUID_LEVEL_PIN, INPUT_PULLUP);

  ONE_WIRE.begin();
  ONE_WIRE_COUNT = ONE_WIRE.getDeviceCount();


  // TODO: Remove - used for demo
  pinMode(DEMO_LED_PIN, OUTPUT);
  digitalWrite(DEMO_LED_PIN, LOW);

  filter_timer = 0;

  // Start serial connection to NodeMCU
  arduinoSerial.begin(57600);

  delay(1000);
}

// TODO: Move read logic into respective classes
// Read sensor data
void readDHT() {
  // TODO: Read all DHTs
  int chk = DHT.read11(DHT_PIN); 
}
float readInternalAirTemp() {
  // TODO: Average internal air temperature sensors
  return readOneWire();
}
float readInternalHumidity() {
  // TODO: Average internal humidity sensors
  readDHT();
  return DHT.humidity;
}
float readExternalAirTemp() {
  // TODO: Read from whichever temp sensor is outside enclosure
  return readOneWire() + random(5, 20);
}
float readExternalHumidity() {
  // TODO: Read from whichever humidity sensor is outside enclosure
  readDHT();
  return DHT.humidity + random(5, 20);
}
float readTDS() {
  float analog_tds = analogRead(TDS_PIN);
  float voltage = analog_tds * (float)VREF / 1024.0; // convert to voltage value
  float curr_temp = readInternalAirTemp();
  float compensation_coeff = 1.0 + 0.02 * (curr_temp - 25.0); //temperature compensation formula: fFinalResult(25^C) = fFinalResult(current)/(1.0+0.02*(fTP-25.0));
  float compensation_voltage = voltage / compensation_coeff; //temperature compensation
  float tds_value = (133.42 * compensation_voltage * compensation_voltage * compensation_voltage - 255.86 * compensation_voltage * compensation_voltage + 857.39 * compensation_voltage) * 0.5; //convert voltage value to tds value
  return tds_value;
}

float readWaterTemp() {
  // TODO: Read whichever temp sensor is for water
  float water_temp = 0;
  return water_temp;
}

float readSoilTemp() {
  // TODO: Read whichever temp sensor is for soil
  float soil_temp = 0;
  return soil_temp;
}

float readSoilMoisture() {
  // TODO: Fix conversion / decide how to represent
  float soil_moisture = analogRead(SOIL_MOISTURE_PIN);
  float soil_moisture_percent = (float) map(soil_moisture, 0, 1023, 0, 100);
  return soil_moisture_percent;
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
int readLiquidLevel() {
  // Returns 0 when water is low, 1 otherwise
  int liquid_level = digitalRead(LIQUID_LEVEL_PIN);
  return liquid_level;
}

// TODO: Set thresholds with classes instead of the default variables
void configThreshold(String config_str) {
  // TODO: Clean this up
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


void configLEDBrightness(String brightness_str) {
  float brightness = brightness_str.toFloat();
  Serial.println(brightness);
  // analogWrite(LED_PIN, brightness);
}

void processMessage(String msg) {
  /* Parse the message type received from NodeMCU
   *  t - Threshold change
   *  f - Filter changed
   *  l - Lights
   *  E.g. msg = "l:64\n", msg = "t:sm:30,40\n"
   */ 
  char msg_type = msg.charAt(0);
  String config_str = msg.substring(2, msg.length());
  
  switch(msg_type) {
    case 't':
      configThreshold(config_str);
      break;
    case 'f':
      // TODO: Reset filter timer - the message being received indicates that user changed filter
      filter_timer = 0;
      break;
    case 'l':
      configLEDBrightness(config_str);
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
  
  // TODO: Update reading sensors to use classes instead
  
  // Read sensor data on different intervals
  if (clk % READ_INTERNAL_AIR_TEMP == 0) {
    float int_air_temp = readInternalAirTemp();
    sendDataMsg("it", int_air_temp);
  }

  if (clk % READ_INTERNAL_HUMIDITY == 0) {
    float int_humidity = readInternalHumidity();

    // Control loop logic for internal humidity
    if (int_humidity > int_humidity_max || int_humidity < int_humidity_min) {
      digitalWrite(DEMO_LED_PIN, HIGH);
    }
    else {
      digitalWrite(DEMO_LED_PIN, LOW);
    }
    
    sendDataMsg("ih", int_humidity);
  }

  if (clk % READ_EXTERNAL_AIR_TEMP == 0) {
    float ext_air_temp = readExternalAirTemp();
    sendDataMsg("et", ext_air_temp);
  }

  if (clk % READ_EXTERNAL_HUMIDITY == 0) {
    float ext_humidity = readExternalHumidity();
    sendDataMsg("eh", ext_humidity);
  }

  if (clk % READ_WATER_TEMP == 0) {
    float water_temp = readWaterTemp();
//    sendDataMsg("wt", water_temp);
  }

  if (clk % READ_SOIL_TEMP == 0) {
    float soil_temp = readSoilTemp();
//    sendDataMsg("st", soil_temp);
  }

  if (clk % READ_SOIL_MOISTURE == 0) {
    float soil_moisture = readSoilMoisture();
    sendDataMsg("sm", soil_moisture);
  }

  if (clk % READ_TDS == 0) {
    float tds = readTDS();
    sendDataMsg("td", tds);
  }

  if (clk % READ_WATER_LEVEL == 0) {
    int liquid_level = readLiquidLevel();
    sendMaintenanceMsg("wl", String(liquid_level));
  }
  // TODO: Check filter time
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
