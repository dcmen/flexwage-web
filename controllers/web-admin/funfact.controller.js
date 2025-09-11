const Funfact = require('../../models/web-admin/funfact.model');
const Header = require('../../models/web-admin/heading.model');
const Helper = require('../../helpers/helper');

exports.getFunfact = async (req, res) => {
  let header = await Header.find({
    code: 'header-funfact'
  });
  Funfact.find()
  .then(funfact => {
    res.render('funfact/table-funfact', {
      title: 'Funfact management',
      data: funfact,
      header: header,
      pageName: 'funfact-management',
      csrfToken: req.csrfToken()
    });
  });
};

exports.postUpdateHeader = (req, res) => {
  Helper.updateHeader(req, 'header-funfact');
  res.redirect('/admin/funfact-management');
}

exports.getAddFunfact = (req, res) => {
  res.render('funfact/add-funfact', {
    title: 'Add New Funfact',
    pageName: 'funfact-management',
    csrfToken: req.csrfToken()
  });
};

exports.postAddFunfact = (req, res) => {
  let funfact = new Funfact({
    iconClass: req.body.iconClass,
    title: req.body.title,
    countNum: req.body.countNum,
    status: req.body.status
  });
  funfact.save()
  .then(() => res.redirect('/admin/funfact-management'));
};

exports.getEditFunfact = (req, res) => {
  const funfactId = req.params.id;
  Funfact.findOne({ _id: funfactId })
  .then(funfact => {
    res.render('funfact/edit-funfact', {
      title: 'Edit Funfact',
      funfact: funfact,
      pageName: 'funfact-management',
      csrfToken: req.csrfToken()
    });
  })
  .catch(err => console.log(err));
};

exports.postEditFunfact = (req, res) => {
  const funfactId = req.params.id;
  Funfact.findOne({ _id: funfactId })
  .then(funfact => {
    funfact.iconClass = req.body.iconClass !== null ? req.body.iconClass : funfact.iconClass;
    funfact.title = req.body.title !== null ? req.body.title : funfact.title;
    funfact.countNum = req.body.countNum !== null ? req.body.countNum : funfact.countNum;
    funfact.status = req.body.status !== null ? req.body.status : funfact.status;

    funfact.save()
    .then(() => res.redirect('/admin/funfact-management'));
  });
};

exports.getDeleteFunfact = (req, res) => {
  const funfactId = req.params.id;
  Funfact.findByIdAndRemove(funfactId)
  .then(() => res.redirect('/admin/funfact-management'))
  .catch(err => console.log(err));
};
