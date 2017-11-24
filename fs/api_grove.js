load('api_gpio.js');
load('api_adc.js');
load('api_pwm.js');

let Grove = {
  Button: {
    // ## **`Grove.Button.attach(pin, handler)`**
    // Attach a handler for the button on the given pin. Example:
    // ```javascript
    // Grove.Button.attach(pin, function(pin) {
    //    print('Button event at pin', pin);
    // }, null);
    // ```
    attach: function(pin, handler) {
      GPIO.set_button_handler(pin, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, handler, true);
    },
  },
  _touchHandler: undefined,
  TouchSensor: {
    // ## **`Grove.TouchSensor.attach(pin, handler)`**
    // Attach a handler for the touch sensor on the given pin. Example:
    // ```javascript
    // Grove.TouchSensor.attach(pin, function(pin) {
    //    print('Touch sensor event at pin', pin);
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
      GPIO.write(pin,0);
    },
  },
  RotaryAngleSensor: {
    // ## **`Grove.RotaryAngleSensor.getAngle(pin)`**
    // get the angle of a rotary angle sensor on the given pin.
    getAngle: function(pin) {
      ADC.enable(pin);
      let val = ADC.read(pin);
      let voltage = val * 3.3 / 4095; // 3.3V reference, 12 bit ADC
      let degrees = voltage * 300 / 5;  // 300 degree full angle, 5V grove ref
      return degrees;
    },
  },
  _motionHandler: undefined,
  MotionSensor: {
    // ## **`Grove.MotionSensor.attach(pin, handler)`**
    // Attach a handler for the motion sensor on the given pin. Example:
    // ```javascript
    // Grove.MotionSensor.attach(pin, function(pin) {
    //    print('Motion sensor event at pin', pin);
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
    //## **`Grove.VibrationSensor.attach(pin, handler)`**
    //Attach a handler for the vibration sensor on the given pin. Example:
    // ```javascript
    //Grove.VibrationSensor.attach(pin, function(pin) {
        //print('Vibration sensor event at pin', pin);
    //}, null);
    // ```
    attach: function(pin, handler) {
      GPIO.set_mode(pin, GPIO.MODE_INPUT);
      GPIO.set_int_handler(pin, GPIO.INT_EDGE_POS, handler, null);
      GPIO.enable_int(pin);
      Grove._vibrationHandler = handler;
    },
    get: function(pin) {
      return ADC.read(pin);
    },
  },
  LightSensor: {
    // ## **`Grove.LightSensor.get(pin)`**
    // Test whether light on.
    get: function(pin) {
      let light = ADC.read(pin);
      if (light>3000) {
        print('Light too weak', 4095-light);
      }
      else {
        print('light detected', 4095-light);
      }
    },
  },
  TemperatureSensor: {
    // ## **`Grove.TemperatureSensor.get(pin)`**
    //get the measured temperature.
    get: function(pin) {
      if(ADC.enable(pin)) {
          let value = ADC.read(pin);
          let M = 4095/value-1;
          let temperature = 1/(Math.log(M)/4275+1/298.15)-273.15;
          return temperature;
      }
    },
  },
  SoundSensor: {
    // ## **`Grove.SoundSensor.get(pin)`**
    //Test if a sound detected.
    get: function (pin) {
      if(ADC.enable(pin)) {
        let sound = 0;
        for(let i=0; i<32; i++){
          if (ADC.read(pin) > sound) {
            sound = ADC.read(pin);
          }
        }
        if (sound>500) {
          print('Sound detected', sound);
        }
        else {
          print('Sound too weak', sound);
        }
      }
    }
  },
};
