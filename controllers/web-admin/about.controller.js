const About = require('../../models/web-admin/about.model');
const Header = require('../../models/web-admin/heading.model');
const Helper = require('../../helpers/helper');
const fs = require('fs');

exports.getAbouts = async (req, res) => {
  let abouts = await About.findOne();
  let header = await Header.find({
    code: 'header-about'
  });
  let messages = req.flash('errors');
  res.render('about/table-about', {
    title: 'About management',
    about: abouts,
    header: header,
    messages: messages,
    pageName: 'about-management',
    csrfToken: req.csrfToken()
  });
}

exports.postUpdateHeader = (req, res) => {
  Helper.updateHeader(req, 'header-about');
  res.redirect('/admin/about-management');
}

exports.postEditAbout = (req, res) => {
  const aboutId = req.params.id;
  About.findOne({
      _id: aboutId
    })
    .then(about => {
      if (req.file === undefined) {
        about.imagePath = about.imagePath;
        about.title = req.body.title !== null ? req.body.title : about.title;
        about.description = req.body.description !== null ? req.body.description : about.description;
        about.linkButton1 = req.body.linkButton1 !== null ? req.body.linkButton1 : about.linkButton1;
        about.linkButton2 = req.body.linkButton2 !== null ? req.body.linkButton2 : about.linkButton2;

        about.save()
          .then(() => res.redirect('/admin/about-management'));
      } else {
        let checkFileImage = Helper.readFileSize(req, 526, 489);
        checkFileImage.then(result => {
            if (result) {
              //Delete file if upload new file
              // let path = about.imagePath.split('/');
              // let filePath = './public/uploads/' + path[path.length - 1];
              // fs.unlinkSync(filePath, (err) => {
              //   if (err) console.log("Couldn't delete" + about.imagePath + "image");
              // }); 
              about.imagePath =  '/uploads/' + req.file.filename;
              about.title = req.body.title !== null ? req.body.title : about.title;
              about.description = req.body.description !== null ? req.body.description : about.description;
              about.linkButton1 = req.body.linkButton1 !== null ? req.body.linkButton1 : about.linkButton1;
              about.linkButton2 = req.body.linkButton2 !== null ? req.body.linkButton2 : about.linkButton2;
              about.save()
                .then(() => res.redirect('/admin/about-management'));
            } else {
              req.flash('errors', 'Invalid Image. Please upload file image has width = 526px and height = 498px');
              if (req.file.path) {
                fs.unlinkSync(req.file.path, (err) => {
                  if (err) console.log("Couldn't delete" + req.file.path + "image");
                });
              }
              res.redirect('/admin/about-management');
            }
          })
          .catch(err => console.log(err));
      }
    });
}