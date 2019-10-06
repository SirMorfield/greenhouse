
// void setup()
// {
// 	Serial.begin(115200);
// 	pinMode(13, OUTPUT);
// }

// void loop()
// {
// 	while (serial.available())
// 	{
// 		String inp = Serial.readStringUntil('\n');

// 	}
// }

#include "Arduino.h"

String serialResponse = "";
char sz[] = "Here; is some; sample;100;data;1.414;1020";

void updateConstants()
{
	serialResponse = Serial.readStringUntil('\n');

	// Convert from String Object to String.
	char buf[sizeof(sz)];
	serialResponse.toCharArray(buf, sizeof(buf));
	char *p = buf;
	char *str;
	while ((str = strtok_r(p, ";", &p)) != NULL)
	{
		int num = atol(str);
	}
}

void setup()
{
	Serial.begin(115200);
}

void loop()
{
	if (Serial.available())
	{
		updateConstants()
	}
}
