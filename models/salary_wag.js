var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SalaryWagchema = new Schema({
    type: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    created_date: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('Salary_Wag', SalaryWagchema);
