var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SystemSchema = new Schema({
    system_name: {
        type: String,
        required: true
    },
    code: {
        type: String
    },
    code_number: {
        type: String
    },
    version: {
        type: String
    },
    client_id: {
        type: String
    },
    client_secret: {
        type: String
    },
    created_date: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('System', SystemSchema);
