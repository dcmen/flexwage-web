const Config = require('../../models/web-admin/config.model');

exports.getConfig = (req, res) => {
  Config.findOne()
  .then(result => {
    res.render('configs/configPage', {
      title: 'Config Page',
      data: result,
      pageName: 'config-management',
      csrfToken: req.csrfToken()
    });
  })
  .catch(err => console.log(err));
}

exports.postConfig = (req, res) => {
  Config.findOne({ _id: req.params.id })
    .then(config => {
      config.information[0].address = req.body.address !== null ? req.body.address : config.information[0].address;
      config.information[0].phone = req.body.phone !== null ? req.body.phone : config.information[0].phone;
      config.information[0].email = req.body.email !== null ? req.body.email : config.information[0].email;
      config.information[0].website = req.body.website !== null ? req.body.website : config.information[0].website;

      config.social[0].facebook = req.body.facebook !== null ? req.body.facebook : config.social[0].facebook;
      config.social[0].google = req.body.google !== null ? req.body.google : config.social[0].google;
      config.social[0].twitter = req.body.twitter !== null ? req.body.twitter : config.social[0].twitter;
      config.social[0].instagram = req.body.instagram !== null ? req.body.instagram : config.social[0].instagram;

      config.seo[0].title = req.body.title !== null ? req.body.title : config.seo.title;
      config.seo[0].keyword = req.body.keyword !== null ? req.body.keyword : config.seo[0].keyword;
      config.seo[0].content = req.body.content !== null ? req.body.content : config.seo[0].content;

      config.map[0].longtitude = req.body.longtitude !== null ? req.body.longtitude : config.map[0].longtitude;
      config.map[0].latitude = req.body.latitude !== null ? req.body.latitude : config.map[0].latitude;
      
      config.save()
      .then(() => res.redirect('/admin/config-page'));
    })
    .catch(err => console.log(err));;
}
