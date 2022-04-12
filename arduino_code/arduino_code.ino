#include <OneWire.h>
#include <DallasTemperature.h>
#include <SoftwareSerial.h>
#include <dht.h>

// TODO: Random
// LED resets everytime I open the serial monitor
// Don't forget to change PWM frequency on LED pin

// TOOD: Implement
// Figure out delay timing on setup
// Message queueing to avoid corruptions
// Add some indicator when threshold message corrupt? new threshold not set
// bool receiving that is true while arduino is receiving data from nodemcu - don't send while receiving
// Add a buffer of brightness values where the LED is on full power (similar to what we did for being off)
//    - Add more of a buffer for time off as well (maybe)
// Rename `day` variable to something better - indicates whether led is getting brighter or dimmer

// TODO: Testing
// Soil moisture conversion

float recentAirTemp;

#define RX_PIN 12
#define TX_PIN 13
SoftwareSerial arduinoSerial(RX_PIN, TX_PIN);

#define EOF '\n'
#define VREF 5.0 // analog reference voltage of the ADC

// Control Pins
//TODO: Remove - used for demo
const int DEMO_LED_PIN = 8;

#define MISTER_PIN 2
#define LED_PIN 10

// Sensor Pins
#define TDS_PIN A1
#define SOIL_MOISTURE_PIN A15
#define LIQUID_LEVEL_PIN 52
#define AIR_TEMP_BUS_PIN 3
#define WATER_TEMP_BUS_PIN 9
#define SOIL_TEMP_BUS_PIN 21 // not real
#define DHT_INT1 6 // Bottom
#define DHT_INT2 7 // Top
#define DHT_EXT 8

const unsigned int DHT_PINS[2] = {DHT_INT1, DHT_INT2};
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
      bool verifyThresholds(float _minThresh, float _maxThresh) { return (_minThresh < _maxThresh); }
      void setThresholds(float _minThresh, float _maxThresh) {
        if (!verifyThresholds(_minThresh, _maxThresh)) return;
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
        // Returns -1 if recent value is below average of thresholds, 1 if it is greater, 0 otherwise
        if (recentValue < avgThresh) return -1;
        else if (recentValue > avgThresh) return 1;
        else return 0;
      }
      virtual float readSensor() { return (float) 0; } // Override to read sensor
      virtual void control() { return; } // Override to control actuaors
};

class TemperatureOW : public Sensor {
    private:
      OneWire oneWire;
      DallasTemperature oneWireSensors;
      unsigned int oneWireCount = 0;
      unsigned int PIN;
    public:
      TemperatureOW(String id, unsigned int readInterval, float minThresh, float maxThresh, unsigned int busPin) 
          : Sensor(id, readInterval, minThresh, maxThresh) { PIN = busPin; }
      void setupSensor() override {
        oneWire = OneWire(PIN);
        oneWireSensors.setOneWire(&oneWire);
        oneWireSensors.begin();
        oneWireCount = oneWireSensors.getDeviceCount();
      }
      float readTemp() {
        oneWireSensors.requestTemperatures();
        float avgTempC = 0;
        for (int i = 0; i < oneWireCount; i++) {
            float tempC = oneWireSensors.getTempCByIndex(i);
            avgTempC += tempC;
            // Serial.println(DallasTemperature::toFahrenheit(tempC));
        }
        avgTempC /= oneWireCount;
        setRecentValue(avgTempC);
        return avgTempC;
      }
};

