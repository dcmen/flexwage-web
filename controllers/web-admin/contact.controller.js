const Contact = require('../../models/web-admin/contact.model');
const moment = require('moment');

exports.getContact = (req, res) => {
  Contact.find()
  .then(result => {
    res.render('contact/table-contact', {
      title: 'Contact Page',
      contact: result,
      moment: moment,
      pageName: 'contact-management',
      csrfToken: req.csrfToken()
    });
  })
  .catch(err => console.log(err));
}

exports.getWatchContact = async (req, res) => {
  const idContact = req.params.id;
  let contact = await Contact.findOne({ _id: idContact });
  res.render('contact/watch-contact', {
      title: 'Watch Contact',
      contact: contact,
      moment: moment,
      pageName: 'contact-management',
      csrfToken: req.csrfToken()
  });
}

exports.getDeleteContact = (req, res) => {
  const contactId = req.params.id;
  Contact.findByIdAndRemove(contactId)
  .then(() => res.redirect('/admin/contact-management'))
  .catch(err => console.log(err));
};
