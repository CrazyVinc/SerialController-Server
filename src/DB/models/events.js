const { Sequelize, DataTypes } = require("sequelize");

/**
 * @param {Sequelize} sequelize 
 * @param {DataTypes} DataTypes
 */
module.exports = function(sequelize, DataTypes) {
  const options = {
    tableName: "Events"
  };
  return sequelize.define("Events", {
    ID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: true,
    },
    trigger: {
      type: DataTypes.STRING,
      allowNull: false
    },
    triggerDevice: {
      type: DataTypes.ENUM,
      values: ['client', 'thirdparty', 'WebPanel', 'internal'],
      Comment: "The trigger type",
      allowNull: false
    },
    triggerTarget: {
      type: DataTypes.STRING,
      Comment: "The name of the device that can trigger this event.",
      allowNull: true
    },
    onTrigger: {
      type: DataTypes.STRING(),
      Comment: "Command that is executed on trigger.",
      allowNull: false
    },
    targetType: {
      type: DataTypes.ENUM,
      values: ['client', 'thirdparty', 'WebPanel', 'all'],
      Comment: "The type of the target to run the command.",
      allowNull: false
    },
    target: {
      type: DataTypes.STRING(),
      Comment: "The name of the target.",
      allowNull: false
    },
    enabled: {
      type: DataTypes.BOOLEAN(),
      defaultValue: false,
      allowNull: true
    },
    lastResult: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    lastExecuted: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, options);
};