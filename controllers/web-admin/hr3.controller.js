const requestPromise = require("request-promise");
var { HR3_API_URL } = require("../../config/config");
const crypto = require('crypto');

const userAuthorized = async (req, res) => {
  const {apiKeyRH3, userNameHR3, passwordHR3} = req.body;

  const optionsAuthorised = {
    'method': 'GET',
    'url': HR3_API_URL + '/api/v1-0/RequestUserAuthorised',
    'headers': {
      'cmkey': apiKeyRH3,
      'username': userNameHR3
    }
  };

  try {
    const code = await requestPromise(optionsAuthorised);
    if (code) {
      const token = await sessionToken(JSON.parse(code), apiKeyRH3, userNameHR3, passwordHR3);
      if (token) {
        const companies = await getCompany(JSON.parse(token));
        if (companies) {
          return res.status(200).json({code: 200, result: JSON.parse(companies), message: "Get companies success fully"});
        }
      } 
    }
    return res.status(400).json({code: 400, message: "Username or the Access token are invalid."});
  } catch(err) {
    console.error("Error: ", err?.options?.url ?? err.message);
    return res.status(400).json({code: 400, message: "Username or the Access token are invalid."});
  }
}

const sessionToken = async (code, apiKeyRH3, userNameHR3, passwordHR3) => {
  const passwordHash = crypto.createHash('md5').update(code + passwordHR3 + apiKeyRH3).digest('hex');
      const optionsRequestSessionToken = {
        'method': 'GET',
        'url': HR3_API_URL + '/api/v1-0/RequestSessionToken',
        'headers': {
          'nonce': code,
          'username': userNameHR3,
          'password': passwordHash,
          'cmkey': apiKeyRH3
        }
      };
  const result = await requestPromise(optionsRequestSessionToken);
  return result;
}

const getCompany = async (token) => {
  const options = {
    'method': 'GET',
    'url': HR3_API_URL + '/api/v1-0/Company',
    'headers': {
      'cmkey': token
    }
  };
  const result = await requestPromise(options);
  return result;
}

module.exports = {
  userAuthorized
}