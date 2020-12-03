var app = new Vue({
  el: "#events",
  data: {
    messages: [],
    lastMessage: "",
    timestamps: [],
  },
  mounted: function () {
    this.initSse();
  },
  methods: {
    initSse: function () {
      if (typeof EventSource !== "undefined") {
        var url = window.location.origin + "/api/events";
        var source = new EventSource(url);
        var currentDate = new Date();
        source.onmessage = (event) => {
          this.messages.push(event.data);
          this.lastMessage = event.data;
          this.timestamps = currentDate;
        };
      } else {
        this.message = "Your browser does not support server-sent events.";
      }
    },
  },
});
