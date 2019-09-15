
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>
#include "WiFi.h"


BLEServer *pServer = NULL;
BLECharacteristic *tempCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
uint32_t value = 0;
uint8_t temperature;
uint8_t humidity;


#define SERVICE_UUID "c23b7ab5-0301-441a-ac60-1757084297d4"
#define TEMP_CHARACTERISTIC_UUID "e7ca3a76-9026-4f56-9b35-09da4c3c5eea"

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

  tempCharacteristic->addDescriptor(new BLE2902());

  // Start service
  pService->start();

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
  
  temperature = 95;
  initBLE();
}

void loop() {
  if (deviceConnected) {
    Serial.println("Connected to device");
    //pCharacteristic->setValue((uint8_t*)&temperature, 4);
    tempCharacteristic->setValue((uint8_t*)&value, 4);
    tempCharacteristic->notify();
    value++;
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
