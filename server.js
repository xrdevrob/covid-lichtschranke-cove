const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
const EventSource = require("eventsource");

var constants = {}
try {
    constants = require('./constants')
} catch (error) {
    console.log("Module 'constants' not found, trying Heroku config vars.")
}

const eventListeners = require('./eventListeners.js');
var SSE = require('express-sse');

var sse = new SSE([]);
eventListeners.sse = sse;

const app = express();

app.use(cors())
app.use(bodyParser.json()); // support json encoded bodies
app.use('/', express.static(path.join(__dirname, 'dist')));

const port = process.env.PORT || '3001';
app.set('port', port);

const access_token_1 = process.env.ACCESS_TOKEN_1 || constants.access_token_1;
const device_id_1 = process.env.DEVICE_ID_1 || constants.device_id_1;
const access_token_2 = process.env.ACCESS_TOKEN_2 || constants.access_token_2;
const device_id_2 = process.env.DEVICE_ID_2 || constants.device_id_2;

eventListeners.deviceIds = [ device_id_1, device_id_2 ];

const devices = [
    {
        device_id: device_id_1,
        access_token: access_token_1
    }
]

if (device_id_2) {
    devices.push({
        device_id: device_id_2,
        access_token: access_token_2
    })
}

const server = http.createServer(app);

for (let device of devices) {
    let eventURL = 'https://api.particle.io/v1/devices/' + device.device_id + '/events?access_token=' + device.access_token
    var source = new EventSource(eventURL);

    /////////////////////////////////////////////////////////
    // Add your event listeners here.
    source.addEventListener('motionDetected', eventListeners.handleMotionDetected)
    source.addEventListener('reservationChanged', eventListeners.handlereservationChanged)
    // You don't have to change anything else in this file.
    /////////////////////////////////////////////////////////
    source.addEventListener('buttonStateChanged', eventListeners.handleButtonStateChanged)
    /////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////
}

// Read a variable. Example:
// GET /api/device/0/variable/buttonState
app.get('/api/device/:id/variable/:name', (req, res) => {
    let id = req.params.id;
    let variableName = req.params.name;

    if (id >= devices.length) {
        res.status(500).send({ error: "invalid device id" });
    }
    else {
        let device = devices[id];
        let url = 'https://api.particle.io/v1/devices/' + device.device_id + '/' + variableName + '?access_token=' + device.access_token;
        axios.get(url)
            .then(response => {
                res.send({ 
                    timeStamp: response.data.coreInfo.last_heard,
                    result: response.data.result, 
                });
            })
            .catch( error => {
                res.status(500).send({ error: "could not read current value" });
            });
    }
})

// Call a function. Example:
// POST /api/device/0/function/blinkRed
app.post('/api/device/:id/function/:name', (req, res) => {

    let id = req.params.id;
    let functionName = req.params.name;

    if (id >= devices.length) {
        res.status(500).send({ error: "invalid device id" });
    }
    else {
        let device = devices[id];
        let data = { arg: req.body.arg }; 

        let url = 'https://api.particle.io/v1/devices/' + device.device_id + '/' + functionName + '?access_token=' + device.access_token;

        axios.post(url, data)
            .then( response => {
                res.send({ result: response.data.return_value })
            })
            .catch( error => {
                res.status(500).send({ error: "could not execute function " + functionName })
            });
    }
})

// GET /api/events
app.get('/api/events', sse.init);

server.listen(port, () => {
    console.log("app listening on port " + port);
});
