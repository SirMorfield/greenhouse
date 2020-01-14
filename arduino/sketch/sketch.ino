#include <Wire.h>

#include "./i2c/i2c.h"
I2c i2c;

#include <DHT.h>
DHT dht(8, DHT22);

#define greenLedPin 2

#define heaterPin A0
#define dehumidifierPin A1

#define lampPin 10
#define inOutFanPin 9
#define pumpPin 6
#define sensorFanPin 3

#define heaterOn vars[0]
#define dehumidifierOn vars[1]
#define lampPWM vars[2]
#define inOutFanPWM vars[3]
#define pumpPWM vars[4]
#define sensorFanPWM vars[5]
#define temp vars[6]
#define hum vars[7]

#define numVars 8
uint16_t vars[numVars] = {};

void respond()
{
	temp = dht.readTemperature() * 10;
	hum = dht.readHumidity() * 10;

	digitalWrite(heaterPin, heaterOn == 0);
	digitalWrite(dehumidifierPin, dehumidifierOn == 0);

	analogWrite(lampPin, lampPWM);
	analogWrite(inOutFanPin, inOutFanPWM);
	analogWrite(pumpPin, pumpPWM);
}

uint16_t receiveDataPos = 0;
uint8_t receiveBuffer[2] = {};
void receiveData()
{
	uint8_t inByte = Wire.read();
	if (receiveDataPos != 2)
	{
		receiveBuffer[receiveDataPos] = inByte;
		receiveDataPos++;
	}
	else
	{
		uint8_t checkSum = i2c.generateChecksum(receiveBuffer, 2);

		if (checkSum == inByte)
		{
			vars[receiveBuffer[0]] = receiveBuffer[1];
		}
		receiveDataPos = 0;
	}
}

// Math.ceil((10 + 10 + 1 + 1 + 8 + 8 + 8 + 8 ) / 8) = 7
// + 1 checkSum
// = 8
uint8_t numBytesToSend = 8;
uint8_t *bytesToSend;
uint8_t sendDataPos = 0;
void sendData()
{
	if (sendDataPos == 0)
	{
		respond();
		bytesToSend = i2c.getBytesToSend(vars, numBytesToSend);
	}
	Wire.write(bytesToSend[sendDataPos]);
	if (sendDataPos++ == (numBytesToSend - 1))
	{
		sendDataPos = 0;
	}
}

void setup()
{
	pinMode(greenLedPin, OUTPUT);
	digitalWrite(greenLedPin, HIGH);

	pinMode(heaterPin, OUTPUT);
	pinMode(dehumidifierPin, OUTPUT);
	pinMode(lampPin, OUTPUT);
	pinMode(inOutFanPin, OUTPUT);
	pinMode(pumpPin, OUTPUT);
	pinMode(sensorFanPin, OUTPUT);

	dht.begin();

	Wire.begin(0x08);
	Wire.onReceive(receiveData);
	Wire.onRequest(sendData);

	delay(1000);
	digitalWrite(greenLedPin, LOW);
}

void loop() {}