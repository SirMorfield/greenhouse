void setup()
{
	pinMode(6, OUTPUT);
	uint8_t on = 0;

	analogWrite(6, 255 - on); // turn the LED on (HIGH is the voltage level)
}

void loop()
{
	// delay(1000);
	// digitalWrite(6, LOW);
	// delay(1000);
}