const LedInfo = require('../models/led.info.model')
const client = require('../config/mqtt')

exports.createLed = async (req, res, next) => {
    try {
        const lat = req.body.lat
        const lon = req.body.lon
        const name = req.body.name
        await LedInfo.create({ name: name, lat: lat, lon: lon, status: true, })
            .then(data => {
                if (data) {
                    var msg = {
                        "message": "Successed",
                        "data": data
                    }
                    res.json(msg)
                }
            })
            .catch(err => {
                var msg = {
                    "message": "Server Error"
                }
                res.status(500).json(msg)
            })
    } catch (error) {
        console.log("Get failed!!! ", error)
    }
}


exports.getAllData = async (req, res, next) => {
    try {
        await LedInfo.find({}, { schedule: 0, history: 0 })
            .then(data => {
                if (data) {
                    res.json(data)
                }
            })
            .catch(err => {
                res.status(500).json("Server error")
            })
    } catch (error) {
        console.log("Get failed!!! ", error)
    }
}

exports.addNewSchedule = async (req, res, next) => {
    try {
        console.log(Date.now())
        const ledID = req.body.ledID
        const scheduleInfo = {
            time: req.body.time,
            value: req.body.value,
            status: req.body.status,
        };
        await LedInfo.findOneAndUpdate(
            { _id: ledID, },
            {
                $push: {
                    schedule: scheduleInfo,
                },
            },
            { new: true }
        ).then(data => {
            if (data) {
                res.json(data.schedule)
            } else {
                console.log("Khong ton tai")
            }
        }).catch(error => {
            res.status(500).json('Server error')
        })
    } catch (error) {
        console.log("Add schedule failed!!! ", error)
    }
}

exports.getSchedule = async (req, res, next) => {
    try {

        const ledID = req.headers.id
        console.log(ledID)

        await LedInfo.findById(ledID)
            .then(data => {
                if (data) {
                    res.json(data.schedule)
                }
            }).catch(error => {
                res.status(500).json('Server error')
            })
    } catch (error) {
        console.log("Get schedule failed!!! ", error)
    }
}

exports.editSchedule = async (req, res, next) => {
    try {
        console.log("Hello")
        const ledID = req.body.ledID
        const status = req.body.status
        const scheduleID = req.body.scheID

        await LedInfo.findOneAndUpdate(
            {
                _id: ledID,
                "schedule._id": scheduleID
            },
            {
                $set: {
                    "schedule.$.status": status
                }
            },
            {
                new: true
            }
        ).then(data => {
            if (data) {
                res.json(data.schedule)
            }
        }).catch(error => {
            var msg = {
                "message": "Server error",
                "error": error
            }
            res.status(500).json(msg)
        })
    } catch (error) {
        console.log("Get schedule failed!!! ", error)
    }
}


// Delete schedule
exports.deleteSchedule = async (req, res, next) => {
    try {
        const ledID = req.body.ledID
        const scheduleID = req.body.scheID
        await LedInfo.findOneAndUpdate(
            { _id: ledID },
            { $pull: { schedule: { _id: scheduleID } } },
            {
                new: true
            }
        ).then((data) => {
            if (data) {
                res.json(data.schedule)
            }
        })
            .catch((error) => {
                console.error("Error removing element from schedule:", error);
            });
    } catch (error) {
        console.log("Can't delete schedule: ", error)
    }
}

exports.setBrightness = async (req, res, next) => {
    try {
        const ledID = req.body.ledID
        const value = req.body.value
        client.publish("dinkmsd/" + ledID, JSON.stringify({ value: value }))
        await LedInfo.findByIdAndUpdate(
            ledID,
            {
                $set: { brightness: value }
            },
            { new: true }
        ).then(data => {
            if (data) {
                var msg = {
                    "message": "Succesed",
                    "data": data
                }
                res.json(msg)
            }
        })
        res.json("Successed!!!")
    } catch (error) {
        res.status(500).json("Server error!")
    }
}
