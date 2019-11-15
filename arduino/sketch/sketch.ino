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

#define numConsts 7
int consts[numConsts] = {
	32,  // 0 targetTemp
	60,  // 1 targetHum
	62,  // 2 updateInterval // 1.9 min
	255, // 3 fanInPWM
	255, // 4 fanOutPWM
	255, // 5 ledPWM
	1	// 6 updateIntervalMultiplier
};

#define numVars 8
int vars[numVars] = {
	0, // 0 temp
	0, // 1 hum
	0, // 2 fanInOn
	0, // 3 fanOutOn
	0, // 4 ledOn
	0, // 5 dehumidifierOn
	0, // 6 lampOn
	0  // 7 heaterOn
};
long interval = 120000; // 2 min
#define intervalFactor 1.09

void updateSensor()
{
	vars[0] = dht.readTemperature();
	vars[1] = dht.readHumidity();
}

int buffer[numVars + numConsts];
void receiveData()
{
	int counter = 0;
	while (Wire.available())
	{
		buffer[counter] = Wire.read();
		counter++;
	}

	if (sizeof(buffer) == numConsts)
	{
		for (int i = 0; i < numConsts; i++)
		{
			consts[i] = buffer[i];
		}
	}
	respond();
}

int varPos = 0;
void sendData()
{
	if (varPos < numConsts)
		Wire.write(consts[varPos]);
	else
	{
		updateSensor();
		Wire.write(vars[varPos - numConsts]);
	}

	varPos++;
	if (varPos == numConsts + numVars)
		varPos = 0;
}

void respond()
{
	updateSensor();

	digitalWrite(heaterPin, vars[0] < consts[0]);
	digitalWrite(dehumidifierPin, vars[1] > consts[1]);
	digitalWrite(lampPin, vars[6]);

	analogWrite(fanInPin, consts[3]);
	analogWrite(fanOutPin, consts[4]);
	analogWrite(ledStripPin, consts[5]);

	interval = pow(intervalFactor, consts[2]);
}

void setup()
{
	dht.begin();
	Wire.begin(slaveAddress);
	Wire.onReceive(receiveData);
	Wire.onRequest(sendData);
	// Serial.begin(115200);

	pinMode(heaterPin, OUTPUT);
	pinMode(dehumidifierPin, OUTPUT);
	pinMode(lampPin, OUTPUT);
	pinMode(fanInPin, OUTPUT);
	pinMode(fanOutPin, OUTPUT);
	pinMode(ledStripPin, OUTPUT);

	interval = pow(intervalFactor, consts[2]);
	updateSensor();
	respond();
}

void loop()
{
	if (millis() % interval == 0)
	{
		updateSensor();
		respond();
	}
	delay(1);
}
