const Faq = require('../../models/web-admin/faq.model');
const Header = require('../../models/web-admin/heading.model');
const Helper = require('../../helpers/helper');
const fs = require('fs');

exports.getFaq = async (req, res) => {
  let faqs = await Faq.find({ code: 'faq-area' });
  let header = await Header.findOne({ code: 'header-faq'});
  let messages = req.flash('errors');
  console.log("faqs test changes",faqs)
  res.render('faq/table-faq', {
    title: 'Faq management',
    data: faqs,
    header: header,
    messages: messages,
    pageName: 'faq-management',
    csrfToken: req.csrfToken()
  });
}

exports.postUpdateHeader = (req, res) => {
  if (req.file === undefined) {
    Helper.updateHeader(req, 'header-faq');
    res.redirect('/admin/faq-management');
  } else {
    let checkFileImage = Helper.readFileSize(req, 586, 488);
    checkFileImage
      .then(result => {
        if (result) {
          Helper.updateHeader(req, 'header-faq');
          res.redirect('/admin/faq-management');
        } else {
          req.flash('errors', 'Invalid Image. Please upload file image has width = 586px and height = 488px');
          if (req.file.path) {
            fs.unlinkSync(req.file.path, (err) => {
              if (err) console.log("Couldn't delete" + req.file.path + "image");
            });
          }
          res.redirect('/admin/faq-management');
        }
      })
      .catch(err => console.log(err));
  }
}

exports.getAddFaq = (req, res) => {
  res.render('faq/add-faq', { 
    title: 'Add New Faq',
    pageName: 'faq-management',
    csrfToken: req.csrfToken()
  });
}

exports.postAddFaq = (req, res) => {
    let faq = new Faq({
      answer: req.body.answer,
      question: req.body.question,
      status: req.body.status,
      code: 'faq-area'
    });
    faq.save()
    .then(() => res.redirect('/admin/faq-management'));
}


exports.getEditFaq = (req, res) => {
  const faqId = req.params.id;
  Faq.findOne({ _id: faqId })
  .then(faq => {
    res.render('faq/edit-faq', {
      title: 'Edit Faq',
      faq: faq,
      pageName: 'faq-management',
      csrfToken: req.csrfToken()
    });
  })
  .catch(err => console.log(err));
}

exports.postEditFaq = (req, res) => {
  const faqId = req.params.id;
  Faq.findOne({ _id: faqId })
  .then(faq => {
    if (req.file === undefined)
        faq.imagePath = faq.imagePath;
      else {
        //Delete file if upload new file
        // let filePath = './public/uploads/' + faq.imagePath;
        // fs.unlinkSync(filePath, (err) => {
        //   if (err) console.log("Couldn't delete" + faq.imagePath + "image");
        // });
        faq.imagePath = req.file.filename;
      }

      faq.question = req.body.question !== null ? req.body.question: faq.question;
      faq.answer = req.body.answer !== null ? req.body.answer : faq.answer;
      faq.code = 'faq-area';
      faq.status = req.body.status !== null ? req.body.status : faq.status;

      faq.save();
  })
  .then(() => res.redirect('/admin/faq-management'))
  .catch(err => console.log(err));
}
exports.getDeleteFaq = (req, res) => {
  const faqId = req.params.id;
  Faq.findByIdAndRemove({ _id: faqId })
  .then(() => res.redirect('/admin/faq-management'))
  .catch(err => console.log(err));
}
