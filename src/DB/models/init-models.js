const { DataTypes } = require('sequelize');

var _Users = require("./Users");
var _events = require("./events.js");

function initModels(sequelize) {
  var Users = _Users(sequelize, DataTypes);
  var events = _events(sequelize, DataTypes);
  
  return {
    Users,
    events
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
