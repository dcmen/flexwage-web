const Banner = require('../../models/web-admin/banner.model');
const Helper = require('../../helpers/helper');
const fs = require('fs');

exports.getBanners = (req, res) => {
  Banner.find()
  .then(result => {
    res.render('banner/table-banner', {
      title: 'Banner management',
      data: result,
      pageName: 'banner-management',
      csrfToken: req.csrfToken()
    });
  })
  .catch(err => console.log(err));
}

exports.getAddBanner = (req, res) => {
  let messages = req.flash('errors');
  res.render('banner/add-banner', {
    title: 'Add New Banner',
    messages: messages,
    pageName: 'banner-management',
    csrfToken: req.csrfToken()
  });
}

exports.postAddBanner = (req, res) => {
  let checkFileImage = Helper.readFileSize(req, 539, 626);
  checkFileImage.then(result => {
    if (result) {
      let banner = new Banner({
        imagePath: '/uploads/' + req.file.filename,
        title: req.body.title,
        description: req.body.description,
        linkButton1: req.body.linkButton1 === '' ? '#' : req.body.linkButton1,
        linkButton2: req.body.linkButton2 === '' ? '#' : req.body.linkButton2,
        status: req.body.status
      });
      banner.save()
      .then(() => res.redirect('/admin/banner-management'));
    } else {
      req.flash('errors', 'Invalid Image. Please upload file image has width = 539px and height = 626px');
      if (req.file.path) {
        fs.unlinkSync(req.file.path, (err) => {
          if (err) console.log("Couldn't delete" + req.file.path + "image");
        });
      }
      res.redirect('/admin/add-banner');
    }
  })
  .catch(err => console.log(err));
}

exports.getEditBanner = (req, res) => {
  let messages = req.flash('errors');
  const bannerId = req.params.id;

  Banner.findOne({ _id: bannerId })
    .then(banner => {
      res.render('banner/edit-banner', {
        title: 'Edit Banner',
        banner: banner,
        messages: messages,
        pageName: 'banner-management',
        csrfToken: req.csrfToken()
      });
    })
    .catch(err => console.log(err));
}

exports.postEditBanner = (req, res) => {
  const bannerId = req.params.id;

  Banner.findOne({ _id: bannerId })
  .then(banner => {
    //Check file upload
    if (req.file === undefined) {
      banner.imagePath = banner.imagePath;
      banner.title = req.body.title !== null ? req.body.title : banner.title;
      banner.description = req.body.description !== null ? req.body.description : banner.description;
      banner.linkButton1 = req.body.linkButton1 !== null ? req.body.linkButton1 : banner.linkButton1;
      banner.linkButton2 = req.body.linkButton2 !== null ? req.body.linkButton2 : banner.linkButton2;
      banner.status = req.body.status !== null ? req.body.status : banner.status;
  
      banner.save()
      .then(() => res.redirect('/admin/banner-management'));
    }
    else {
      let checkFileImage = Helper.readFileSize(req, 539, 626);
      checkFileImage.then(result => {
        if (result) {
          //Delete file if upload new file
          // let path = banner.imagePath.split('/');
          // let filePath = './public/uploads/' + path[path.length - 1];
          // fs.unlinkSync(filePath, (err) => {
          //   if (err) console.log("Couldn't delete" + banner.imagePath + "image");
          // });

          banner.imagePath ='/uploads/' + req.file.filename;
          banner.title = req.body.title !== null ? req.body.title : banner.title;
          banner.description = req.body.description !== null ? req.body.description : banner.description;
          banner.linkButton1 = req.body.linkButton1 !== null ? req.body.linkButton1 : banner.linkButton1;
          banner.linkButton2 = req.body.linkButton2 !== null ? req.body.linkButton2 : banner.linkButton2;
          banner.status = req.body.status !== null ? req.body.status : banner.status;
      
          banner.save()
          .then(() => res.redirect('/admin/banner-management'));
        } else {
          req.flash('errors', 'Invalid Image. Please upload file image has width = 539px and height = 626px');
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
}

exports.getDeleteBanner = (req, res) => {
  const bannerId = req.params.id;
  Banner.findOneAndDelete({ _id: bannerId })
  .then(banner => {
    let path = banner.imagePath.split('/');
    let filePath = './public/uploads/' + path[path.length - 1];
    fs.unlinkSync(filePath, (err) => {
      if (err) console.log("Couldn't delete" + banner.imagePath + "image");
    });
    res.redirect('/admin/banner-management');
  });
}
