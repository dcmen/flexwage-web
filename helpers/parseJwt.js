const jwt_decode = require('jwt-decode');

const parseJwt = (token) => {
    var decoded = jwt_decode(token);
    return decoded;
};

exports.parseJwt = parseJwt;