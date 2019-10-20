/* This program will act as the server in sending data via Bluetooth to a client using point 
   to point communication. This program will use the GATT protocol to share data between the server and the client
   by creating characterisitcs for temperature and humidity and broadcasting those values on their respective 
   characteristics. */

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

/* This function will initialize the BLE service and create two characteristics
   used to store temperature and humidity
*/

void initBLE() {

	BLEDevice::init("FeatherESP32");

  	// Set ESP32 as a BLE server
  	pServer = BLEDevice::createServer();
  	pServer->setCallbacks(new MyServerCallbacks());

  	// Create a service for the BLE server with the univerally unique identifier
  	BLEService *pService = pServer->createService(SERVICE_UUID);

  	// Create two characteristics that will hold the sensor reading values
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


/* Start to advertising the server so that the client can recognize and read the data stored
   on the characterisitcs */
   
void startAdvertising() {
  	BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  	pAdvertising->addServiceUUID(SERVICE_UUID);
 
  	pAdvertising->setScanResponse(true);
  	pAdvertising->setMinPreferred(0x06);
  	pAdvertising->setMinPreferred(0x12);
  	BLEDevice::startAdvertising();
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
      temperature = newTemperature;
      tempCharacteristic->setValue((uint8_t*)&temperature, 1);
      tempCharacteristic->notify();
    }

    if (newHumidity != humidity){
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
