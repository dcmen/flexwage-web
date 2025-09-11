module.exports = {
    'API_HTTP': process.env.API_HTTP,
    //TODO: THIS IS SUPPOSED TO BE API_HTTPS, SHOULD BE CHANGED IMMEDIATELY AFTER web.cashd.net.au is added to SSL whitelist
    'API_HTTPS': process.env.API_HTTP,
    'HOST_HTTP': process.env.HOST_HTTP,
    'HOST_HTTPS': process.env.HOST_HTTPS,
    'PORT_HTTPS': process.env.PORT_HTTPS
};
