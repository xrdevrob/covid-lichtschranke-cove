var rootUrl = window.location.origin; // get the root URL, e.g. https://example.herokuapp.com

var app = new Vue({
  el: "#app",
  data: {
    buttonState_0: "unknown", // the state of the button on device 0
    buttonState_1: "unknown", // the state of the button on device 1
    buttonsSync: false, // true if the buttons were pressed within 1 second
    blinking_0: false, // true if device 0 is blinking.
    blinking_1: false, // true if device 0 is blinking.
    // add your own variables here ...
    counter: 0,
    position: 0,
    reservation: false,
  },
  // This function is executed once when the page is loaded.
  mounted: function () {
    this.initSse();
  },
  methods: {
    // Initialise the Event Stream (Server Sent Events)
    // You don't have to change this function
    initSse: function () {
      if (typeof EventSource !== "undefined") {
        var url = rootUrl + "/api/events";
        var source = new EventSource(url);
        source.onmessage = (event) => {
          this.updateVariables(JSON.parse(event.data));
        };
      } else {
        this.message = "Your browser does not support server-sent events.";
      }
    },
    // react on events: update the variables to be displayed
    updateVariables(ev) {
      // Event "buttonStateChanged"
      if (ev.eventName === "buttonStateChanged") {
        this.buttonPressCounter = ev.eventData.counter;
        if (ev.eventData.message === "pressed") {
          this.buttonsSync = ev.eventData.pressedSync;
        }
      }
      // Event "reservationChanged"
      else if (ev.eventName === "reservationChanged") {
        if (ev.eventData.message === "Reservation aktiv") {
          if (ev.deviceNumber === 0) {
            this.reservation = true;
          } else if (ev.deviceNumber === 1) {
            this.reservation = true;
          }
        }
        if (ev.eventData.message === "Reservation abgelaufen") {
          if (ev.deviceNumber === 0) {
            this.reservation = false;
          } else if (ev.deviceNumber === 1) {
            this.reservation = false;
          }
        }
      }
    },
    // call the function "raumReservieren" in your backend
    raumReservieren: function (nr) {
      var duration = 2000; // reservation duration in milliseconds
      axios
        .post(rootUrl + "/api/device/" + nr + "/function/raumReservieren", {
          arg: duration,
        })
        .then((response) => {
          // Handle the response from the server
          console.log(response.data); // we could to something meaningful with the return value here ...
        })
        .catch((error) => {
          alert(
            "Could not call the function 'raumReservieren' of device number " +
              nr +
              ".\n\n" +
              error
          );
        });
    },
    // get the value of the variable "buttonState" on the device with number "nr" from your backend
    getButtonState: function (nr) {
      axios
        .get(rootUrl + "/api/device/" + nr + "/variable/buttonState")
        .then((response) => {
          // Handle the response from the server
          var buttonState = response.data.result;
          if (nr === 0) {
            this.buttonState_0 = buttonState;
          } else if (nr === 1) {
            this.buttonState_1 = buttonState;
          } else {
            console.log("unknown device number: " + nr);
          }
        })
        .catch((error) => {
          alert(
            "Could not read the button state of device number " +
              nr +
              ".\n\n" +
              error
          );
        });
    },
    // get the value of the variable "counter"
    getCounter: function (nr) {
      axios
        .get(rootUrl + "/api/device/" + nr + "/variable/counter")
        .then((response) => {
          // Handle the response from the server
          var counter = response.data.result;
          if (nr === 0) {
            this.counter = counter;
          } else {
            console.log("unknown device number: " + nr);
          }
        })
        .catch((error) => {
          alert(
            "Could not read the button state of device number " +
              nr +
              ".\n\n" +
              error
          );
        });
    },
    // get the value of the variable "position"
    getPosition: function (nr) {
      axios
        .get(rootUrl + "/api/device/" + nr + "/variable/position")
        .then((response) => {
          // Handle the response from the server
          var position = response.data.result;
          if (nr === 0) {
            this.position = position;
          } else {
            console.log("unknown device number: " + nr);
          }
        })
        .catch((error) => {
          alert(
            "Could not read the button state of device number " +
              nr +
              ".\n\n" +
              error
          );
        });
    },
  },
});
