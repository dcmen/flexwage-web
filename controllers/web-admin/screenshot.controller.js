const Screenshot = require('../../models/web-admin/screenshot.model');
const Header = require('../../models/web-admin/heading.model');
const Helper = require('../../helpers/helper');
const fs = require('fs');

exports.getScreenshot = async (req, res) => {
  let screenshot = await Screenshot.find();
  let header = await Header.find({ code: 'header-screenshots' });
  res.render('screenshot/table-screenshot', {
    title: 'Screenshot management',
    data: screenshot,
    header: header,
    pageName: 'screenshot-management',
    csrfToken: req.csrfToken()
  });
};

exports.postUpdateHeader = (req, res) => {
  Helper.updateHeader(req, 'header-screenshots');
  res.redirect('/admin/screenshot-management');
}

exports.getAddScreenshot = (req, res) => {
  let messages = req.flash('errors');
  res.render('screenshot/add-screenshot', {
    title: 'Add Screenshot',
    messages: messages,
    pageName: 'screenshot-management',
    csrfToken: req.csrfToken()
  })
};

exports.postAddScreenshot = (req, res) => {
  let checkFileImage = Helper.readFileSize(req, 442, 892);
  checkFileImage.then(result => {
    if (result) {
      let screenshot = new Screenshot({
        imagePath: '/uploads/' + req.file.filename,
        status: req.body.status
      });
      screenshot.save()
      .then(() => res.redirect('/admin/screenshot-management'));
    } else {
      req.flash('errors', 'Invalid Image. Please upload file image has width = 442px and height = 892px');
      if (req.file.path) {
        fs.unlinkSync(req.file.path, (err) => {
          if (err) console.log("Couldn't delete" + req.file.path + "image");
        });
      }
      res.redirect('/admin/add-screenshot');
    }
  })
  .catch(err => console.log(err));
};

exports.getEditScreenshot = (req, res) => {
  let messages = req.flash('errors');
  const screenshotId = req.params.id;
  Screenshot.findOne({ _id: screenshotId })
  .then(screenshot => {
    res.render('screenshot/edit-screenshot', {
      title: 'Edit Screenshot',
      screenshot: screenshot,
      messages: messages,
      pageName: 'screenshot-management',
      csrfToken: req.csrfToken()
    });
  })
  .catch(err => console.log(err));
};

exports.postEditScreenshot = (req, res) => {
  const screenshotId = req.params.id;
  Screenshot.findOne({ _id: screenshotId })
  .then(screenshot => {
    if (req.file === undefined){
      screenshot.imagePath = screenshot.imagePath;
      screenshot.status    = req.body.status !== null ? req.body.status : screenshot.status;

      screenshot.save()
      .then(() => res.redirect('/admin/screenshot-management'));
    } else {
      let checkFileImage = Helper.readFileSize(req, 442, 892);
      checkFileImage.then(result => {
        if (result) {
          // let path = screenshot.imagePath.split('/');
          // let filePath = './public/uploads/' + path[path.length - 1];
          // fs.unlinkSync(filePath, (err) => {
          //   if (err) console.log("Couldn't delete" + screenshot.imagePath + "image");
          // });

          screenshot.imagePath = '/uploads/' + req.file.filename;
          screenshot.status = req.body.status !== null ? req.body.status : screenshot.status;
          
          screenshot.save()
          .then(() => res.redirect('/admin/screenshot-management'));
        } else {
          req.flash('errors', 'Invalid Image. Please upload file image has width = 442px and height = 892px');
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

exports.getDeleteScreenshot = (req, res) => {
  const screenshotId = req.params.id;
  Screenshot.findByIdAndRemove(screenshotId)
  .then(screenshot => {
    let path = screenshot.imagePath.split('/');
    let filePath = './public/uploads/' + path[path.length - 1];
    fs.unlinkSync(filePath, (err) => {
      if (err) console.log("Couldn't delete" + team.imagePath + "image");
    });
    res.redirect('/admin/screenshot-management');
  })
  .catch(err => console.log(err));
};
