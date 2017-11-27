load('api_gpio.js');
load('api_adc.js');
load('api_pwm.js');
load('api_timer.js')

let Grove = {
  Button: {
    // ## **`Grove.Button.attach(pin, handler)`**
    // Attach a handler for the button on the given pin. Example:
    // ```javascript
    // Grove.Button.attach(pin, function(pin) {
    //   print('Button event at pin', pin);
    // }, null);
    // ```
    attach: function(pin, handler) {
      GPIO.set_button_handler(pin, GPIO.PULL_UP, GPIO.INT_EDGE_POS, 200, handler, true);
    },
  },
  _touchHandler: undefined,
  TouchSensor: {
    // ## **`Grove.TouchSensor.attach(pin, handler)`**
    // Attach a handler for the touch sensor on the given pin. Example:
    // ```javascript
    // Grove.TouchSensor.attach(pin, function(pin) {
    //   print('Touch sensor event at pin', pin);
    // }, null);
    // ```
    attach: function(pin, handler) {
      GPIO.set_mode(pin, GPIO.MODE_INPUT);
      GPIO.set_int_handler(pin, GPIO.INT_EDGE_POS, handler, null);
      GPIO.enable_int(pin);
      Grove._touchHandler = handler;
    },
  },
  LED: {
    // ## **`Grove.LED.on(pin)`**
    // Turn on LED at the given pin.
    on: function(pin) {
      GPIO.set_mode(pin, GPIO.MODE_OUTPUT);
      GPIO.write(pin, 1);
    },

    // ## **`Grove.LED.off(pin)`**
    // Turn off LED at the given pin.
    off: function(pin) {
      GPIO.set_mode(pin, GPIO.MODE_OUTPUT);
      GPIO.write(pin, 0);
    },
  },
  BuzzerPwm: {
    // ## **`Grove.BuzzerPwm.on(pin, freq)`**
    // Buzz the buzzer at the given frequency on the given pin.
    on: function(pin, freq) {
      // hard code a square wave, only adjusting frequency makes sense
      PWM.set(pin, freq, 0.5);
    },
    // ## **`Grove.BuzzerPwm.off(pin)`**
    // Turn off the buzzer on the given pin.
    off: function(pin) {
      PWM.set(pin, 0, 0);
    },
  },
  BuzzerDigital: {
    // ## **`Grove.BuzzerDigital.on(pin)`**
    // Buzz the buzzer on the given pin.
    on: function(pin) {
      GPIO.set_mode(pin, GPIO.MODE_OUTPUT);
      GPIO.write(pin, 1);
    },
    // ## **`Grove.BuzzerDigital.off(pin)`**
    // Turn off the buzzer on the given pin.
    off: function(pin) {
      GPIO.set_mode(pin, GPIO.MODE_OUTPUT);
      GPIO.write(pin, 0);
    },
  },
  RotaryAngleSensor: {
    // ## **`Grove.RotaryAngleSensor.getAngle(pin)`**
    // get the angle of a rotary angle sensor on the given pin.
    getAngle: function(pin) {
      if (ADC.enable(pin)) {
        let val = ADC.read(pin);
        let voltage = val * 3.3 / 4095; // 3.3V reference, 12 bit ADC
        let degrees = voltage * 300 / 5;  // 300 degree full angle, 5V grove ref
        return degrees;
      }
      return 0;
    },
  },
  _motionHandler: undefined,
  MotionSensor: {
    // ## **`Grove.MotionSensor.attach(pin, handler)`**
    // Attach a handler for the motion sensor on the given pin. Example:
    // ```javascript
    // Grove.MotionSensor.attach(pin, function(pin) {
    //   print('Motion sensor event at pin', pin);
    // }, null);
    // ```
    attach: function(pin, handler) {
      GPIO.set_mode(pin, GPIO.MODE_INPUT);
      GPIO.set_int_handler(pin, GPIO.INT_EDGE_POS, handler, null);
      GPIO.enable_int(pin);
      Grove._motionHandler = handler;
    },
  },
  _vibrationHandler: undefined,
  VibrationSensor: {
    // ## **`Grove.VibrationSensor.attach(pin, handler)`**
    // Attach a handler for the vibration sensor on the given pin. Example:
    // ```javascript
    // Grove.VibrationSensor.attach(pin, function(pin) {
    //   print('Vibration sensor event at pin', pin);
    // }, null);
    // ```
    attach: function(pin, handler) {
      GPIO.set_mode(pin, GPIO.MODE_INPUT);
      GPIO.set_int_handler(pin, GPIO.INT_EDGE_POS, handler, null);
      GPIO.enable_int(pin);
      Grove._vibrationHandler = handler;
    },
  },
  _lightHandler: undefined,
  _lightThreshold: 0,
  _lightPin: undefined,
  _lightTimer: undefined,
  LightSensor: {
    // ## **`Grove.LightSensor.attach(pin, threshold, period, handler)`**
    // Attach a handler for the vibration sensor on the given pin.
    // (Approximately) every period milliseconds, the light sensor will be
    // checked and if the reading is greater than or equal to the given
    // threshold, then the handler will be called. Example:
    // ```javascript
    // Grove.LightSensor.attach(pin, 500, 100 /* 10 Hz */, function(value) {
    //   print('Light sensor event with value', value);
    //}, null);
    // ```
    attach: function(pin, threshold, period, handler) {
      ADC.enable(pin);
      Grove._lightThreshold = threshold;
      Grove._lightHandler = handler;
      Grove._lightPin = pin;
      Grove._lightTimer = Timer.set(period, true, function() {
        let value = ADC.read(Grove._lightPin);
        if (value >= Grove._lightThreshold) {
          Grove._lightHandler(value);
        }
      }, null);
    },
    // ## **`Grove.LightSensor.detach()`**
    // Remove any previous attached handlers if you no longer want them to run
    detach: function() {
      if (Grove._lightTimer !== undefined) {
        Timer.del(Grove._lightTimer);
        Grove._lightTimer = undefined;
      }
    }
    // ## **`Grove.LightSensor.getRaw(pin)`**
    // Get the raw light sensor reading (0-4095)
    getRaw: function(pin) {
      if (ADC.enable(pin)) {
        return ADC.read(pin);
      }
      return 0;
    },
  },
  TemperatureSensor: {
    // ## **`Grove.TemperatureSensor.getTemperature(pin)`**
    // Get the temperature
    getTemperature: function(pin) {
      if (ADC.enable(pin)) {
          let value = ADC.read(pin);
          let M = 4095/value-1;
          let temperature = 1/(Math.log(M)/4275+1/298.15)-273.15;
          return temperature;
      }
      return 0;
    },
  },
  _soundHandler: undefined,
  _soundThreshold: 0,
  _soundPin: undefined,
  _soundTimer: undefined,
  SoundSensor: {
    // ## **`Grove.SoundSensor.attach(pin, threshold, period, handler)`**
    // Attach a handler for the sound sensor on the given pin.
    // (Approximately) every period milliseconds, 16 readings from the sound
    // sensor will be taken and if the average meets or exceed the given
    // threshold, then the handler will be called. Example:
    // ```javascript
    // Grove.SoundSensor.attach(pin, 500, 100 /* 10 Hz */ function(avgValue) {
    //   print('Light sensor event with avgValue', avgValue);
    //}, null);
    // ```
    attach: function(pin, threshold, period, handler) {
      ADC.enable(pin);
      Grove._soundThreshold = threshold;
      Grove._soundHandler = handler;
      Grove._soundPin = pin;
      Grove._soundTimer = Timer.set(period, true, function() {
        let avgValue = 0;
        for (let i = 0; i < 16; i++) {
          avgValue += ADC.read(Grove._soundPin);
        }
        avgValue /= 16;
        if (avgValue >= Grove._soundThreshold) {
          Grove._soundHandler(value);
        }
      }, null);
    },
    // ## **`Grove.SoundSensor.detach()`**
    // Remove any previous attached handlers if you no longer want them to run
    detach: function() {
      if (Grove._soundTimer !== undefined) {
        Timer.del(Grove._soundTimer);
        Grove._soundTimer = undefined;
      }
    }
    // ## **`Grove.SoundSensor.getRaw(pin)`**
    // Get the raw sound sensor reading (0-4095)
    getRaw: function(pin) {
      if (ADC.enable(pin)) {
        return ADC.read(pin);
      }
      return 0;
    },
  },
};
