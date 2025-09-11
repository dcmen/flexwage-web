const request = require('request');
const { API_HTTPS } = require('../config/http');

module.exports = (req, res, next) => {
  
  const body = {
    device_id: req.session.device_id,
    refresh_token: req.session.refresh_token
  };
  const options = {
    method: 'POST',
    url: `${API_HTTPS}/api/users/refreshToken`,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }

  request(options, (err, response, body) => {
    const bodyParse = JSON.parse(body);
    if (bodyParse.success && bodyParse.code == 200) {
      req.session.token = bodyParse.token;
      req.session.refresh_token = bodyParse.refresh_token;
      next();
    } else {
      req.session.destroy();
      res.json({success: false, msg: 'login again', errorCode: 'LOGIN_AGAIN'});
    }
  });
  
}