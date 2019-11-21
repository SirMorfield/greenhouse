#include <DHT.h>
#include <Wire.h>

DHT dht(2, DHT22);

#define slaveAddress 0x08
#define heaterPin 8
#define dehumidifierPin 12
#define lampPin 7
#define fanInPin 3
#define fanOutPin 5
#define ledStripPin 6

bool isInitiated = true;

#define numVars 14
uint8_t vars[numVars] = {
	32,  // 0 targetTemp
	1,   // 1 targetHum
	1,   // 2 updateInterval // 14 * 5000 = 1.16... min
	255, // 3 fanInPWM
	255, // 4 fanOutPWM
	255, // 5 ledStripPWM
	0,   // 6 temp
	0,   // 7 hum
	0,   // 8 fanInOn
	0,   // 9 fanOutOn
	0,   // 10 ledOn
	0,   // 11 dehumidifierOn
	0,   // 12 lampOn
	0	// 13 heaterOn
};

#define targetTemp vars[0]
#define targetHum vars[1]
#define updateInterval vars[2]
#define fanInPWM vars[3]
#define fanOutPWM vars[4]
#define ledStripPWM vars[5]
#define temp vars[6]
#define hum vars[7]
#define fanInOn vars[8]
#define fanOutOn vars[9]
#define ledOn vars[10]
#define dehumidifierOn vars[11]
#define lampOn vars[12]
#define heaterOn vars[13]

void updateSensor()
{
	temp = dht.readTemperature() + 0.5;
	hum = dht.readHumidity() + 0.5;
}

uint8_t generateChecksum(uint8_t bytes[])
{
	uint8_t sum = 0;
	for (uint16_t i = 0; i < sizeof(bytes); i++)
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
	Serial.print("byte ");
	Serial.print(receiveDataPos);
	Serial.print(" ");
	Serial.println(inByte);

	if (receiveDataPos != 2)
	{
		receiveBuffer[receiveDataPos] = inByte;
		receiveDataPos++;
	}
	else
	{
		uint8_t checkSum = generateChecksum(receiveBuffer);

		if (checkSum == inByte)
		{
			isInitiated = true;
			vars[receiveBuffer[0]] = receiveBuffer[1];
			digitalWrite(13, LOW);
			respond();
		}
		else
		{
			digitalWrite(13, HIGH);
		}
		receiveDataPos = 0;
	}
}

uint8_t varPos = 0;
void sendData()
{
	Wire.write(vars[varPos++]);
	if (varPos == numVars)
		varPos = 0;
}

void respond()
{
	updateSensor();
	heaterOn = temp < targetTemp;
	digitalWrite(heaterPin, heaterOn);
	dehumidifierOn = hum > targetHum;
	digitalWrite(dehumidifierPin, dehumidifierOn);
	digitalWrite(lampPin, lampOn);

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
	// Serial.begin(115200);
	// Serial.println("hello");
	pinMode(heaterPin, OUTPUT);
	pinMode(dehumidifierPin, OUTPUT);
	pinMode(lampPin, OUTPUT);
	pinMode(fanInPin, OUTPUT);
	pinMode(fanOutPin, OUTPUT);
	pinMode(ledStripPin, OUTPUT);
	pinMode(13, OUTPUT);

	respond();
}

void loop()
{
	if (millis() % (updateInterval * 5000) == 0 && isInitiated)
	{
		respond();
	}
	delay(1);
}
