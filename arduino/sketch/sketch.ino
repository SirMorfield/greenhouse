#include <DHT.h>
#include <Wire.h>

DHT dht(2, DHT22);

#define slaveAddress 0x08
#define heaterPin 8
#define dehumidifierPin 12
#define lampPin 7
#define fanInPin 6
#define fanOutPin 5
#define ledPin 3

#define numVars 11
uint16_t vars[numVars] = {
	0, // dehumidifierOn
	0, // lampOn
	0, // heaterOn
	0, // fanInPWM
	0, // fanOutPWM
	0, // ledPWM
	0, // temp
	0, // hum
	0, // fanInOn
	0, // fanOutOn
	0  // ledOn
};

uint8_t varSizes[numVars] = {
	1,  // dehumidifierOn
	1,  // lampOn
	1,  // heaterOn
	8,  // fanInPWM
	8,  // fanOutPWM
	8,  // ledPWM
	10, // temp
	10, // hum
	1,  // fanInOn
	1,  // fanOutOn
	1   // ledOn
}
// 1 + 1 + 1 + 8 + 8 + 8 + 10 + 10 + 1 + 1 + 1 = 50
// / 8  = 6.25
// = 7
// + 1 checkSum
#define numBytesToSend 8

uint8_t bytesToSend[numBytesToSend] = {0, 0, 0, 0, 0, 0, 0, 0};

void updateBytesToSend()
{
	uint8_t varsToSendPos = 0;
	uint8_t bitInBytePos = 7;

	for (uint8_t i = 0; i < numVars; i++)
	{
		uint8_t numBitsToRead = varSizes[i];
		uint8_t byteToRead = vars[i];

		for (uint8_t bitPos = numBitsToRead - 1; bitPos >= 0; bitPos--)
		{
			uint8_t bit = bitRead(byteToRead, bitPos);

			bitWrite(bytesToSend[varsToSendPos], bitInBytePos, bit);
			if (bitInBytePos == 0)
			{
				bitInBytePos = 7;
				varsToSendPos++
			}
			else
				bitInBytePos--
		}
	}
	bytesToSend[numBytesToSend - 1] generateChecksum(bytesToSend, numBytesToSend - 1)
}

#define dehumidifierOn vars[0]
#define lampOn vars[1]
#define heaterOn vars[2]
#define fanInPWM vars[3]
#define fanOutPWM vars[4]
#define ledPWM vars[5]
#define temp vars[6]
#define hum vars[7]
#define fanInOn vars[8]
#define fanOutOn vars[9]
#define ledOn vars[10]

uint8_t generateChecksum(uint8_t bytes[], uint8_t size)
{
	uint8_t sum = 0;
	for (uint16_t i = 0; i < size; i++)
	{
		sum += bytes[i];
	}

	sum = 255 - sum;
	return sum;
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
		uint8_t checkSum = generateChecksum(receiveBuffer, 2);

		if (checkSum == inByte)
		{
			vars[receiveBuffer[0]] = receiveBuffer[1];
			digitalWrite(13, LOW);
			respond();
		}
		else
			digitalWrite(13, HIGH);

		receiveDataPos = 0;
	}
}

uint16_t sendDataPos = 0;
void sendData()
{
	if (sendDataPos == 0)
	{
		respond();
		updateBytesToSend();
	}

	Wire.write(bytesToSend[sendDataPos]);

	if (sendDataPos < numBytesToSend )
		sendDataPos = 0;
	else
		sendDataPos++
}

void respond()
{
	temp = dht.readTemperature() * 10;
	hum = dht.readHumidity() * 10;

	digitalWrite(heaterPin, heaterOn == 0);
	digitalWrite(dehumidifierPin, dehumidifierOn == 0);
	digitalWrite(lampPin, lampOn == 0);

	if (fanInOn == 1)
		analogWrite(fanInPin, 255 - fanInPWM);
	else
		digitalWrite(fanInPin, LOW);

	if (fanOutOn == 1)
		analogWrite(fanOutPin, 255 - fanOutPWM);
	else
		digitalWrite(fanOutPin, HIGH);

	if (ledOn == 1)
		analogWrite(ledPin, 255 - ledPWM);
	else
		digitalWrite(ledPin, HIGH);
}

void setup()
{

	dht.begin();
	Wire.begin(slaveAddress);
	Wire.onReceive(receiveData);
	Wire.onRequest(sendData);
	pinMode(heaterPin, OUTPUT);
	pinMode(dehumidifierPin, OUTPUT);
	pinMode(lampPin, OUTPUT);
	pinMode(fanInPin, OUTPUT);
	pinMode(fanOutPin, OUTPUT);
	pinMode(ledPin, OUTPUT);
	pinMode(13, OUTPUT);

	respond();
}

void loop()
{
	delayMicroseconds(1);
}
