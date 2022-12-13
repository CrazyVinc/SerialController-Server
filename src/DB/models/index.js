'use strict';
const { Sequelize } = require('sequelize');
var initModels = require("./init-models");

const options = {
	dialect: 'mariadb',
	define: { underscoredAll: true },
	logging: false,
	retry: { max: 3 }
}


const sequelize = new Sequelize(process.env.DB_database, process.env.DB_user, process.env.DB_password, {
	host: process.env.DB_host,
	pool: {
		max: 15,
		acquire: 30 * 1000,
		idle: 10 * 1000
	},
	...options
});

var models = initModels(sequelize);


module.exports = {
	sequelize,
	models
};