var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ErrorCodeSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    error_code: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('Error_Code', ErrorCodeSchema);