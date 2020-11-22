var rootUrl = window.location.origin; // get the root URL, e.g. https://example.herokuapp.com

var app = new Vue({
  el: "#app",
  data: {
    counter: 0, // number of people currently in the room
    position: 0, // position of servo motor, if 90 = open, if 0 = closed
    reservation: false, // when demo activ = true
    besetzt: false, // when counter is > 5 = true
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
      if (ev.eventName === "reservationChanged") {
          if (ev.eventData.message === "Demo aktiv") {
              this.reservation = true;
          }
          if (ev.eventData.message === "Demo abgeschlossen") {
              this.reservation = false;
          }
      }
  },
    // call the function "raumReservieren" in your backend
    raumReservieren: function (nr) {
      var duration = 5; // reservation duration in seconds
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
    // call the function "displayChange" in your backend
    displayChange: function (nr) {
      var duration = 20; // reservation duration in seconds
      axios
        .post(rootUrl + "/api/device/" + nr + "/function/displayChange", {
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
          if (position == 90) {
            position = "Bitte treten Sie ein!";
          } else {
            position = "Der Raum ist zurzeit leider besetzt!";
          }
          if (nr === 0) {
            this.position = position;
          } else {
            console.log("unknown device");
          }
        })
        .catch((error) => {
          alert("Could not read the button state of device number");
        });
    },
  },
});

// get Event data from "motionDetected"

// ycounts: "Person eingegangen" wird als +1 eine Person gezählt, bei "Person ausgegangen" passiert nicht
// xlabels: Das Datum der Event, Events am gleichen Datum sollen zusammengezählt werden

// Chart.js push Label and Data from Argon to Chart
const xlabels = [];
const ycounts = [];

const ctx = document.getElementById("myChart").getContext("2d");
const chart = new Chart(ctx, {
  // The type of chart we want to create
  type: "line",

  // The data for our dataset
  data: {
    labels: xlabels,
    datasets: [
      {
        label: "Durchschn. tägliche Anzahl Personen im Raum pro Monat",
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgb(255, 99, 132)",
        data: ycounts,
      },
    ],
  },

  // Configuration options
  options: {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            suggestedMax: 15,
          },
        },
      ],
    },
  },
});
