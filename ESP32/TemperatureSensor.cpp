#include "Arduino.h"
#include "TemperatureSensor.h"
#include <DHT.h>
#include <Adafruit_Sensor.h>


TemperatureSensor::TemperatureSensor(int pin)
{
  	dht = new DHT(pin, DHTTYPE);
	dht->begin();
	_pin = pin;

}

TemperatureSensor::~TemperatureSensor() 
{
	delete dht;
}


uint8_t TemperatureSensor::getTemperature() {
  uint8_t temp = dht->readTemperature(true);

  /* If failed to read from sensor */
  if (isnan(temp)) {
    Serial.println("Failed to read from DHT sensor!");
    return -1000;
  }
  else {
    return temp;
  }
}

uint8_t TemperatureSensor::getHumidity() {
  uint8_t humidity = dht->readHumidity();
  if (isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return -1000;
  }
  else {
    return humidity;
  }
  
}
