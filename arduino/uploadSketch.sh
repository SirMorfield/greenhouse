#!/bin/bash
make -s -C arduino/sketch/ | egrep "Device|Program|Data|error"

# OPTION - ISP upload
avrdude -p m328p -C arduino/sketch/avrdude.conf -c gpio -e -U flash:w:arduino/sketch/build-uno/sketch.hex
avrdude -p m328p -c gpio -e -U flash:w:sketch/build-uno/sketch.hex

# OPTION - usb upload
# avrdude -C sketch/avrdude.conf -v -patmega328p -carduino -P /dev/ttyACM0 -b115200 -D -U flash:w:sketch/build-uno/sketch.hex

# OPTION - normally executed by arduino ide
# /home/joppe/Downloads/arduino-1.8.10-linux64/arduino-1.8.10/hardware/tools/avr/bin/avrdude -C/home/joppe/Downloads/arduino-1.8.10-linux64/arduino-1.8.10/hardware/tools/avr/etc/avrdude.conf -v -patmega328p -carduino -P/dev/ttyACM0 -b115200 -D -Uflash:w:/tmp/arduino_build_333508/Blink.ino.hex:i
