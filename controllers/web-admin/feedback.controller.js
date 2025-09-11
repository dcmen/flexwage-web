const Feedback = require('../../models/web-admin/feedback.model');
const Header = require('../../models/web-admin/heading.model');
const Helper = require('../../helpers/helper');
const fs = require("fs");

exports.getFeedback = async (req, res) => {
  let header = await Header.findOne({
    code: 'header-feedback'
  });
  Feedback.find()
  .then(result => {
    res.render('feedback/table-feedback', {
      title: 'Feedback Management',
      data: result,
      header: header,
      pageName: 'feedback-management',
      csrfToken: req.csrfToken()
    });
  });
};

exports.postUpdateHeader = (req, res) => {
  Helper.updateHeader(req, 'header-feedback');
  res.redirect('/admin/feedback-management');
}

exports.getAddFeedback = (req, res) => {
  let messages = req.flash('errors');
  res.render('feedback/add-feedback', {
    title: 'Add Feedback',
    pageName: 'feedback-management',
    messages: messages,
    csrfToken: req.csrfToken()
  })
};

exports.postAddFeedback = (req, res) => {
  let checkFileImage = Helper.readFileSize(req, 500, 500);
  checkFileImage.then(result => {
    if (result) {
      let feedback = new Feedback({
        imagePath: '/uploads/' + req.file.filename,
        name: req.body.name,
        occupations: req.body.occupations,
        content: req.body.content,
        status: req.body.status
      });
      feedback.save()
      .then(() => res.redirect('/admin/feedback-management'));
    }
    else {
      req.flash('errors', 'Invalid Image. Please upload file image has width = 500px and height = 500px');
      if (req.file.path) {
        fs.unlinkSync(req.file.path, (err) => {
          if (err) console.log("Couldn't delete" + req.file.path + "image");
        });
      }
      res.redirect('/admin/add-feedback');
    }
  })
  .catch(err => console.log(err));
};

exports.getEditFeedback = (req, res) => {
  const feedbackId = req.params.id;
  let messages = req.flash('errors');
  Feedback.findOne({ _id: feedbackId })
  .then(feedback => {
    res.render('feedback/edit-feedback', {
      title: 'Edit Feedback',
      feedback: feedback,
      pageName: 'feedback-management',
      messages: messages,
      csrfToken: req.csrfToken()
    });
  });
};

exports.postEditFeedback = (req, res, next) => {
  const feedbackId = req.params.id;

  Feedback.findOne({ _id: feedbackId })
  .then(feedback => {
    if (req.file === undefined){
      feedback.imagePath = feedback.imagePath;
      feedback.name = req.body.name !== null ? req.body.name : feedback.name;
      feedback.occupations = req.body.occupations !== null ? req.body.occupations : feedback.occupations;
      feedback.content = req.body.content !== null ? req.body.content : feedback.content;
      feedback.status = req.body.status !== null ? req.body.status : feedback.status;

      feedback.save()
      .then(() => res.redirect('/admin/feedback-management'));
    }
    else {
      let checkFileImage = Helper.readFileSize(req, 500, 500);
      checkFileImage.then(result => {
        if (result) {
          //Delete file if upload new file
          // let path = feedback.imagePath.split('/');
          // let filePath = './public/uploads/' + path[path.length - 1];
          // fs.unlinkSync(filePath, (err) => {
          //   if (err) console.log("Couldn't delete" + feedback.imagePath + "image");
          // });

          feedback.imagePath ='/uploads/' + req.file.filename;
          feedback.name = req.body.name !== null ? req.body.name : feedback.name;
          feedback.occupations = req.body.occupations !== null ? req.body.occupations : feedback.occupations;
          feedback.content = req.body.content !== null ? req.body.content : feedback.content;
          feedback.status = req.body.status !== null ? req.body.status : feedback.status;

          feedback.save()
          .then(() => res.redirect('/admin/feedback-management'));
        }
        else {
          req.flash('errors', 'Invalid Image. Please upload file image has width = 500px and height = 500px');
          fs.unlinkSync(req.file.path, (err) => {
            if (err) console.log("Couldn't delete" + req.file.path + "image");
          });
          res.redirect('back');
        }
      })
      .catch(err => console.log(err));
    }
  })
  .catch(err => console.log(err));
};

exports.getDeleteFeedback = (req, res, next) => {
  const feedbackId = req.params.id;
  Feedback.findByIdAndRemove(feedbackId, (err, feedback) => {
    if (err) console.log(err);
    let path = feedback.imagePath.split('/');
    let filePath = './public/uploads/' + path[path.length - 1];
    fs.unlinkSync(filePath, (err) => {
      if (err) console.log("Couldn't delete" + feedback.imagePath + "image");
    });
    res.redirect('/admin/feedback-management');
  });
};
