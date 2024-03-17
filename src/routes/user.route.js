const router = require("express").Router();
const UserController = require('../controller/user.controller');
const passport = require('passport')


passport.use(UserController.localStrategy)

router.post('/login', UserController.loginPassport);


router.post("/register", UserController.register);

router.post("/token", UserController.authToken, (req, res, next) => {
    const token = req.headers.token

});

router.get('/private', UserController.authLogin, (req, res, next) => {
    res.json("Successed!")
})

module.exports = router;