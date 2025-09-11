var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FeedbackSchema = new Schema({
    company_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    staff_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    mobile: {
        type: String
    },
    message: {
        type: String
    },
    date: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
