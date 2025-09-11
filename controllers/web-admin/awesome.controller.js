const Feature = require('../../models/web-admin/feature.model');
const Helper = require('../../helpers/helper');
const Header = require('../../models/web-admin/heading.model');

exports.getFeatures = async (req, res) => {
  let features = await Feature.find({ code: 'awesome-area' });
  let header = await Header.findOne({ code: 'header-awesomes'});
  res.render('awesome/table-awesome', {
    title: 'Awesomes management',
    data: features,
    header: header,
    pageName: 'awesome-management',
    csrfToken: req.csrfToken()
  });
}

exports.postUpdateHeader = (req, res) => {
  Helper.updateHeader(req, 'header-awesomes');
  res.redirect('/admin/awesome-management');
}

exports.getAddFeature = (req, res) => {
  res.render('awesome/add-feature', {
    title: 'Add New Feature',
    pageName: 'awesome-management',
    csrfToken: req.csrfToken()
  });
}

exports.postAddFeature = (req, res) => {
  let feature = new Feature({
    imagePath: req.body.imagePath,
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    code: 'awesome-area'
  });

  feature.save();
  res.redirect('/admin/awesome-management');
}

exports.getEditFeature = (req, res) => {
  const featureId = req.params.id;
  Feature.findOne({ _id: featureId })
  .then(feature => {
    res.render('awesome/edit-feature', {
      title: 'Edit Feature',
      feature: feature,
      pageName: 'awesome-management',
      csrfToken: req.csrfToken()
    });
  })
  .catch(err => console.log(err));
}

exports.postEditFeature = (req, res) => {
  const featureId = req.params.id;
  Feature.findOne({ _id: featureId })
  .then(feature => {
    feature.imagePath = req.body.imagePath !== null ? req.body.imagePath : feature.imagePath;
    feature.title = req.body.title !== null ? req.body.title : feature.title;
    feature.description = req.body.description !== null ? req.body.description : feature.description;
    feature.code = 'awesome-area';
    feature.status = req.body.status !== null ? req.body.status : feature.status;
    feature.save();
  })
  .then(result => res.redirect('/admin/awesome-management'))
  .catch(err => console.log(err));
}

exports.getDeleteFeature = (req, res, next) => {
  const featureId = req.params.id;
  Feature.findByIdAndRemove({ _id:featureId })
    .then(faqs => res.redirect('/admin/awesome-management'))
    .catch(err => console.log(err));
}
