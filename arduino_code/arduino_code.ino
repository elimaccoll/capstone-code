#include <OneWire.h>
#include <DallasTemperature.h>
#include <SoftwareSerial.h>
#include <dht.h>

// TODO: Figure out delay timing on setup
// TODO: Clean up message parsing
// TODO: UI continues to plot previously plotted value if there is no new value by the next read interval
// TODO: Need to sent thresholds cleaner - get corrupted and misinterpretted a lot (add delay after send)
// TODO: Make a generic Temperature class to subclass Water, soil and air

float recentAirTemp;

#define RX_PIN 12
#define TX_PIN 13
SoftwareSerial arduinoSerial(RX_PIN, TX_PIN);

#define EOF '\n'
#define VREF 5.0 // analog reference voltage of the ADC

// Control Pins
//TODO: Remove - used for demo
const int DEMO_LED_PIN = 8;

#define MISTER_PIN 4

// Sensor Pins
#define TDS_PIN A0
#define SOIL_MOISTURE_PIN A1
#define LIQUID_LEVEL_PIN 52
#define ONE_WIRE_BUS_PIN 3
#define DHT_PIN1 9
#define DHT_PIN2 10

const unsigned int DHT_PINS[2] = {DHT_PIN1, DHT_PIN2};
const int NUM_DHT = 2;


class Sensor {
    private:
      String id;
      unsigned int readInterval;
      unsigned long lastRead = 0;
      float recentValue;
      float minThresh;
      float maxThresh;
      float avgThresh;
    public:
      Sensor(String _id, unsigned int _readInterval, float _minThresh, float _maxThresh) {
        id = _id;
        readInterval = _readInterval;
        minThresh = _minThresh;
        maxThresh = _maxThresh;
        avgThresh = (maxThresh + minThresh) / 2;
      }
      void setThresholds(float _minThresh, float _maxThresh) { 
        minThresh = _minThresh;
        maxThresh = _maxThresh;
        avgThresh = (maxThresh + minThresh) / 2;
      }
      void updateLastRead() { lastRead = millis(); }
      void setRecentValue(float _recentValue) {
        recentValue = _recentValue;
        updateLastRead();
      }
      String getId() { return id; }
      virtual void setupSensor() { return; }
      bool readyToRead() { return ((millis() - lastRead) >= ((long) readInterval)); }
      void printSensor() { Serial.println("Min thresh: " + String(minThresh) + " | Max thresh: " + String(maxThresh)); }
      int checkControl() {
        if (recentValue < avgThresh) return -1;
        else if (recentValue > avgThresh) return 1;
        else return 0;
      }
      virtual float readSensor() { return (float) 0; } // Override to read sensor
      virtual void control() { return; } // Override to control actuaors
};

class AirTemperatureOW : public Sensor {
    private:
      OneWire oneWire;
      DallasTemperature oneWireSensors;
      unsigned int oneWireCount = 0;
      unsigned int PIN = ONE_WIRE_BUS_PIN;
    public:
      AirTemperatureOW(String id, unsigned int readInterval, float minThresh, float maxThresh) 
          : Sensor(id, readInterval, minThresh, maxThresh) {}
      void setupSensor() override {
        oneWire = OneWire(PIN);
        oneWireSensors.setOneWire(&oneWire);
        oneWireSensors.begin();
        oneWireCount = oneWireSensors.getDeviceCount();
      }
      float readSensor() override {
        oneWireSensors.requestTemperatures();
        float avgTempC = 0;
        for (int i = 0; i < oneWireCount; i++) {
            float tempC = oneWireSensors.getTempCByIndex(i);
            avgTempC += tempC;
            // Serial.println(DallasTemperature::toFahrenheit(tempC));
        }
        avgTempC /= oneWireCount;
        setRecentValue(avgTempC);
        recentAirTemp = avgTempC;
        control();
        return avgTempC;
      }
      void control() override {
        if (checkControl() == 0) return;
        else if (checkControl() == -1) {
//          Serial.println("Air temperature below minThresh");
        }
        else {
//          Serial.println("Air temperature above maxThresh");
        }
      }
};

