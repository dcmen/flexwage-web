var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StaffSchema = new Schema({
    company_id: {
        type: Schema.Types.ObjectId
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String
    },
    fullname: {
        type: String
    },
    email: {
        type: String
    },
    
    mobile: {
        type: String
    },

    //Salary:1, Timesheet/Wage: 2, 3: Both
    salary_wag: {
        type: Schema.Types.Number, 
        default: 1
    },
    start_date: {
        type: String
    },
    system_user_id : {
        type: String
    },
    system_employee_id : {
        type: String
    },
    created_date: {
        type: Date,
        default: new Date()
    },
    //KeyPay system
    automatically_pay_employee : {
        type: String
    },
    keypay_primary_pay_category : {
        type: String
    },
    keypay_pay_schedule_id:  {
        type: Schema.Types.ObjectId
    },
    keypay_pay_schedule: mongoose.model('Keypay_Pay_Schedule').schema,
    //is State
    suburb: {
        type: String
    },
    key_pay_work_types: {
        type: String
    },
    keypay_location_ids: {
        type : [ Schema.Types.ObjectId ],
        default: []
    }
});

module.exports = mongoose.model('Unregistered_Staff', StaffSchema);
