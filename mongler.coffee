mongoose = require 'mongoose'
Schema = mongoose.Schema
autoInc = require 'mongoose-auto-increment'

if process.env.VCAP_SERVICES
    env = JSON.parse process.env.VCAP_SERVICES
    mongo = env['mongodb-2.2'][0].credentials
else
    mongo =
        "username": "admin",
        "password": "1494",
        "url": "mongodb://localhost:27017/eidolon"

connection = mongoose.createConnection mongo.url
autoInc.initialize connection

userSchema = mongoose.Schema
    id:       { type: Schema.Types.ObjectId },
    userid:   { type: Number },
    fullname: { type: String },
    username: { type: String },
    email:    { type: String },
    password: { type: String },
    date_add: { type: Date, default: Date.now },
    active:   { type: Boolean, default: true }

userSchema.plugin autoInc.plugin, { model: 'User', field: 'userid' }
User = connection.model 'User', userSchema

exports.findAllUsers = (req, res, next) ->
    return User.find {}, (err, users) ->
        res.send 500, err if err
        res.send 200, users
        return next()

exports.addUser = (req, res, next) ->
    user = new User()

    if req.body instanceof Object
        content = req.body
    else
        content = JSON.parse req.body

    user.fullname = content.fullname
    user.username = content.username
    user.email = content.email
    user.password = content.password
    user.active = content.active

    return user.save (err, newuser) ->
        res.send 500, err if err
        res.send 201, newuser
        return next()

exports.findUser = (req, res, next) ->
    return User.findOne { userid: req.params.userid }, (err, user) ->
        res.send 500, err if err
        if user
            res.send 200, user
        else
            res.send 404
        return next()

exports.updateUser = (req, res, next) ->
    return User.findOne { userid: req.params.userid }, (err, user) ->
        res.send 500, err if err
        res.send 404 if not user 

        if req.body instanceof Object
            content = req.body
        else
            content = JSON.parse req.body

        user.fullname = content.fullname if content.fullname?
        user.username = content.username if content.username?
        user.email = content.email if content.email?
        user.password = content.password if content.password?
        user.active = content.active if content.active?

        user.save()
        res.send 202, user
        return next()

exports.deleteUser = (req, res, next) ->
    return User.findOne { userid: req.params.userid }, (err, user) ->
        res.send 500, err if err
        res.send 404 if not user
        user.remove()
        res.send 202
        return next()

exports.deleteAll = (req, res, next) ->
    return User.find {}, (err, users) ->
        res.send 500, err if err
        users.forEach (user) -> 
            user.remove()
            return
        User.resetCount (err, next) ->
        res.send 202
        return next()