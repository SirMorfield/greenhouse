#include <DHT.h>
#include <Wire.h>

DHT dht(8, DHT22);
#define greenLedPin 2

#define slaveAddress 0x08
#define heaterPin A0
#define dehumidifierPin A1

#define lampPin 10
#define inOutFanPin 9
#define pumpPin 6
#define sensorFanPin 3

#define temp vars[0]
#define hum vars[1]

#define heaterOn vars[2]
#define dehumidifierOn vars[3]

#define lampPWM vars[4]
#define inOutFanPWM vars[5]
#define pumpPWM vars[6]
#define sensorFanPWM vars[7]

#define numVars 8
uint16_t vars[numVars] = {};

uint8_t varSizes[numVars] = {
	10, // temp
	10, // hum
	1,  // heaterOn
	1,  // dehumidifierOn
	8,  // lampPWM
	8,  // inOutFanPWM
	8,  // pumpPWM
	8   // sensorFanPWM
};

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

// Math.ceil((10 + 10 + 1 + 1 + 8 + 8 + 8 + 8 ) / 8) = 7
#define numBytesToSend 7
uint8_t bytesToSend[numBytesToSend] = {};

void updateBytesToSend()
{
	uint8_t varsToSendPos = 0;
	uint8_t bitInBytePos = 7;

	for (uint8_t i = 0; i < numVars; i++)
	{
		uint8_t numBitsToRead = varSizes[i];
		uint16_t toRead = vars[i];

		for (int8_t bitPos = numBitsToRead - 1; bitPos >= 0; bitPos--)
		{
			uint8_t bit = bitRead(toRead, bitPos);
			uint8_t byte = bytesToSend[varsToSendPos];

			bitWrite(byte, bitInBytePos, bit);
			bytesToSend[varsToSendPos] = byte;
			if (bitInBytePos-- == 0)
			{
				bitInBytePos = 7;
				varsToSendPos++;
			}
		}
	}
	bytesToSend[numBytesToSend - 1] = generateChecksum(bytesToSend, numBytesToSend - 1);
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
		}

		receiveDataPos = 0;
	}
}

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

uint16_t sendDataPos = 0;
void sendData(int var)
{
	Wire.write(69);
	// digitalWrite(greenLedPin, sendDataPos == 0);

	// if (sendDataPos == 0)
	// {
	// 	respond();
	// 	updateBytesToSend();
	// }
	// // Wire.write(bytesToSend[sendDataPos]);

	// if (sendDataPos++ == (numBytesToSend - 1))
	// 	sendDataPos = 0;
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
	Wire.begin(slaveAddress);
	Wire.onReceive(receiveData);
	Wire.onRequest(sendData);

	delay(1000);
	digitalWrite(greenLedPin, LOW);
}

void loop() {}
