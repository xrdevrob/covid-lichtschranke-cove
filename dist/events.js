
var app = new Vue({
    el: "#app",
    data: {
        messages: [],
        lastMessage: ""
    },
    mounted: function () {
        this.initSse();
    },
    methods: {
        initSse: function () {
            if (typeof (EventSource) !== "undefined") {
                var url = window.location.origin + "/api/events";
                var source = new EventSource(url);
                source.onmessage = (event) => { 
                    this.messages.push(event.data);
                    this.lastMessage = event.data;
                };
            } else {
                this.message = "Your browser does not support server-sent events.";
            }
        }
    }
})
