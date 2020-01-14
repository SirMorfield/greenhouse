#include "i2c.h"

uint8_t varSizes[] = {
	1,  // heaterOn
	1,  // dehumidifierOn
	8,  // lampPWM
	8,  // inOutFanPWM
	8,  // pumpPWM
	8,  // sensorFanPWM
	10, // temp
	10  // hum
};

uint8_t I2c::generateChecksum(uint8_t bytes[], uint8_t size)
{
	uint8_t sum = 0;
	for (uint16_t i = 0; i < size; i++)
	{
		sum += bytes[i];
	}

	sum = 255 - sum;
	return sum;
}

uint8_t I2c::*getBytesToSend(uint16_t vars[], uint8_t numBytesToSend)
{
	uint8_t varsToSendPos = 0;
	uint8_t bitInBytePos = 7;
	uint8_t numVars = sizeof(vars) / sizeof(vars[0]);
	uint8_t bytesToSend[8] = {};

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
	return bytesToSend;
}
