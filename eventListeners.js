// react on the "handleReservationChanged" Event
function handleReservationChanged (event) {
    // read variables from the event
    let eventData = JSON.parse(event.data);
    let data = eventData.data;
    let deviceId = eventData.coreid;
    let timestamp = Date.parse(eventData.published_at);

    // create a message to be sent to a client
    let message = timestamp + " - Im Moment ist die " + data;

    // send the message to the client (as stream)
    exports.sse.send(message)
}

// react on the "motionDetected" Event
function handleMotionDetected (event) {
    // read variables from the event
    let eventData = JSON.parse(event.data);
    let data = eventData.data;
    let deviceId = eventData.coreid;
    let timestamp = Date.parse(eventData.published_at);

    // create a message to be sent to a client
    let message = timestamp + ": " + data;

    // send the message to the client (as stream)
    exports.sse.send(message)
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
exports.handleReservationChanged = handleReservationChanged;
exports.handleMotionDetected = handleMotionDetected;