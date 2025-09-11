const Download = require('../../models/web-admin/download.model');
const Helper = require('../../helpers/helper');
const Header = require('../../models/web-admin/heading.model');
const fs = require("fs"); 

exports.getDownload = async(req, res) => {
  let download = await Download.findOne();
  let header = await Header.find({
    code: 'header-download'
  });
  let messages = req.flash('errors');
    res.render('download/table-download', {
      title: 'Download management',
      download: download,
      header:header,
      messages: messages,
      pageName: 'download-management',
      csrfToken: req.csrfToken()
    });
}
exports.postUpdateHeader = (req, res) => {
  Helper.updateHeader(req, 'header-download');
  res.redirect('/admin/download-management');
}

exports.postEditDownload = (req, res) => {
  const downloadId = req.params.id;
  Download.findOne({
      _id: downloadId
    })
    .then(download => {
      if (req.file === undefined) {
        download.imagePath = download.imagePath;
        download.title = req.body.title !== null ? req.body.title : download.title;
        download.description = req.body.description !== null ? req.body.description : download.description;
        download.linkButton1 = req.body.linkButton1 !== null ? req.body.linkButton1 : download.linkButton1;
        download.linkButton2 = req.body.linkButton2 !== null ? req.body.linkButton2 : download.linkButton2;
        download.status = req.body.status !== null ? req.body.status : download.status;

        download.save()
          .then(() => res.redirect('/admin/download-management'));
      } else {
        let checkFileImage = Helper.readFileSize(req, 526, 498);
        checkFileImage.then(result => {
            if (result) {
              //Delete file if upload new file
              // let path = download.imagePath.split('/');
              // let filePath = './public/uploads/' + path[path.length - 1];
              // fs.unlinkSync(filePath, (err) => {
              //   if (err) console.log("Couldn't delete" + about.imagePath + "image");
              // });
              download.imagePath =  '/uploads/' + req.file.filename;
              download.title = req.body.title !== null ? req.body.title : download.title;
              download.description = req.body.description !== null ? req.body.description : download.description;
              download.linkButton1 = req.body.linkButton1 !== null ? req.body.linkButton1 : download.linkButton1;
              download.linkButton2 = req.body.linkButton2 !== null ? req.body.linkButton2 : download.linkButton2;
              download.status = req.body.status !== null ? req.body.status : download.status;
              download.save()
                .then(() => res.redirect('/admin/download-management'));
            } else {
              req.flash('errors', 'Invalid Image. Please upload file image has width = 526px and height = 498px');
              if (req.file.path) {
                fs.unlinkSync(req.file.path, (err) => {
                  if (err) console.log("Couldn't delete" + req.file.path + "image");
                });
              }
              res.redirect('/admin/download-management');
            }
          })
          .catch(err => console.log(err));
      }
    });
}

