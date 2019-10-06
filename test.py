# import RPi.GPIO as GPIO
# import time
# GPIO.setmode(GPIO.BCM)
# GPIO.setwarnings(False)
# GPIO.setup(18,GPIO.OUT)
# GPIO.output(18,GPIO.HIGH)
# time.sleep(1)
# GPIO.output(18,GPIO.LOW)

import RPi.GPIO as IO
import time

IO.setwarnings(False)

IO.setmode (IO.BCM)
IO.setup(18, IO.OUT)
p = IO.PWM(18, 100)
p.start(0)

while 1:
  for x in range (100):
    p.ChangeDutyCycle(x)
    time.sleep(0.02)

  for x in range (100):
    p.ChangeDutyCycle(100-x)
    time.sleep(0.02)
