
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>
#include "WiFi.h"
#include <DHT.h>
#include <Adafruit_Sensor.h>


BLEServer *pServer = NULL;
BLECharacteristic *tempCharacteristic = NULL;
BLECharacteristic *humidityCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
uint32_t value = 0;
uint8_t temperature;
uint8_t humidity;


#define SERVICE_UUID "c23b7ab5-0301-441a-ac60-1757084297d4"
#define TEMP_CHARACTERISTIC_UUID "e7ca3a76-9026-4f56-9b35-09da4c3c5eea"
#define HUMIDITY_CHARACTERISTIC_UUID "8c6fe5b0-0931-41f7-bab5-6b08cb20f524"

#define DHTPIN 14 // Digit pin connected to the DHT sensor
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);


class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer *pServer) 
  {
    deviceConnected = true;
  }

  void onDisconnect(BLEServer *pServer)
  {
    deviceConnected = false;
  }
  
};

uint8_t readTemperature() {
  uint8_t temp = dht.readTemperature(true);

  /* If failed to read from sensor */
  if (isnan(temp)) {
    Serial.println("Failed to read from DHT sensor!");
    return -1000;
  }
  else {
    Serial.println(temp);
    return temp;
  }
  
}

uint8_t readHumidity() {
  uint8_t humidity = dht.readHumidity();
  if (isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return -1000;
  }
  else {
    Serial.println(humidity);
    return humidity;
  }
  
}

void initBLE() {

  BLEDevice::init("FeatherESP32");

  // Set ESP32 as a BLE server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create a service for the BLE server with UUID
  BLEService *pService = pServer->createService(SERVICE_UUID);
  tempCharacteristic = pService->createCharacteristic(
                TEMP_CHARACTERISTIC_UUID, 
                BLECharacteristic::PROPERTY_READ      |
                BLECharacteristic::PROPERTY_WRITE     |
                BLECharacteristic::PROPERTY_NOTIFY    |
                BLECharacteristic::PROPERTY_INDICATE  
                );
  humidityCharacteristic = pService->createCharacteristic(
                HUMIDITY_CHARACTERISTIC_UUID, 
                BLECharacteristic::PROPERTY_READ      |
                BLECharacteristic::PROPERTY_WRITE     |
                BLECharacteristic::PROPERTY_NOTIFY    |
                BLECharacteristic::PROPERTY_INDICATE  
                );

  tempCharacteristic->addDescriptor(new BLE2902());
  humidityCharacteristic->addDescriptor(new BLE2902());

  pService->start();
}



void startAdvertising() {
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
 
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  Serial.println("Waiting for client to notify"); 
}


void setup() {

  // Start Serial Communication
  Serial.begin(115200);
  Serial.println("Start server");
  dht.begin();
  temperature = 95;
  humidity = 80;
  initBLE();
  startAdvertising();
}

void loop() {
  if (deviceConnected) {
    Serial.println("Connected to device");
    temperature = readTemperature();
    humidity = readHumidity();
    Serial.println(temperature);
    
    tempCharacteristic->setValue((uint8_t*)&temperature, 4);
    humidityCharacteristic->setValue((uint8_t*)&humidity, 4);
    tempCharacteristic->notify();
    humidityCharacteristic->notify();
    delay(3);
  }

  if (!deviceConnected && oldDeviceConnected) {
    delay(500);
    pServer->startAdvertising();
    Serial.println("start advertising");
    oldDeviceConnected = deviceConnected;
    }

    if (deviceConnected && !oldDeviceConnected){
      oldDeviceConnected = deviceConnected;
    }

}
