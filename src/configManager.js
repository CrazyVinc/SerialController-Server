var fs = require('fs');
var convictOld = require('convict');

class convict extends convictOld {
    constructor(schema, file) {
        schema = super(schema);
        this.schema = schema;
        this.file = file;

        if (fs.existsSync(`./config/${this.file}`)) {
            schema.loadFile(`./config/${this.file}`);
        } else {
            if(!fs.existsSync("./config")) fs.mkdirSync("./config");
            this.save(file);
        }
    }
    save = (file = this.file) => fs.promises.writeFile(
        `./config/${file}`, JSON.stringify(this.schema.get(), null, 2), 'utf8'
    );
}



// Main config
var config = new convict({
    maintenance: {
        doc: 'Enable / Disable maintenance',
        format: Boolean,
        env: "maintenance",
        default: true
    }
}, "default.json");

module.exports = { convict, config };