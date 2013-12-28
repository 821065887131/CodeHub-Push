var apn = require('apn');
var config = require('../config');

var service = new apn.connection({ gateway: config.push.serviceGateway, cert: __dirname + '/cert.pem', key: __dirname + '/key.pem' });
var feedback = new apn.feedback({ address: config.push.feedbackGateway, interval: config.push.feedbackInterval, batchFeedback: true });

feedback.on('feedback', function(feedbackData) {
    var time, device;
    for(var i in feedbackData) {
        time = feedbackData[i].time;
        device = feedbackData[i].device;

        console.log("Device: " + device.toString('hex') + " has been unreachable, since: " + time);
    }
});

feedback.on('feedbackError', console.error);

service.on('connected', function() {
    console.log("APN Connected");
});

service.on('transmitted', function(notification, device) {
    console.log("Notification transmitted to:" + device.token.toString('hex'));
});

service.on('transmissionError', function(errCode, notification, device) {
    console.error("Notification caused error: " + errCode + " for device ", device, notification);
});

service.on('timeout', function () {
    console.log("Connection Timeout");
});

service.on('disconnected', function() {
    console.log("Disconnected from APNS");
});

service.on('socketError', console.error);

// Send a push notification!
exports.send = function(tokens, badge, msg, payload) {
    var data = new apn.Notification();
    //data.badge = badge;
    data.alert = msg;
    data.sound = 'default';
    data.payload = payload;
    service.pushNotification(data, tokens)
};
