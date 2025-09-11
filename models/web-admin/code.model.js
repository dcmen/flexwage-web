const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    code: {
        type: String
    },
    status: {
        type: String,
        default: 0
    },
    client_id: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

module.exports = mongoose.model('Code', schema);