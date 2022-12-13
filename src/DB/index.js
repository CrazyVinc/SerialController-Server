var { startupController } = require("../startupController.js");
var { models, sequelize } = require("./models");

startupController.addProcess("Database");

(async () => {
	try {
		//TODO: Switch to migration system
		await sequelize.sync({alter: true});
		console.log("Database initializing 90%");
		//? Used for relations.
		console.log("DB ready");
		startupController.complete("Database");
	} catch (error) {
		console.error(error, 578);
	}
})();


function updateOrInsert(model, values, condition, paranoid = true) { // Update Or Create
    return model
        .findOne({ where: condition, paranoid: paranoid })
        .then(function(obj) {
            if(obj) {
				model.update(values, { where: condition, paranoid: paranoid, returning: true }); // Update
				return model.findOne({ where: condition, paranoid: paranoid })
			}
            return model.create(values); // insert
        });
}


module.exports = {
	sequelize, updateOrInsert,
	DB: models
}