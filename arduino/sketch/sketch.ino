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

#define numConsts 6
byte consts[numConsts] = {
	32,  // 0 targetTemp
	1,   // 1 targetHum
	1,   // 2 updateInterval // 14 * 5000 = 1.16... min
	255, // 3 fanInPWM
	255, // 4 fanOutPWM
	255, // 5 ledStripPWM
};
#define targetTemp consts[0]
#define targetHum consts[1]
#define updateInterval consts[2]
#define fanInPWM consts[3]
#define fanOutPWM consts[4]
#define ledStripPWM consts[5]

#define numVars 8
byte vars[numVars] = {
	0, // 0 temp
	0, // 1 hum
	0, // 2 fanInOn
	0, // 3 fanOutOn
	0, // 4 ledOn
	0, // 5 dehumidifierOn
	0, // 6 lampOn
	0  // 7 heaterOn
};

#define temp vars[0]
#define hum vars[1]
#define fanInOn vars[2]
#define fanOutOn vars[3]
#define ledOn vars[4]
#define dehumidifierOn vars[5]
#define lampOn vars[6]
#define heaterOn vars[7]

void updateSensor()
{
	temp = dht.readTemperature();
	hum = dht.readHumidity();
}

byte buffer[numConsts + numVars + 1];
bool validateBuffer()
{
	byte controle = 0;
	for (int i = 0; i < sizeof(buffer) - 1; i++)
	{
		controle += buffer[i];
	}
	return (buffer[sizeof(buffer) - 1] == controle);
}

void receiveData()
{
	int counter = 0;
	while (Wire.available())
	{
		buffer[counter] = Wire.read();
		counter++;
	}

	if (sizeof(buffer) == numConsts + 1)
	{
		if (validateBuffer())
		{
			for (int i = 0; i < numConsts; i++)
			{
				consts[i] = buffer[i];
			}
			digitalWrite(13, LOW);
		}
		else
		{
			digitalWrite(13, HIGH);
		}
	}
	respond();
}

int varPos = 0;
void sendData()
{
	if (varPos < numConsts)
	{
		Wire.write(consts[varPos]);
		Serial.println(consts[varPos]);
	}
	else
	{
		updateSensor();
		Wire.write(vars[varPos - numConsts]);
		Serial.println(vars[varPos - numConsts]);
	}

	varPos++;
	if (varPos == numConsts + numVars)
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
	Serial.begin(115200);

	pinMode(heaterPin, OUTPUT);
	pinMode(dehumidifierPin, OUTPUT);
	pinMode(lampPin, OUTPUT);
	pinMode(fanInPin, OUTPUT);
	pinMode(fanOutPin, OUTPUT);
	pinMode(ledStripPin, OUTPUT);
	pinMode(13, OUTPUT);

	updateSensor();
	respond();
}

void loop()
{
	if (millis() % (updateInterval * 5000) == 0)
	{
		Serial.print(millis());
		Serial.println(F(" update"));
		updateSensor();
		respond();
	}
	delay(1);
}
