class I2c {
   public:
    uint8_t *getSendBytes(uint16_t vars[], uint8_t numSendBytes);
    uint8_t generateChecksum(uint8_t bytes[], uint8_t size);
};