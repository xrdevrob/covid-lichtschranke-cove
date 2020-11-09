// remember the last event so that we can check if two buttons were pressed within 1 second
var lastButtonPressEvent = {
    deviceId: "",
    timestamp: 0
}

// remember how many times the buttons were pressed
var buttonPressCounter = 0;

// react on the "blinkingStateChanged" Event
function handleBlinkingStateChanged (event) {
    // read variables from the event
    let ev = JSON.parse(event.data);
    let evData = ev.data; // the data from the argon event: "started blinking" or "stopped blinking"
    let evDeviceId = ev.coreid; // the device id
    let evTimestamp = Date.parse(ev.published_at); // the timestamp of the event

    // the data we want to send to the clients
    let data = {
        message: evData, // just forward "started blinking" or "stopped blinking"
    }

    // send data to all connected clients
    sendData("blinkingStateChanged", data, evDeviceId, evTimestamp );
}

// react on the "buttonStateChanged" Event
function handleButtonStateChanged (event) {
    // read variables from the event
    let ev = JSON.parse(event.data);
    let evData = ev.data; // the data from the argon event: "pressed" or "released"
    let evDeviceId = ev.coreid; // the device id
    let evTimestamp = Date.parse(ev.published_at); // the timestamp of the event

    // helper variables that we need to build the message to be sent to the clients
    let sync = false;
    let msg = "";

    if (evData === "pressed") {
        buttonPressCounter++; // increase the buttonPressCounter by 1
        msg = "pressed";

        // check if the last two button press events were whithin 1 second
        if (evTimestamp - lastButtonPressEvent.timestamp < 1000) {
            if (evDeviceId !== lastButtonPressEvent.deviceId) {
                sync = true;
            }
        }

        lastButtonPressEvent.timestamp = evTimestamp;
        lastButtonPressEvent.deviceId = evDeviceId;
    } 
    else if (evData === "released") {
        msg = "released";
    }
    else {
        msg = "unknown state";
    }

    // the data we want to send to the clients
    let data = {
        message: msg,
        counter: buttonPressCounter,
        pressedSync: sync
    }

    // send data to all connected clients
    sendData("buttonStateChanged", data, evDeviceId, evTimestamp );
}

// send data to the clients.
// You don't have to change this function
function sendData(evName, evData, evDeviceId, evTimestamp ) {
    
    // map device id to device nr
    let nr = exports.deviceIds.indexOf(evDeviceId)

    // the message that we send to the client
    let data = {
        eventName: evName,
        eventData: evData,
        deviceNumber: nr,
        timestamp: evTimestamp,
    };

    // send the data to all connected clients
    exports.sse.send(data)
}

exports.deviceIds = [];
exports.sse = null;

// export your own functions here as well
exports.handleBlinkingStateChanged = handleBlinkingStateChanged;
exports.handleButtonStateChanged = handleButtonStateChanged;