var express = require('express');
var router = express.Router();

const OauthController = require('../controllers/web-admin/oauth.controller');
const validate = require('../validates/login.validate');

// const csrf = require('csurf');
// const csrfProtection = csrf();

// router.use(csrfProtection);

router.post('/token', OauthController.getAccessToken);

router.get('/clients', validate.isLogin, OauthController.getAuth);
router.get('/clients/add', validate.isLogin, OauthController.getNewClient);
router.post('/clients/add', validate.isLogin, OauthController.postNewClient);
router.get('/client/detail/:id', validate.isLogin, OauthController.getEditClient);
router.post('/client/edit/:id', validate.isLogin, OauthController.postEditClient);

router.get('/clients/devapp', validate.isLogin, OauthController.getDevApp);
router.post('/clients/delete', validate.isLogin, OauthController.deleteClient);

router.get('/api/clients', OauthController.getCliens);
router.get('/api/resource/company', OauthController.getCompanyInfor);
router.get('/api/resource/staff', OauthController.getStaffInfor);
router.get('/api/me', OauthController.getUserInfor);
router.get('/api/get-code', OauthController.getCode);

module.exports = router;