class AirTemperatureOW : public TemperatureOW {
    private:
      unsigned int PIN = AIR_TEMP_BUS_PIN;
    public:
      AirTemperatureOW(String id, unsigned int readInterval, float minThresh, float maxThresh) 
          : TemperatureOW (id, readInterval, minThresh, maxThresh, PIN) {}
      float readSensor() override {
        float avgTempC = readTemp();
        recentAirTemp = avgTempC;
        control();
        // Serial.println(avgTempC);
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

class WaterTemperatureOW : public TemperatureOW {
    private:
      unsigned int PIN = WATER_TEMP_BUS_PIN;
    public:
      WaterTemperatureOW(String id, unsigned int readInterval, float minThresh, float maxThresh) 
          : TemperatureOW (id, readInterval, minThresh, maxThresh, PIN) {}
      float readSensor() override {
        float avgTempC = readTemp();
        control();
        return avgTempC;
      }
      void control() override {
        if (checkControl() == 0) return;
        else if (checkControl() == -1) {
//          Serial.println("Water temperature below minThresh");
        }
        else {
//          Serial.println("Water temperature above maxThresh");
        }
      }
};

class SoilTemperatureOW : public TemperatureOW {
    private:
      unsigned int PIN = SOIL_TEMP_BUS_PIN;
    public:
      SoilTemperatureOW(String id, unsigned int readInterval, float minThresh, float maxThresh) 
          : TemperatureOW (id, readInterval, minThresh, maxThresh, PIN) {}
      float readSensor() override {
        float avgTempC = readTemp();
        control();
        return avgTempC;
      }
      void control() override {
        if (checkControl() == 0) return;
        else if (checkControl() == -1) {
//          Serial.println("Soil temperature below minThresh");
        }
        else {
//          Serial.println("Soil temperature above maxThresh");
        }
      }
};

class AirTemperatureDHT : public Sensor {
    private:
      dht DHT;
      unsigned int PIN = DHT_EXT;
    public:
      AirTemperatureDHT(String id, unsigned int readInterval, float minThresh, float maxThresh) 
          : Sensor(id, readInterval, minThresh, maxThresh) {}
      void setupSensor() override {
        pinMode(PIN, OUTPUT);
      }
      float readSensor() override {
        float tempC = 0;
        DHT.read11(PIN);
        tempC = DHT.temperature;
        setRecentValue(tempC);
        // Serial.println(tempC);
        return tempC;
      }
};

class ExternalHumidity : public Sensor {
    private:
      dht DHT;
      unsigned int PIN = DHT_EXT;
    public:
        ExternalHumidity(String id, unsigned int readInterval, float minThresh, float maxThresh) 
            : Sensor(id, readInterval, minThresh, maxThresh) {}
      void setupSensor() override {
        pinMode(PIN, OUTPUT);
      }
      float readSensor() override {
        float humidity = 0;
        DHT.read11(PIN);
        humidity = DHT.humidity;
        setRecentValue(humidity);
        return humidity;
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
            // Serial.println(String(i) + ": " + String(humidity));
            avgHumidity += humidity;
          }
          avgHumidity /= NUM_DHT;
          setRecentValue(avgHumidity);
          // Serial.println(avgHumidity);
          control();
          return avgHumidity;
        }
        void control() override {
          if (checkControl() == 0) {
//            digitalWrite(MISTER_PIN, LOW);
//            digitalWrite(DEMO_LED_PIN, LOW);
          }
          else if (checkControl() == -1) {
            // Below threshold average
//            digitalWrite(MISTER_PIN, HIGH);
//            digitalWrite(DEMO_LED_PIN, HIGH);
          }
          else {
            // Above threshold average
//            digitalWrite(MISTER_PIN, LOW);
//            digitalWrite(DEMO_LED_PIN, LOW);
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
          float soilMoisture = analogRead(SOIL_MOISTURE_PIN);
          // Serial.println(soilMoisture);
          float soilMoisturePercent = (float) map(soilMoisture, 0, 1023, 0, 100);
          setRecentValue(soilMoisturePercent);
          control();
          return soilMoisturePercent;
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
          float analogTDS = analogRead(TDS_PIN);
          float voltage = analogTDS * (float)VREF / 1024.0; // convert to voltage value
          float currTemp = recentAirTemp;
          float compCoeff = 1.0 + 0.02 * (currTemp - 25.0); //temperature compensation formula: fFinalResult(25^C) = fFinalResult(current)/(1.0+0.02*(fTP-25.0));
          float compVoltage = voltage / compCoeff; //temperature compensation
          float tdsValue = (133.42 * compVoltage * compVoltage * compVoltage - 255.86 * compVoltage * compVoltage + 857.39 * compVoltage) * 0.5; //convert voltage value to tds value
          setRecentValue(tdsValue);
          control();
          return tdsValue;
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

// Single point of control for writing over serial connection
void sendSerial(String msg) {
  arduinoSerial.print(msg);
  delay(100);
}

bool stringIsFloat(String str) {
  char c;
  for (int i = 0; i < str.length(); i++) {
    c = str[i];
    if (!isDigit(c) && c != '.') return false;
  }
  return true;
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
//  Serial.println("Sending data: " + msg);
  sendSerial(msg);
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
ExternalHumidity *eh = new ExternalHumidity("eh", READ_EXTERNAL_HUMIDITY, HUMIDITY_MIN, HUMIDITY_MAX); // min and max dont matter
AirTemperatureOW *it = new AirTemperatureOW("it", READ_INTERNAL_AIR_TEMP, AIR_TEMP_MIN, AIR_TEMP_MAX);
AirTemperatureDHT *et = new AirTemperatureDHT("et", READ_EXTERNAL_AIR_TEMP, AIR_TEMP_MIN, AIR_TEMP_MAX); // min and max dont matter
SoilMoisture *sm = new SoilMoisture("sm", READ_SOIL_MOISTURE, SOIL_MOISTURE_MIN, SOIL_MOISTURE_MAX);
WaterTemperatureOW *wt = new WaterTemperatureOW("wt", READ_WATER_TEMP, WATER_TEMP_MIN, WATER_TEMP_MAX);
TDS *td = new TDS("td", READ_TDS, TDS_MIN, TDS_MAX);

Sensor* ss[] = {}; // {it, ih, et, eh, sm, td, wt};
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

// Populatearray with string values from string of comma separated values
void getValuesFromMsg(String* arr, String msg) {
  char valDelim = ',';
  unsigned int s = 0;
  unsigned int e = 0;
  unsigned int ind = 0;
  String valStr = "";
  while (e != -1) {
    e = msg.indexOf(valDelim, s);
    valStr = msg.substring(s, e);
    arr[ind] = valStr;
    ind++;
    s = e + 1;
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
//  Serial.println("Sending maintenance: " + msg);
  sendSerial(msg);
}

// Config for Maintenance components (water level, filter changing)
const unsigned int CHECK_WATER_LEVEL = 10000; // 10 seconds
const unsigned int CHECK_FILTER = 10000; // 10 seconds
unsigned long DAY_NIGHT_CYCLE = 60000; // 1 minute
unsigned long lastWaterLevelCheck = 0;
unsigned long lastFilterCheck = 0;
unsigned long lastFilterChange = 0;
unsigned long lastDayNightCheck = 0;
unsigned long filterAge = 0;

void checkWaterLevel() {
  unsigned long currentTime = millis();
  if ((currentTime - lastWaterLevelCheck) >= CHECK_WATER_LEVEL) {
    int liquid_level = digitalRead(LIQUID_LEVEL_PIN);
    // Serial.println(liquid_level);
    sendMaintenanceMsg("wl", String(liquid_level));
    lastWaterLevelCheck = currentTime;
  }
}

void resetFilterAge() {
  unsigned long currentTime = millis();
  lastFilterChange = currentTime;
}

void checkFilter() {
  unsigned long currentTime = millis();
  if ((currentTime - lastFilterCheck) >= CHECK_FILTER) {
    filterAge = currentTime - lastFilterChange;
    sendMaintenanceMsg("ft", String(filterAge));
    lastFilterCheck = currentTime;
  }
}


// Used for controller LED through UI
void configLEDBrightness(String brightnessStr) {
  float brightness = brightnessStr.toFloat();
  float brightnessMap = map(brightness, 0, 100, 55, 0);
  if (brightnessMap >= 50) brightnessMap = 255;
  // Serial.println("CONFIG BRIGHTNESS");
  // Serial.println(brightnessMap);
  analogWrite(LED_PIN, brightnessMap);
}

// Start off
bool day = false;

// TODO: Test this
void configDayNightCycle(String dayNightStr) {
  Serial.println(dayNightStr);
  unsigned const size = 3;
  String arr[size];
  getValuesFromMsg(arr, dayNightStr);
  for (int i = 0; i < size; i++) {
    // Message was corrupted
    if (!stringIsFloat(arr[i])) return;
    if (arr[i].toFloat() < 0) return;
  }
  unsigned long currentTime = millis();
  DAY_NIGHT_CYCLE = arr[0].toInt() * 1000;
  unsigned long cycleStart = arr[1].toInt() * 1000;
  lastDayNightCheck = currentTime - cycleStart;
  day = (bool) arr[2].toInt();
  Serial.println("SET DAY NIGHT CYCLE");
  Serial.println(DAY_NIGHT_CYCLE);
  Serial.println(cycleStart);
  Serial.println(day);
}

void dayNightCycle(bool isDay) {
  // Default range is for day
  unsigned int minRange = 55;
  unsigned int maxRange = 0;
  if (!isDay) {
    minRange = 0;
    maxRange = 55;
  }
  unsigned long currentTime = millis();
  unsigned long brightness = (currentTime - lastDayNightCheck);
  float brightnessMap = map(brightness, 0, DAY_NIGHT_CYCLE, minRange, maxRange);
  if (brightnessMap >= 50) brightnessMap = 255; // Turn fully off
  analogWrite(LED_PIN, brightnessMap);
  // Serial.println(brightnessMap);
}

void checkDayNightCycle() {
  unsigned long currentTime = millis();
  if ((currentTime - lastDayNightCheck) >= DAY_NIGHT_CYCLE) {
    day = !day;
    lastDayNightCheck = currentTime;
  }
}

void checkMaintenance() {
  checkWaterLevel();
  checkFilter();
  checkDayNightCycle();
  dayNightCycle(day);
}

void setup() {
  // Serial to print
  Serial.begin(115200);
  TCCR2B = TCCR2B & B11111000 | B00000001;  // for PWM frequency of 31372.55 Hz - Pins 9 and 10
  setupSensorSuite();
  pinMode(LIQUID_LEVEL_PIN, INPUT_PULLUP);

  pinMode(DEMO_LED_PIN, OUTPUT);
  pinMode(MISTER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);

  // Start serial connection to NodeMCU
  arduinoSerial.begin(57600);

  delay(1000);
}

void configThreshold(String msg) {
  unsigned int idDelim = msg.indexOf(':');
  String id = msg.substring(0, idDelim);
  String thresholdStr = msg.substring(idDelim + 1, msg.length());

  unsigned const size = 2;
  String arr[size];
  getValuesFromMsg(arr, thresholdStr);
  for (int i = 0; i < size; i++) {
    // Message was corrupted - TODO: Indicate this somehow?
    if (!stringIsFloat(arr[i])) return;
  }
  
  float minThresh = arr[0].toFloat();
  float maxThresh = arr[1].toFloat();

//  Serial.println("Threshold Update for " + id);
//  Serial.println("MIN: " + String(minThresh) + " | MAX: " + String(maxThresh));
  
  if (id == "it") {
    it->setThresholds(minThresh, maxThresh);
  }
  else if (id == "ih") {
    ih->setThresholds(minThresh, maxThresh);
  }
  else if (id == "st") {
//    st->setThresholds(minThresh, maxThresh);
  }
  else if (id == "wt") {
    wt->setThresholds(minThresh, maxThresh);
  }
  else if (id == "sm") {
    sm->setThresholds(minThresh, maxThresh);
  }
  else if (id == "td") {
    td->setThresholds(minThresh, maxThresh);
  }
  else {
   Serial.println("Unrecognized sensor id for setting thresholds");
  }
}


void processMessage(String msg) {
  /* Determine the message type received from NodeMCU
   *  t - Threshold change
   *  f - Filter changed
   *  l - Lights
   *  E.g. msg = "l:64\n", msg = "t:sm:30,40\n"
   */ 
  char msgType = msg.charAt(0);
  // Don't need message content
  if (msgType == 'f') {
    resetFilterAge();
    return;
  }

  String msgContent = msg.substring(2, msg.length());
  switch(msgType) {
    case 't': // Set threshold values
      configThreshold(msgContent);
      break;
    case 'l': // Manual control LED
      configLEDBrightness(msgContent);
      break;
    case 'd': // Set day night cycle
      configDayNightCycle(msgContent);
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
    // Process the completed message
    processMessage(dataIn);
    // Reset variables
    c = 0;
    dataIn = "";
  }
}
