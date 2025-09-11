const Feature = require('../../models/web-admin/feature.model');
const Helper = require('../../helpers/helper');
const Header = require('../../models/web-admin/heading.model');
const fs = require('fs');

exports.getFeatures = async (req, res) => {
  let features = await Feature.find({
    code: 'hiw-area'
  });
  let header = await Header.findOne({
    code: 'header-hiw'
  });
  let messages = req.flash('errors');
  res.render('hiw/table-hiw', {
    title: 'How It Work management',
    data: features,
    header: header,
    messages: messages,
    pageName: 'hiw-management',
    csrfToken: req.csrfToken()
  });
}

exports.postUpdateHeader = (req, res) => {
  if (req.file === undefined) {
    Helper.updateHeader(req, 'header-hiw');
    res.redirect('/admin/hiw-management');
  } else {
    let checkFileImage = Helper.readFileSize(req, 432, 415);
    checkFileImage
      .then(result => {
        if (result) {
          Helper.updateHeader(req, 'header-hiw');
          res.redirect('/admin/hiw-management');
        } else {
          req.flash('errors', 'Invalid Image. Please upload file image has width = 432px and height = 415px');
          if (req.file.path) {
            fs.unlinkSync(req.file.path, (err) => {
              if (err) console.log("Couldn't delete" + req.file.path + "image");
            });
          }
          res.redirect('/admin/hiw-management');
        }
      })
      .catch(err => console.log(err));
  }
}

exports.getAddFeature = (req, res) => {
  let messages = req.flash('errors');
  res.render('hiw/add-feature', {
    title: 'Add New Feature',
    messages: messages,
    pageName: 'hiw-management',
    csrfToken: req.csrfToken()
  });
}

exports.postAddFeature = (req, res) => {
  let checkFileImage = Helper.readFileSize(req, 40, 48);
  checkFileImage.then(result => {
      if (result) {
        let feature = new Feature({
          imagePath:  '/uploads/' + req.file.filename,
          title: req.body.title,
          description: req.body.description,
          status: req.body.status,
          code: 'hiw-area'
        });

        feature.save()
          .then(() => res.redirect('/admin/hiw-management'));
      } else {
        req.flash('errors', 'Invalid Image. Please upload file image has width = 40px and height = 48px');
        if (req.file.path) {
          fs.unlinkSync(req.file.path, (err) => {
            if (err) console.log("Couldn't delete" + req.file.path + "image");
          });
        }
        res.redirect('/admin/hiw-add-feature');
      }
    })
    .catch(err => console.log(err));
}

exports.getEditFeature = async (req, res) => {
  let features = await Feature.find({
    code: 'hiw-area'
  });
  let messages = req.flash('errors');
  const featureId = req.params.id;
  Feature.findOne({
      _id: featureId
    })
    .then(feature => {
      res.render('hiw/edit-feature', {
        title: 'Edit Feature',
        data: features,
        feature: feature,
        messages: messages,
        pageName: 'hiw-management',
        csrfToken: req.csrfToken()
      });
    });
}

exports.postEditFeature = (req, res) => {
  const featureId = req.params.id;
  Feature.findOne({
      _id: featureId
    })
    .then(feature => {
      if (req.file === undefined) {
        feature.imagePath = feature.imagePath;
        feature.title = req.body.title !== null ? req.body.title : feature.title;
        feature.description = req.body.description !== null ? req.body.description : feature.description;
        feature.code = 'hiw-area';
        feature.status = req.body.status !== null ? req.body.status : feature.status;

        feature.save()
          .then(() => res.redirect('/admin/hiw-management'));
      } else {
        let checkFileImage = Helper.readFileSize(req, 43, 43);
        checkFileImage.then(result => {
            if (result) {
              //Delete file if upload new file
              // let path = feature.imagePath.split('/');
              // let filePath = './public/uploads/' + path[path.length - 1];
              // fs.unlinkSync(filePath, (err) => {
              //   if (err) console.log("Couldn't delete" + feature.imagePath + "image");
              // });

              feature.imagePath =  '/uploads/' + req.file.filename;
              feature.title = req.body.title !== null ? req.body.title : feature.title;
              feature.description = req.body.description !== null ? req.body.description : feature.description;
              feature.code = 'hiw-area';
              feature.status = req.body.status !== null ? req.body.status : feature.status;

              feature.save()
                .then(() => res.redirect('/admin/hiw-management'));
            } else {
              if (req.file !== undefined) {
                req.flash('errors', 'Invalid Image. Please upload file image has width = 43px and height = 43px');
                fs.unlinkSync(req.file.path, (err) => {
                  if (err) console.log("Couldn't delete" + req.file.path + "image");
                });
              }
              res.redirect('back');
            }
          })
          .catch(err => console.log(err));
      }
    })
    .catch(err => console.log(err));
}

exports.getDeleteFeature = (req, res) => {
  const featureId = req.params.id;
  Feature.findByIdAndRemove(featureId)
    .then(feature => {
      let path = feature.imagePath.split('/');
      let filePath = './public/uploads/' + path[path.length - 1];
      fs.unlinkSync(filePath, (err) => {
        if (err) console.log("Couldn't delete" + feature.imagePath + "image");
      });
      res.redirect('/admin/hiw-management');
    })
    .catch(err => console.log(err));
}