class AirTemperatureDHT : public Sensor {
    private:
      dht DHT;
    public:
      AirTemperatureDHT(String id, unsigned int readInterval, float minThresh, float maxThresh) 
          : Sensor(id, readInterval, minThresh, maxThresh) {}
      void setupSensor() override {
        for (int i = 0; i < NUM_DHT; i++) {
          pinMode(DHT_PINS[i], OUTPUT);
        }
      }
      float readSensor() override {
          float avgTemp = 0;
          for (int i = 0; i < NUM_DHT; i++) {
            DHT.read11(DHT_PINS[i]);
            float temp = DHT.temperature;
            avgTemp += temp;
          }
          avgTemp /= NUM_DHT;
          setRecentValue(avgTemp);
          control();
          return avgTemp;
      }
      void control() override {
        if (checkControl() == 0) return;
        else if (checkControl() == -1) {
//          Serial.println("Air temperature below minThresh");
        }
        else {
//          Serial.println("Air temperature above maxThresh");
        }
      }
};

class Humidity : public Sensor {
    private:
      dht DHT;
    public:
        Humidity(String id, unsigned int readInterval, float minThresh, float maxThresh) 
            : Sensor(id, readInterval, minThresh, maxThresh) {}
        void setupSensor() override {
          for (int i = 0; i < NUM_DHT; i++) {
            pinMode(DHT_PINS[i], OUTPUT);
          }
        }
        float readSensor() override {
          float avgHumidity = 0;
          for (int i = 0; i < NUM_DHT; i++) {
            DHT.read11(DHT_PINS[i]);
            float humidity = DHT.humidity;
            Serial.println(String(i) + ": " + String(humidity));
            avgHumidity += humidity;
          }
          avgHumidity /= NUM_DHT;
          setRecentValue(avgHumidity);
          control();
          return avgHumidity;
        }
        void control() override {
          if (checkControl() == 0) {
            digitalWrite(MISTER_PIN, LOW);
            digitalWrite(DEMO_LED_PIN, LOW);
          }
          else if (checkControl() == -1) {
//            Serial.println("Humidity below minThresh");
            digitalWrite(MISTER_PIN, HIGH);
            digitalWrite(DEMO_LED_PIN, HIGH);
          }
          else {
//            Serial.println("Humidity above maxThresh");
            digitalWrite(MISTER_PIN, LOW);
            digitalWrite(DEMO_LED_PIN, LOW);
          }
        }
};

class SoilMoisture : public Sensor {
    public:
        SoilMoisture(String id, unsigned int readInterval, float minThresh, float maxThresh) 
            : Sensor(id, readInterval, minThresh, maxThresh) {}
        void setupSensor() override {
          pinMode(SOIL_MOISTURE_PIN, INPUT);
        }
        float readSensor() override {
          // TODO: Fix conversion / decide how to represent
          float soil_moisture = analogRead(SOIL_MOISTURE_PIN);
          float soil_moisture_percent = (float) map(soil_moisture, 0, 1023, 0, 100);
          setRecentValue(soil_moisture_percent);
          control();
          return soil_moisture_percent;
        }
        void control() override {
          if (checkControl() == 0) {
            return;
          }
          else if (checkControl() == -1) {
//            Serial.println("Soil moisture below minThresh");
          }
          else {
//            Serial.println("Soil moisture above maxThresh");
          }
        }
};

