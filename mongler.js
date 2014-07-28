'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autoInc = require('mongoose-auto-increment');

if (process.env.VCAP_SERVICES) {
   var env = JSON.parse(process.env.VCAP_SERVICES);
   var mongo = env['mongodb-2.2'][0].credentials;
} else {
   var mongo = {
      "username": "admin",
      "password": "1494",
      "url": "mongodb://localhost:27017/eidolon"
   }
}

// mongoose.connect(mongo.url);
var connection = mongoose.createConnection(mongo.url);
autoInc.initialize(connection);

var userSchema = mongoose.Schema({
  id:      { type: Schema.Types.ObjectId },
  userid:   { type: Number },
  name:     { type: String },
  email:    { type: String },
  password: { type: String },
  date_add: { type: Date, "default": Date.now },
  active:   { type: Boolean, "default": true }
});

userSchema.plugin(autoInc.plugin, { model: 'User', field: 'userid' });
var User = connection.model('User', userSchema);

exports.findAllUsers = function(req, res, next) {
   return User.find({}, function(err, users) {
      if (err) {
         res.send(500, err);
      }
      res.send(200, users);
      return next();
   });
};

exports.addUser = function(req, res, next) {
   var user;
   user = new User();
   user.name = req.params.name;
   user.email = req.params.email;
   user.password = req.params.password;
   return user.save(function(err, newuser) {
      if (err) {
         res.send(500, err);
      }
      res.send(201, newuser);
      return next();
   });
};

exports.findUser = function(req, res, next) {
   return User.findOne({ userid: req.params.userid }, function(err, user) {
      if (err) {
         res.send(500, err);
      }
      res.send(200, user);
      return next();
   });
};

exports.updateUser = function(req, res, next) {
   return User.findOne({ userid: req.params.userid }, function(err, user) {
      if (err) {
         res.send(500, err);
      }
      if (req.params.name != null) {
         user.name = req.params.name;
      }
      if (req.params.email != null) {
         user.email = req.params.email;
      }
      if (req.params.password != null) {
         user.password = req.params.password;
      }
      if (req.params.active != null) {
         user.active = req.params.active;
      }
      user.save();
      res.send(204, user);
      return next();
   });
};

exports.deleteUser = function(req, res, next) {
   return User.findOne({ userid: req.params.userid }, function(err, user) {
      if (err) {
         res.send(500, err);
      }
      user.remove();
      res.send(204);
      return next();
   });
};

exports.deleteAll = function(req, res, next) {
   return User.find({}, function(err, users) {
      if (err) {
         res.send(500, err);
      }
      users.forEach(function(user) {
         user.remove();
      });
      User.resetCount(function(err, next) {

      });
      res.send(204);
      return next();
   });
};