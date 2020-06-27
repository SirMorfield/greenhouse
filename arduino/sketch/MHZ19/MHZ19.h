class MHZ19 {
   public:
    void calibrateSpan(uint16_t CO2);
    int16_t *getMeasurement();
    void writeCommand(uint8_t cmd[], uint8_t *response);
    void calibrateZero();
    uint16_t getCO2Pwm(uint16_t multiplier = 2000);
};