#ifndef TemperatureSensor_h
#define TemperatureSensor_h

#include "Arduino.h"
#include <DHT.h>
#include <Adafruit_Sensor.h>

#define DHTTYPE DHT11

class TemperatureSensor

{
	public:
		TemperatureSensor(int pin);
		~TemperatureSensor();
		uint8_t getTemperature();
		uint8_t getHumidity();
		DHT *dht;

	private:
		int _pin;
};

#endif
