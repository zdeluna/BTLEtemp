
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#define SERVICE_UUID
#define PHONE_UUID


void setup() {

  // Start Serial Communication
  Serial.begin(115200);
  Serial.println("Start server")

  BLEDevice::init("FeatherESP32");

  // Set ESP32 as a BLE server
  BLEServer *pServer = BLEDevice::createServer();

  // Create a service for the BLE server with UUID
  BLEService *pService = pServer->createService(SERVICE_UUID);
  BLECharacteristic *pCharacteristic = pService->createCharacteristic(
 CHARACTERISTIC_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE);

 pCharacteristic->setValue("Hello app);
 pService->start();

 BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
 pAdvertising->addServiceUUID(SERVICE_UUID);
 pAdvertising->setScanResponse(true);
 pAdvertising->setMinPreferred(0x06);
 pAdvertising->setMinPreferred(0x12);
 BLEDevice::startAdvertising();
 Serial.println("Characteristic defined! Now you can read it in your phone"); 
 
}

void loop() {
  // put your main code here, to run repeatedly:
  delay(2000);

}
