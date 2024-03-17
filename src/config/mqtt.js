const mqtt = require('mqtt');


const client = mqtt.connect('mqtt://broker.hivemq.com:1883');
client.on('connect', () => {
    console.log('MQTT Connected');

    client.subscribe('dinkmsd');
})

client.on('message', (topic, message) => {
    var currentdate = new Date();
    var timer = "Timer: " + currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();
    console.log(timer);
    console.log('\n[MQTT Received] Topic:', topic, ', Message:', message.toString());

    const jsonData = JSON.parse(message);

    if (jsonData['action'] === 'updateData') {
        console.log("Action: Request Update Data")
        updateData(jsonData['data']);
    }

})

sendToDevice = (topic, message) => {
    console.log('\n[MQTT Sending] data to Device message:', message)

    let data = JSON.stringify(message);
    client.publish(topic, data);
}


module.exports = client