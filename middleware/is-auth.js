const UserController = require('../controllers/web-admin/user.controller');

module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/');
  } else {
    if (req.session.role != "Admin" && !req.session.is_update_device_token && req.session.device_token) {
      const {device_id, staff_id, device_token, token, company_id} = req.session;
      UserController.updateDeviceToken(device_id, company_id, staff_id, device_token, 1, token, req);
      req.session.is_update_device_token = true;
    }
    next();
  }
}