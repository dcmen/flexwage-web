const mongoose = require('mongoose')

const employer_terms = new mongoose.Schema(
    {
        valid_parameter: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model("Employer_Terms", employer_terms)