const Contact = require('../../../models/web-admin/contact.model');

exports.postContact = (req, res) => {
    let contact = new Contact({
        name: req.body.name,
        subject: req.body.subject,
        email: req.body.email,
        message: req.body.message
    });

    contact.save()
    .then(() => {
        res.json({
            message: 'Success'
        });
    });
}