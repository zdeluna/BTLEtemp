#ifndef TemperatureSensor_h
#define TemperatureSensor_h

#include "Arduino.h"
#include <DHT.h>
#include <Adafruit_Sensor.h>

#define DHTPIN 14 // Digit pin connected to the DHT sensor
#define DHTTYPE DHT11

class TemperatureSensor

{
	public:
		TemperatureSensor(int pin);
		uint8_t getTemperature();
		uint8_t getHumidity();
	private:
		int _pin;
};

#endif
