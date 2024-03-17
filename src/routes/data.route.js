const router = require("express").Router();
const LedController = require('../controller/led.controller')
const UserController = require('../controller/user.controller')




router.get('/data', UserController.authLogin, LedController.getAllData)

router.post('/data', UserController.authLogin, LedController.createLed)

// Get schedule
router.get('/schedule', UserController.authLogin, LedController.getSchedule, (req, res, next) => {
})

// Add schedule
router.post('/schedule', UserController.authLogin, LedController.addNewSchedule)

// Edit schedule
router.put('/schedule', UserController.authLogin, LedController.editSchedule)

// Delete schedule
router.delete('/schedule', UserController.authLogin, LedController.deleteSchedule)

// Set brightness value
router.post('/modifyLumi', UserController.authLogin, LedController.setBrightness)

module.exports = router