#include "i2c.h"

uint8_t varSizes[] = {
    1,   // heaterOn
    1,   // dehumidifierOn
    8,   // lampPWM
    8,   // inOutFanPWM
    8,   // pumpPWM
    8,   // sensorFanPWM
    10,  // temp
    10,  // hum
    16,  // MHZ19CO2
    8,   // MHZ19temp
    16,  // MHZ19pwmCO2
};

uint8_t I2c::generateChecksum(uint8_t bytes[], uint8_t size) {
    uint8_t sum = 0;
    for (uint8_t i = 0; i < size; i++) {
        sum += bytes[i];
    }

    sum = 255 - sum;
    return sum;
}

uint8_t I2c::*getSendBytes(uint16_t vars[], uint8_t numVars, uint8_t numSendBytes) {
    uint8_t varsToSendPos = 0;
    uint8_t bitInBytePos = 7;
    uint8_t sendBytes[numSendBytes] = {};

    for (uint8_t i = 0; i < numVars; i++) {
        uint8_t numBitsToRead = varSizes[i];
        uint16_t toRead = vars[i];

        for (int8_t bitPos = numBitsToRead - 1; bitPos >= 0; bitPos--) {
            uint8_t bit = bitRead(toRead, bitPos);
            uint8_t byte = sendBytes[varsToSendPos];

            bitWrite(byte, bitInBytePos, bit);
            sendBytes[varsToSendPos] = byte;
            if (bitInBytePos-- == 0) {
                bitInBytePos = 7;
                varsToSendPos++;
            }
        }
    }
    sendBytes[numSendBytes - 1] = generateChecksum(sendBytes, numSendBytes - 1);
    return sendBytes;
}
