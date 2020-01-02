#!/bin/bash
cd /home/pi/greenhouse/arduino

# sudo cp -r sketch/DHT/ /usr/share/arduino/libraries/
# sudo cp -r sketch/Adafruit_Sensor/ /usr/share/arduino/libraries/


make -s -C sketch/

sudo sh -c "echo 8 > /sys/class/gpio/unexport"
sudo sh -c "echo 10 > /sys/class/gpio/unexport"
sudo sh -c "echo 11 > /sys/class/gpio/unexport"
sudo sh -c "echo 9 > /sys/class/gpio/unexport"

sudo avrdude -p m328p -C pi.conf -c linuxgpio -e -U flash:w:sketch/build-uno/sketch.hex