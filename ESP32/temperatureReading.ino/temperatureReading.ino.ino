#include <DHT.h>
#include <Adafruit_Sensor.h>

#define DHTPIN 14 // Digit pin connected to the DHT sensor

#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

String readTemperature() {
  float temp = dht.readTemperature(true);

  /* If failed to read from sensor */
  if (isnan(temp)) {
    Serial.println("Failed to read from DHT sensor!");
    return "--";
  }
  else {
    Serial.println(temp);
    return String(temp);
  }
  
}

String readHumidity() {
  float humidity = dht.readHumidity();
  if (isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return "--";
  }
  else {
    Serial.println(humidity);
    return String(humidity);
  }
  
}


void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  
  dht.begin();
  String temperature = readTemperature();
  String humidity = readHumidity();
  Serial.println("The temperature is " + temperature + " and the humidity is " + humidity);
    

}

void loop() {
  // put your main code here, to run repeatedly:

}
