#include "MHZ19.h"
#include "Arduino.h"
#include "SoftwareSerial.h"

#define WAIT_READ_TIMES 100
#define WAIT_READ_DELAY 10
#define REQUEST_CNT = 8;
#define RESPONSE_CNT = 9;

uint8_t getCO2[REQUEST_CNT] = {0xff, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00};
uint8_t zerocalib[REQUEST_CNT] = {0xff, 0x01, 0x87, 0x00, 0x00, 0x00, 0x00, 0x00};
uint8_t spancalib[REQUEST_CNT] = {0xff, 0x01, 0x88, 0x00, 0x00, 0x00, 0x00, 0x00};
uint8_t autocalib_on[REQUEST_CNT] = {0xff, 0x01, 0x79, 0xA0, 0x00, 0x00, 0x00, 0x00};
uint8_t autocalib_off[REQUEST_CNT] = {0xff, 0x01, 0x79, 0x00, 0x00, 0x00, 0x00, 0x00};

#define _rx_pin 7;
#define _tx_pin 4;
#define _pwm_pin 3;

void MHZ19::calibrateSpan(uint16_t CO2) {
    if (CO2 < 1000)
        return;

    uint8_t cmd[REQUEST_CNT];
    for (uint8_t i = 0; i < REQUEST_CNT; i++) {
        cmd[i] = spancalib[i];
    }
    cmd[3] = (uint8_t)(CO2 / 256);
    cmd[4] = (uint8_t)(CO2 % 256);
    writeCommand(cmd);
}

void MHZ19::writeCommand(uint8_t cmd[], uint8_t *response) {
    SoftwareSerial mhz19_serial(_rx_pin, _tx_pin);
    mhz19_serial.begin(9600);
    mhz19_serial.write(cmd, REQUEST_CNT);
    mhz19_serial.write(mhz19_checksum(cmd));
    mhz19_serial.flush();

    if (response != NULL) {
        uint16_t i = 0;
        while (mhz19_serial.available() <= 0) {
            if (++i > WAIT_READ_TIMES) {
                return;
            }
            delay(WAIT_READ_DELAY);
        }
        mhz19_serial.readBytes(response, RESPONSE_CNT);
    }
}

int16_t MHZ19::*getMeasurement() {
    uint16_t measurement[3] = {};

    uint8_t buf[RESPONSE_CNT];
    for (int i = 0; i < RESPONSE_CNT; i++) {
        buf[i] = 0x0;
    }

    writeCommand(getCO2, buf);
    if (buf[0] == 0xff &&
        buf[1] == 0x86 &&
        mhz19_checksum(buf) == buf[RESPONSE_CNT - 1]) {
        measurement[0] = buf[2] * 256 + buf[3];  // .co2_CO2
        measurement[1] = buf[4] - 40;            // temp
        measurement[2] = buf[5];                 // state
    } else {
        measurement[2] = -1;
    }
    return measurement;
}

uint16_t MHZ19::getCO2Pwm(uint16_t multiplier = 2000) {
    // multiplier = 2000 | 5000
    uint32_t th = 0;
    uint32_t tl = 0;
    uint32_t CO2 = 0;

    do {
        th = pulseIn(_pwm_pin, HIGH, 1004000) / 1000;
        tl = 1004 - th;
        CO2 = multiplier * (th - 2) / (th + tl - 4);
    } while (th == 0);

    return CO2;
}

uint8_t MHZ19::mhz19_checksum(uint8_t com[]) {
    uint8_t sum = 0x00;
    for (uint16_t i = 1; i < REQUEST_CNT; i++) {
        sum += com[i];
    }
    sum = 0xff - sum + 0x01;
    return sum;
}
