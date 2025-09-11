const Header = require('../../models/web-admin/heading.model');
const Helper = require('../../helpers/helper');

exports.getVideo = async (req, res) => {
    let header = await Header.find({ code: 'header-video'})
    .then(result => {
        res.render('video/table-video', {
        title: 'Video management',
        header: result,
        pageName: 'video-management',
        csrfToken: req.csrfToken()
        });
    })
    .catch(err => console.log(err));
};

exports.postUpdateHeader = (req, res) => {
    Helper.updateHeader(req, 'header-video');
    res.redirect('/admin/video-management');
}
