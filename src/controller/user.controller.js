const UserModel = require('../models/user.model');
const UserServices = require('../services/user.service');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var jwt = require('jsonwebtoken');
var GoogleStrategy = require('passport-google-oauth20').Strategy;


exports.register = async (req, res, next) => {
    try {
        console.log("---req body---", req.body);
        const { username, password } = req.body;
        const duplicate = await UserServices.getUserByUsername(username);
        if (duplicate) {
            return res.status(201).json({ msg: "Account is existed!" })
        }
        const response = await UserServices.registerUser(username, password);

        res.json({ msg: 'User registered successfully' });

    } catch (err) {
        console.log("---> err -->", err);
        next(err);
    }
}


exports.authLogin = async (req, res, next) => {
    console.log(req.headers['authorization'])
    var token = req.headers['authorization'].split(' ')[1]
    jwt.verify(token, "secret", (error, data) => {
        if (error) return res.status(403).json('Invalid token')
        console.log(data)
        next()
    })
}


exports.authToken = async (req, res, next) => {

    const token = req.headers.token
    const result = await UserServices.authToken(token, "secret")
    // console.log(result)
    if (result['auth'] === true) {
        tokenData = result.message
        const id = tokenData['_id']
        UserModel.findById(id)
            .then(data => {
                if (data) {
                    const msg = {
                        message: "Valid token",
                        data: {
                            id: data._id,
                            username: data.username,
                            role: data.role,
                            token: token
                        }
                    }
                    console.log(msg)
                    res.json(msg)
                } else {
                    res.status(201).json({
                        message: "Unvalid token"
                    })
                }
            })
            .catch(err => {
                res.json(500).json({
                    message: "Server error"
                })
            })
    } else {
        res.status(500).json({
            message: "Server error"
        })
    }

}

exports.localStrategy = new LocalStrategy(
    function (username, password, done) {
        UserModel.findOne({
            username: username,
        })
            .then(async data => {

                if (!data) { return done(null, false); }
                const isPasswordCorrect = await data.comparePassword(password);
                if (!isPasswordCorrect) { return done(null, false); }
                return done(null, data)
            })
            .catch(err => {
                return done(err);
            })
    }
)

exports.loginPassport = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ message: "Server error" })
        }

        if (!user) {
            return res.status(403).json({ message: "Invalid account" })
        }

        let tokenData = { _id: user._id, username: user.username };

        jwt.sign(tokenData, "secret", { expiresIn: "1d" }, (err, token) => {
            if (err) {
                return res.status(500).json({ message: "Server error" })
            }

            var message = {
                id: user._id,
                email: 'null',
                username: user.username,
                password: 'null',
                token: token
            }
            console.log(message)
            res.status(200).json({ status: true, msg: "Login successed!", data: message });

        })

    })(req, res, next);
}
