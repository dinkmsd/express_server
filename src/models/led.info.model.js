const { Timestamp } = require('mongodb');
const mongoose = require('mongoose');
mongoose.connect('mongodb://0.0.0.0:27017/my_dbs');
const Schema = mongoose.Schema;

const LedSchema = new Schema({
  name: String,
  status: Boolean,
  lat: Number,
  lon: Number,
  temp: Number,
  humi: Number,
  brightness: Number,
  incli: String,
  x: String,
  y: String,
  z: String,
  rsrp: Number,
  cellID: Number,
  history: [
    {
      temperature: Number,
      humidity: Number,
      brightness: Number,
      dateTime: Date,
      incli: String,
      rsrp: Number,
      cellID: Number,
    }
  ],
  schedule: [
    {
      time: String,
      value: Number,
      status: Boolean,
    }
  ]
})

const LedModel = mongoose.model("LedInfo", LedSchema)

// for (let i = 0; i < 9; i++) {
//   LedModel.create({
//     name: 'LED_' + i,
//     status: true,
//     lat: 10.876143961570557, 
//     lon: 106.80443585691286,
//     temp: 33,
//     humi: 57,
//     brightness: 0,
//     incli: "90",
//     x: "0.3",
//     y: "0.2",
//     z: "0.4",
//     rsrp: -191,
//     cellID: 5231,
//     history: [],
//     schedule: []
//   })
// }

module.exports = LedModel;

