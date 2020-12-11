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
          console.log("Event:" + event.data);

          this.messages.push(JSON.parse(event.data));
          this.lastMessage = event.data;
        };
      } else {
        this.message = "Your browser does not support server-sent events.";
      }
    },
  },
});
