var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mqtt = require('mqtt');
const cors = require('cors');
const UserRoute = require('./src/routes/user.route')
const DataRoute = require('./src/routes/data.route')
const LedInfo = require('./src/models/led.info.model')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.options('*', cors());


const server = require('http').createServer(app);

const WebSocket = require('ws');
const wss = new WebSocket.Server({ server: server })
const port = 8080;

server.listen(port, async () => {
  console.log(`Example app listening on port ${port}`)
})


// ----------ROUTER---------- 

// HTTP ---------------------------------------------------------
//User
app.use("/", UserRoute);


// Data
app.use("/", DataRoute);




// HTTP ---------------------------------------------------------

wss.on('connection', async (client) => {
  console.log('Client Connected');
  console.log(client.id);


  client.on('message', (message) => {
    const jsonData = JSON.parse(message);

    if (jsonData['action'] === 'getData') {
      console.log("Action: Get Data")
      getAllData();
    }

    console.log(message)
  })
});

sendToApplicaiton = async (topic, msg) => {
  console.log('\n[WS Sending] data to Applications message:', msg.toString())
}

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

saveData = async (data) => {
  await sendToApplicaiton('dinkmsd', data);
}

sendToDevice = async (topic, message) => {
  console.log('\n[MQTT Sending] data to Device message:', message)

  let data = JSON.stringify(message);
  await client.publish(topic, data);
}


// Function--------------------------------------------------------------


// -------------------- Websocket ------------------------

// Send message to all client
function sendMessage(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Generate new led info
async function generateNewLed(inputJson) {
  try {
    const newData = new Info({
      name: inputJson['name'],
      status: false,
      lat: inputJson['lat'],
      lon: inputJson['lon']
    });
    await newData.save();
    const jsonData = { "action": "createSuccessed", "id": newData._id };
    publishMessage("dinkmsd/server", JSON.stringify(jsonData));
    getAllData()
  } catch (error) {
    const jsonData = { "action": "createFailed" };
    publishMessage("dinkmsd/server", JSON.stringify(jsonData));
  }
}

// Get all led info
async function getAllData() {
  try {
    const allData = await LedInfo.find({}, {});
    const jsonData = { "action": "recievedAllData", "listData": allData };
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(jsonData));
      }
    });
  } catch (error) {
    console.log('Error: ', error)
  }
}

async function getDetailData(ledID) {
  const item = await LedInfo.findById(ledID, { 'history._id': 0 })
  var result = { "action": "detailData", item }
  console.log(result)
  // publishMessage("dinkmsd/" + ledID, JSON.stringify(result));
}

// Modify brightness
async function modifyBrighness(inputJson) {
  const data = {
    "lumi": inputJson['value']
  }
  publishMessage("monitor/" + inputJson['id'], JSON.stringify(data));
  await LedInfo.findByIdAndUpdate(
    inputJson['id'],
    {
      $set: { brightness: inputJson['value'] }
    },
    { new: true }
  );
  getAllData()
  getDetailData(inputJson['id'])
}

// -------------------- MQTT ------------------------
async function updateData(inputJson) {
  try {
    console.log(inputJson)
    var randomTemp = Math.floor(Math.random() * (28 - 27) + 27);
    var randomHumi = Math.floor(Math.random() * (66 - 65) + 65);
    const history = {
      "temperature": inputJson['temp'] || randomTemp,
      "humidity": inputJson['humi'] || randomHumi,
      "brightness": inputJson['lumi'],
      "dateTime": new Date(),
      "incli": inputJson['incli'],
      "rsrp": inputJson['rsrp'],
      "cellID": inputJson['cellID']
    }

    await LedInfo.findByIdAndUpdate(
      inputJson['id'],
      {
        $push: { history: history },
        $set: {
          status: true,
          x: inputJson['x'],
          y: inputJson['y'],
          z: inputJson['z'],
          incli: inputJson['incli'],
          rsrp: inputJson['rsrp'],
          cellID: inputJson['cellID'],
          temp: inputJson['temp'],
          humi: inputJson['humi'],
          brightness: inputJson['lumi']
        },
        // history: 0
      },
      { new: true }
    ).then(data => {
      if (data) {
        var message = {
          action: "update",
          msg: "Successed",
          data: data
        }
        sendMessage(message)
      } else {
        console.log('Info not found!!!');
      }
    })
      .catch(err => {
        console.log('Loi server')
      })
  } catch (error) {
    console.log('Lỗi khi cập nhật thông tin.', error);
  }
}

















app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
