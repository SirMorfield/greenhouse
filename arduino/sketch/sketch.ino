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
	65535, // dehumidifierOn
	65535, // lampOn
	65535, // heaterOn
	65535, // fanInPWM
	65535, // fanOutPWM
	65535, // ledPWM
	65535, // temp
	65535, // hum
	65535, // fanInOn
	65535, // fanOutOn
	65535  // ledOn
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
};
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
		uint16_t toRead = vars[i];

		// Serial.println("");
		for (int8_t bitPos = numBitsToRead - 1; bitPos >= 0; bitPos--)
		{
			uint8_t bit = bitRead(toRead, bitPos);
			uint8_t byte = bytesToSend[varsToSendPos];
			// Serial.print(toRead, BIN);
			// Serial.print(",");
			// Serial.print(bitPos);
			// Serial.print(",");
			// Serial.print(bit);
			// Serial.print(",");
			// Serial.print(bitInBytePos);
			// Serial.print(",");
			// Serial.print(byte, BIN);

			bitWrite(byte, bitInBytePos, bit);
			bytesToSend[varsToSendPos] = byte;
			// Serial.print(",");
			// Serial.print(varsToSendPos);
			// Serial.print(",");
			// Serial.print(byte, BIN);
			// Serial.println("");

			if (bitInBytePos-- == 0)
			{
				// Serial.println("");
				bitInBytePos = 7;
				varsToSendPos++;
			}
		}
	}
	bytesToSend[numBytesToSend - 1] = generateChecksum(bytesToSend, numBytesToSend - 1);
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
		// respond();
		updateBytesToSend();
	}
	Wire.write(bytesToSend[sendDataPos]);
	Serial.println(bytesToSend[sendDataPos], BIN);
	if (sendDataPos++ == (numBytesToSend - 1))
		sendDataPos = 0;
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
	Serial.begin(115200);
	// updateBytesToSend();
	// Serial.println("----");
	// for (uint8_t i = 0; i < numBytesToSend; i++)
	// {
	// 	Serial.println(bytesToSend[i], BIN);
	// }

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

void loop() {}
