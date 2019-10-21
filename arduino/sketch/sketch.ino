#include <DHT.h>
#include <Wire.h>

#define slaveAddress 0x08

DHT dht(2, DHT22);

int updateInterval = 60; // 0

float temp = 0.00;   // 1
int targetTemp = 32; // 2
#define heaterPin 4

float hum = 0.00;   // 3
int targetHum = 60; // 4
#define dehumidifierPin 7

#define fanInPin 3
int fanInPWM = 100; // 5
#define fanOutPin 5
int fanOutPWM = 100; // 6
#define ledStripPin 6
char ledStripPWM = 255; // 7

#define variables 8
int buffer[variables];

void receiveData()
{
	int counter = 0;
	while (Wire.available())
	{
		buffer[counter] = Wire.read();
		counter++;
	}

	Serial.println("buffer");
	for (int i = 0; i < sizeof(buffer); i++)
	{
		Serial.println(buffer[i]);
	}

	Serial.print("condition ");
	Serial.println(sizeof(buffer) == variables);
	if (sizeof(buffer) == variables)
	{

		updateInterval = buffer[1];
		targetTemp = buffer[2];
		targetHum = buffer[4];
		fanInPWM = buffer[5];
		fanOutPWM = buffer[6];
		ledStripPWM = buffer[7];
	}
	respond();
}

int varPos = 0;
void sendData()
{
	int nums[variables] = {};

	nums[0] = updateInterval;
	nums[1] = map(temp, 0, 100, 0, 255);
	nums[2] = targetTemp;
	nums[3] = map(hum, 0, 100, 0, 255);
	nums[4] = targetHum;
	nums[5] = fanInPWM;
	nums[6] = fanOutPWM;
	nums[7] = ledStripPWM;

	Wire.write(nums[varPos]);
	varPos++;
	if (varPos == 8)
	{
		varPos = 0;
	}
}

void respond()
{
	digitalWrite(heaterPin, temp < targetTemp);
	digitalWrite(dehumidifierPin, hum > targetHum);
	analogWrite(fanInPin, fanInPWM);
	analogWrite(fanOutPin, fanOutPWM);
	analogWrite(ledStripPin, ledStripPWM);
}

void setup()
{
	dht.begin();
	Wire.begin(slaveAddress);
	Wire.onReceive(receiveData);
	Wire.onRequest(sendData);
	Serial.begin(115200);

	pinMode(heaterPin, OUTPUT);
	pinMode(dehumidifierPin, OUTPUT);
	pinMode(fanInPin, OUTPUT);
	pinMode(fanOutPin, OUTPUT);
	pinMode(ledStripPin, OUTPUT);
}

void loop()
{
	if (millis() % updateInterval * 1000 == 0)
	{
		hum = dht.readHumidity();
		temp = dht.readTemperature();
		respond();
	}

	delay(1);
}
