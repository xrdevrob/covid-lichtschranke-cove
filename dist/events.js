var app = new Vue({
  el: "#events",
  data: {
    messages: [],
    lastMessage: "",
    timestamp: "",
  },
  mounted: function () {
    this.initSse();
  },
  methods: {
    initSse: function () {
      if (typeof EventSource !== "undefined") {
        var url = window.location.origin + "/api/events";
        var source = new EventSource(url);
        source.onmessage = (event) => {
          this.messages.push(event.data);
          this.lastMessage = event.data;
        };
      } else {
        this.message = "Your browser does not support server-sent events.";
      }
    },
    getNow: function () {
      var today = new Date();
      var date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date + " " + time;
      this.timestamp = dateTime;
    },
  },
});
