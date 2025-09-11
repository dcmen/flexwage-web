const Feature = require('../../models/web-admin/feature.model');
const Header = require('../../models/web-admin/heading.model');
const Helper = require('../../helpers/helper');
const fs = require('fs');

exports.getFeatures = async (req, res) => {
  let features = await Feature.find({
    code: 'feature-area'
  });
  let header = await Header.findOne({
    code: 'header-features'
  });
  res.render('feature/table-feature', {
    title: 'Feature Management',
    data: features,
    header: header,
    pageName: 'feature-management',
    csrfToken: req.csrfToken()
  });
}

exports.postUpdateHeader = (req, res) => {
  Helper.updateHeader(req, 'header-features');
  res.redirect('/admin/feature-management');
}

exports.getAddFeature = (req, res) => {
  let messages = req.flash('errors');
  res.render('feature/add-feature', {
    title: 'Add New Feature',
    messages: messages,
    pageName: 'feature-management',
    csrfToken: req.csrfToken()
  });
}

exports.postAddFeature = (req, res) => {
  let checkFileImage = Helper.readFileSize(req, 40, 47);
  checkFileImage.then(result => {
      if (result) {
        let feature = new Feature({
          imagePath: '/uploads/' + req.file.filename,
          title: req.body.title,
          description: req.body.description,
          status: req.body.status,
          code: 'feature-area'
        });

        feature.save()
          .then(() => res.redirect('/admin/feature-management'));
      } else {
        req.flash('errors', 'Invalid Image. Please upload file image has width = 40px and height = 47px');
        if (req.file.path) {
          fs.unlinkSync(req.file.path, (err) => {
            if (err) console.log("Couldn't delete" + req.file.path + "image");
          });
        }
        res.redirect('/admin/add-feature');
      }
    })
    .catch(err => console.error(err));
}

exports.getEditFeature = (req, res) => {
  let messages = req.flash('errors');
  const featureId = req.params.id;
  Feature.findOne({
      _id: featureId
    })
    .then(feature => {
      res.render('feature/edit-feature', {
        title: 'Edit Feature',
        feature: feature,
        messages: messages,
        pageName: 'feature-management',
        csrfToken: req.csrfToken()
      });
    })
    .catch(err => console.log(err));
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
        feature.code = 'feature-area';
        feature.status = req.body.status !== null ? req.body.status : feature.status;
        feature.save()
          .then(() => res.redirect('/admin/feature-management'));
      } else {
        let checkFileImage = Helper.readFileSize(req, 40, 47);
        checkFileImage.then(result => {
            if (result) {
              //Delete file if upload new file
              let path = feature.imagePath.split('/');
              let filePath = './public/uploads/' + path[path.length - 1];
              fs.unlinkSync(filePath, (err) => {
                if (err) console.log("Couldn't delete" + feature.imagePath + "image");
              });

              feature.imagePath =  '/uploads/' + req.file.filename;
              feature.title = req.body.title !== null ? req.body.title : feature.title;
              feature.description = req.body.description !== null ? req.body.description : feature.description;
              feature.code = 'feature-area';
              feature.status = req.body.status !== null ? req.body.status : feature.status;
              feature.save()
                .then(() => res.redirect('/admin/feature-management'));
            } else {
              if (req.file !== undefined) {
                req.flash('errors', 'Invalid Image. Please upload file image has width = 40px and height = 47px');
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
  Feature.findOneAndDelete({
      _id: featureId
    })
    .then(feature => {
      let path = feature.imagePath.split('/');
      let filePath = './public/uploads/' + path[path.length - 1];
      fs.unlinkSync(filePath, (err) => {
        if (err) console.log("Couldn't delete" + feature.imagePath + "image");
      });
      res.redirect('/admin/feature-management');
    })
    .catch(err => console.log(err));
}