module.exports.isLogin = (req, res, next) => {
    if (req.session.token) {
        next();
    } else {
        return res.redirect('/console/login');
    }
}