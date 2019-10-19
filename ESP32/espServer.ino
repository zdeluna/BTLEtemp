
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>
#include "WiFi.h"
#include "TemperatureSensor.h"

BLEServer *pServer = NULL;
BLECharacteristic *tempCharacteristic = NULL;
BLECharacteristic *humidityCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
uint8_t temperature = 0;
uint8_t humidity = 0;

uint8_t newTemperature = 0;
uint8_t newHumidity = 0;

int TEMP_SENSOR_PIN = 14;
#define SERVICE_UUID "c23b7ab5-0301-441a-ac60-1757084297d4"
#define TEMP_CHARACTERISTIC_UUID "e7ca3a76-9026-4f56-9b35-09da4c3c5eea"
#define HUMIDITY_CHARACTERISTIC_UUID "8c6fe5b0-0931-41f7-bab5-6b08cb20f524"

TemperatureSensor sensor(TEMP_SENSOR_PIN);

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
  initBLE();
  startAdvertising();
  }

void loop() {
  if (deviceConnected) {
    
    newTemperature = sensor.getTemperature();
    newHumidity = sensor.getHumidity();

    if (newTemperature != temperature){
      Serial.println("new temperature reading");
      Serial.println(newTemperature);
      Serial.println(temperature);
      temperature = newTemperature;
      tempCharacteristic->setValue((uint8_t*)&temperature, 1);
      tempCharacteristic->notify();
    }

    if (newHumidity != humidity){
      Serial.println("new humidity reading");
      Serial.println(newHumidity);
      Serial.println(humidity);
      humidity = newHumidity;
      humidityCharacteristic->setValue((uint8_t*)&humidity, 1);
      humidityCharacteristic->notify(); 
    }

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
