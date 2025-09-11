const Team = require('../../models/web-admin/team.model');
const Header = require('../../models/web-admin/heading.model');
const Helper = require('../../helpers/helper');
const fs = require('fs');

exports.getTeam = async (req, res) => {
  let team = await Team.find();
  let header = await Header.findOne({ code: 'header-team' });
  let messages = req.flash('errors');
  res.render('team/table-team', {
    title: 'Team Member management',
    data: team,
    header: header,
    messages: messages,
    pageName: 'team-management',
    csrfToken: req.csrfToken()
  });
};

exports.postUpdateHeader = (req, res) => {
  Helper.updateHeader(req, 'header-team');
  res.redirect('/admin/team-management');
}


exports.getAddTeamMember = (req, res) => {
  let messages = req.flash('errors');
  res.render('team/add-team', {
    title: 'Add Team Member',
    pageName: 'team-management',
    messages: messages,
    csrfToken: req.csrfToken()
  })
};

exports.postAddTeamMember = (req, res) => {
  let checkFileImage = Helper.readFileSize(req, 274, 346);
  checkFileImage.then(result => {
    if (result) {
      let team = new Team({
        imagePath: '/uploads/' + req.file.filename,
        name: req.body.name,
        position: req.body.position,
        description: req.body.description,
        facebook: req.body.facebook === '' ? '#' : req.body.description,
        google: req.body.google === '' ? '#' : req.body.google,
        twitter: req.body.twitter === '' ? '#' : req.body.twitter,
        instagram: req.body.instagram === '' ? '#' : req.body.instagram,
        status: req.body.status
      });
      team.save()
      .then(() => res.redirect('/admin/team-management'));
    }
    else {
      req.flash('errors', 'Invalid Image. Please upload file image has width = 274px and height = 346px');
      if (req.file.path) {
        fs.unlinkSync(req.file.path, (err) => {
          if (err) console.log("Couldn't delete" + req.file.path + "image");
        });
      }
      res.redirect('/admin/add-team-member');
    }
  })
};

exports.getEditTeamMember = (req, res) => {
  let messages = req.flash('errors');
  const teamMemberId = req.params.id;
  Team.findOne({ _id: teamMemberId })
  .then(team => {
    res.render('team/edit-team', {
      title: 'Edit Team Member',
      team: team,
      pageName: 'team-management',
      messages: messages,
      csrfToken: req.csrfToken()
    });
  });
};

exports.postEditTeamMember = (req, res) => {
  const teamMemberId = req.params.id;
  Team.findOne({ _id: teamMemberId })
  .then(team => {
    if (req.file === undefined){
      team.imagePath = team.imagePath;
      team.name = req.body.name !== null ? req.body.name : team.name;
      team.position = req.body.position !== null ? req.body.position : team.position;
      team.description = req.body.description !== null ? req.body.description : team.description;
      team.facebook = req.body.facebook !== null ? req.body.facebook : team.facebook;
      team.google = req.body.google !== null ? req.body.google : team.google;
      team.twitter = req.body.twitter !== null ? req.body.twitter : team.twitter;
      team.instagram = req.body.instagram !== null ? req.body.instagram : team.instagram;
      team.status = req.body.status !== null ? req.body.status : team.status;

      team.save()
      .then(() => res.redirect('/admin/team-management'));
    }
    else {
      //Delete file if upload new file
      let checkFileImage = Helper.readFileSize(req, 274, 346);
      checkFileImage.then(result => {
        if(result) {
          //Delete file if upload new file
          // let path = team.imagePath.split('/');
          // let filePath = './public/uploads/' + path[path.length - 1];
          // fs.unlinkSync(filePath, (err) => {
          //   if (err) console.log("Couldn't delete" + team.imagePath + "image");
          // });

          team.imagePath = '/uploads/' + req.file.filename;
          team.name = req.body.name !== null ? req.body.name : team.name;
          team.position = req.body.position !== null ? req.body.position : team.position;
          team.description = req.body.description !== null ? req.body.description : team.description;
          team.facebook = req.body.facebook !== null ? req.body.facebook : team.facebook;
          team.google = req.body.google !== null ? req.body.google : team.google;
          team.twitter = req.body.twitter !== null ? req.body.twitter : team.twitter;
          team.instagram = req.body.instagram !== null ? req.body.instagram : team.instagram;
          team.status = req.body.status !== null ? req.body.status : team.status;

          team.save()
          .then(() => res.redirect('/admin/team-management'));
        }
        else {
          req.flash('errors', 'Invalid Image. Please upload file image has width = 274px and height = 346px');
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

exports.getDeleteTeamMember = (req, res) => {
  const teamMemberId = req.params.id;
  Team.findByIdAndRemove(teamMemberId)
  .then(team => {
    let path = team.imagePath.split('/');
    let filePath = './public/uploads/' + path[path.length - 1];
    fs.unlinkSync(filePath, (err) => {
      if (err) console.log("Couldn't delete" + team.imagePath + "image");
    });
    res.redirect('/admin/team-management');
  })
  .catch(err => console.log(err));
};
