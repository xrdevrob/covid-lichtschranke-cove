var rootUrl = window.location.origin; // get the root URL, e.g. https://example.herokuapp.com

var app = new Vue({
  el: "#app",
  data: {
    counter: 0, // number of people currently in the room
    position: 0, // position of servo motor, if 90 = open, if 0 = closed
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
          this.updateVariables(JSON.parse(event.message));
        };
      } else {
        this.message = "Your browser does not support server-sent events.";
      }
    },
    // call the function "raumReservieren" in your backend
    raumReservieren: function (nr) {
      var duration = this.duration; // reservation duration in seconds
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

function exportTableToExcel(tableID, filename = "") {
  var downloadLink;
  var dataType = "application/vnd.ms-excel";
  var tableSelect = document.getElementById(tableID);
  var tableHTML = tableSelect.outerHTML.replace(/ /g, "%20");

  // Specify file name
  filename = filename ? filename + ".xls" : "excel_data.xls";

  // Create download link element
  downloadLink = document.createElement("a");

  document.body.appendChild(downloadLink);

  if (navigator.msSaveOrOpenBlob) {
    var blob = new Blob(["\ufeff", tableHTML], {
      type: dataType,
    });
    navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    // Create a link to the file
    downloadLink.href = "data:" + dataType + ", " + tableHTML;

    // Setting the file name
    downloadLink.download = filename;

    //triggering the function
    downloadLink.click();
  }
}