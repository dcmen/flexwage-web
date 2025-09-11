module.exports = (req, res, next) => {
    if (req.session.role == 'Admin') {
        next();
    } else if (req.session.isLoggedIn) {
        return res.redirect(`/admin/company-management`);
    } else {
        return res.redirect('/');
    }
}