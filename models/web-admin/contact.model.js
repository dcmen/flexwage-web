const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: { type: String, required: true },
    subject: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    create_time : { type : Date, default: Date.now }
});

module.exports = mongoose.model('Contact', schema);