class TDS : public Sensor {
    public:
        TDS(String id, unsigned int readInterval, float minThresh, float maxThresh) 
            : Sensor(id, readInterval, minThresh, maxThresh) {}
        void setupSensor() override {
          pinMode(TDS_PIN, INPUT);
        }
        float readSensor() override {
          float analog_tds = analogRead(TDS_PIN);
          float voltage = analog_tds * (float)VREF / 1024.0; // convert to voltage value
          float curr_temp = recentAirTemp;
          float compensation_coeff = 1.0 + 0.02 * (curr_temp - 25.0); //temperature compensation formula: fFinalResult(25^C) = fFinalResult(current)/(1.0+0.02*(fTP-25.0));
          float compensation_voltage = voltage / compensation_coeff; //temperature compensation
          float tds_value = (133.42 * compensation_voltage * compensation_voltage * compensation_voltage - 255.86 * compensation_voltage * compensation_voltage + 857.39 * compensation_voltage) * 0.5; //convert voltage value to tds value
          setRecentValue(tds_value);
          control();
          return tds_value;
        }
        void control() override {
          if (checkControl() == 0) {
            return;
          }
          else if (checkControl() == -1) {
//            Serial.println("TDS below minThresh");
          }
          else {
//            Serial.println("TDS above maxThresh");
          }
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

// Config for setting up Sensor objects
// Read Timings (milliseconds)
const unsigned int READ_INTERNAL_AIR_TEMP = 1000;
const unsigned int READ_INTERNAL_HUMIDITY = 1000;
const unsigned int READ_EXTERNAL_AIR_TEMP = 3000;
const unsigned int READ_EXTERNAL_HUMIDITY = 3000;
const unsigned int READ_SOIL_TEMP = 3000;
const unsigned int READ_WATER_TEMP = 3000;
const unsigned int READ_SOIL_MOISTURE = 3000;
const unsigned int READ_TDS = 3000;
const unsigned int READ_WATER_LEVEL = 10000;

// Default threshold values - make these match the default javascript thresholds
float HUMIDITY_MAX = 50;
float HUMIDITY_MIN = 40;

float AIR_TEMP_MAX = 30;
float AIR_TEMP_MIN = 20;

float SOIL_TEMP_MAX = 15;
float SOIL_TEMP_MIN = 5;

float SOIL_MOISTURE_MAX = 60;
float SOIL_MOISTURE_MIN = 50;

float WATER_TEMP_MAX = 15;
float WATER_TEMP_MIN = 5;

float TDS_MAX = 100;
float TDS_MIN = 0;

Humidity *ih = new Humidity("ih", READ_INTERNAL_HUMIDITY, HUMIDITY_MIN, HUMIDITY_MAX);
AirTemperatureOW *it = new AirTemperatureOW("it", READ_INTERNAL_AIR_TEMP, AIR_TEMP_MIN, AIR_TEMP_MAX);
AirTemperatureDHT *et = new AirTemperatureDHT("et", READ_INTERNAL_AIR_TEMP, AIR_TEMP_MIN, AIR_TEMP_MAX);
SoilMoisture *sm = new SoilMoisture("sm", READ_SOIL_MOISTURE, SOIL_MOISTURE_MIN, SOIL_MOISTURE_MAX);
TDS *td = new TDS("td", READ_TDS, TDS_MIN, TDS_MAX);

Sensor* ss[] = {ih};
const int NUM_SENSORS = sizeof(ss)/sizeof(ss[0]);

// Sensor Suite Operations
void setupSensorSuite() {
  for (int i = 0; i < NUM_SENSORS; i++) {
    ss[i]->setupSensor();
  }
}

//void printSensorSuite(Sensor* sensors[], int size) {
void printSensorSuite() {
    for (int i = 0; i < NUM_SENSORS; i++) {
        ss[i]->printSensor();
    }
}

void readSensorSuite() {
    for (int i = 0; i < NUM_SENSORS; i++) {
         if (ss[i]->readyToRead()) {
          sendDataMsg(ss[i]->getId(), ss[i]->readSensor());
        }
    }
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

// Config for Maintenance components (water level, filter changing)
const unsigned int CHECK_WATER_LEVEL = 10000; // 10 seconds
const unsigned int CHECK_FILTER = 10000; // 10 seconds
unsigned long lastWaterLevelCheck = 0;
unsigned long lastFilterCheck = 0;
unsigned long filterAge = 0;

void checkWaterLevel() {
  unsigned long currentTime = millis();
  if ((currentTime - lastWaterLevelCheck) >= CHECK_WATER_LEVEL) {
    int liquid_level = digitalRead(LIQUID_LEVEL_PIN);
    sendMaintenanceMsg("wl", String(liquid_level));
    lastWaterLevelCheck = currentTime;
  }
}

void resetFilterAge() {
  filterAge = 0;
}

void checkFilter() {
  unsigned long currentTime = millis();
  if ((currentTime - lastFilterCheck) >= CHECK_FILTER) {
    sendMaintenanceMsg("ft", String(filterAge));
    lastFilterCheck = currentTime;
  }
}

void checkMaintenance() {
  checkWaterLevel();
  checkFilter();
}

void setup() {
  // Serial to print
  Serial.begin(115200);

  setupSensorSuite();
  pinMode(LIQUID_LEVEL_PIN, INPUT_PULLUP);

  pinMode(DEMO_LED_PIN, OUTPUT);
  pinMode(MISTER_PIN, OUTPUT);

  // Start serial connection to NodeMCU
  arduinoSerial.begin(57600);

  delay(1000);
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
    it->setThresholds(min_value, max_value);
  }
  else if (config_type == "ih") {
    ih->setThresholds(min_value, max_value);
  }
  else if (config_type == "st") {
//    st->setThresholds(min_value, max_value);
  }
  else if (config_type == "wt") {
//    wt->setThresholds(min_value, max_value);
  }
  else if (config_type == "sm") {
    sm->setThresholds(min_value, max_value);
  }
  else if (config_type == "td") {
    td->setThresholds(min_value, max_value);
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
      resetFilterAge();
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

// Main loop
void loop() {
  filterAge = millis();
  readSensorSuite();
  checkMaintenance();
  
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
}
