var express = require("express");
var app = express();
var path = require("path");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var mongoose = require("mongoose");
var passport = require("passport");
var cors = require("cors");
const http = require("http");
var config = require("./config/database");
var host = require("./config/http");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
var iframeReplacement = require("node-iframe-replacement");
const session = require("express-session");
const flash = require("connect-flash");
const validator = require("express-validator");
const xss = require("xss-clean");
const PUBLIC_SHARED_FILES_URL = '../public_shared_files'
// let acl = require('acl');

var cashDRoutes = require("./routes/cashDRoutes");
var usersRoutes = require("./routes/usersRoutes");
var adminRoutes = require("./routes/adminRoutes");
var apiFERoutes = require("./routes/apiFERoutes");
var backEndRoutes = require("./routes/backEndRoutes");
var oauthRoutes = require("./routes/oauthRoutes");
const healthCheckRoutes = require("./routes/healthCheckRoutes");
const isAuth = require("./middleware/is-auth");
const fileRoutes = require("./routes/fileRouters");

const validate = require('./validates/validate.params');

var socketId = null;

var socket = require("socket.io-client")(`${host.HOST_HTTPS}`, {
  transports: ["websocket", "polling", "flashsocket"],
  secure: true,
  reconnect: true,
  rejectUnauthorized: false,
});
var socketHttp = require("socket.io-client")(`${host.HOST_HTTP}`, {
  transports: ["websocket", "polling", "flashsocket"],
});
socket.on("connect", function () {
  console.log("Connected localhost");
});

if(host.PORT_HTTPS !== '3003') {
  //--- code run server dev
  var socketserver = require("socket.io-client")(`https://web.cashd.com.au`, {
    transports: ["websocket", "polling", "flashsocket"],
    secure: true,
    reconnect: true,
    rejectUnauthorized: false,
    withCredentials: true
  });

  socketserver.on("connect", function () {
    console.log("Connected server", socketserver.connected);
  });

  socketserver.on("join", (data) => {
    socket.emit("join", {
      code: data.code,
      socketId,
      key: data.key,
      state: data.state ? data.state : null,
    });
    socketHttp.emit("join", {
      code: data.code,
      socketId,
      key: data.key,
      state: data.state ? data.state : null,
    });
  });
//--- End code run server dev
}
mongoose.connect(config.DB_URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  // }, err => {
  //   acl = new acl(new acl.mongodbBackend(mongoose.connection.db, 'acl_'));
  //   acl.allow([
  //     {
  //       roles: ['super_user'],
  //       allows: [
  //         {
  //           resources: [
  //               '/lenders', '/lender', '/settings/supper-lender', '/kyc/:id', '/company-management', '/staff-management', '/block-user',
  //               '/retailers'
  //           ],
  //           permissions: ['get', 'post']
  //         }
  //       ]
  //     }
  //   ]);
});


var ejs = require("ejs");
var LRU = require('lru-cache'),
  options = {
    max: 100,
    maxAge: 1000 * 60 * 60
  }

//set views directory
app.set("views", path.join(__dirname, "views"));

//add LRU cache to EJS engine
ejs.cache = LRU(options);

//set EJS as template engine
app.set("view engine", "ejs");
app.enable("view cache");

// app.use(helmet());
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       ...helmet.contentSecurityPolicy.getDefaultDirectives(),
//       "img-src": ["'self'", `${host.apiHttps}`],
//       "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "code.highcharts.com", "cdnjs.cloudflare.com", "https://www.gstatic.com", "https://*.gstatic.com", "https://cdn.firebase.com", "https://*.firebaseio.com"]
//     },
//     // reportOnly: true
//   })
// );
// Sets " Permissions-Policy "
app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    'geolocation=(self "https://test.web.cashd.com.au/"), microphone=()'
  );
  next();
});
// Set cors
// app.use(cors());
app.use(logger("dev"));
app.use(flash());
app.use(validator());
app.use(bodyParser.urlencoded({
  limit: "50mb",
  extended: false
}));
app.use(cookieParser());
//app.use(csrf({cookie: true}));

app.use(express.static(path.resolve("./", PUBLIC_SHARED_FILES_URL)));
app.use('/public', express.static(path.resolve("./", PUBLIC_SHARED_FILES_URL)));

app.use(
  session({
    secret: config.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(morgan("dev"));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("assets"));
app.use(iframeReplacement);

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 0.5 * 60 * 1000, // 10s
  max: 100,
  message: "Too many request from this IP, please try again after an hour",
});
// app.use(limiter);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  //var token = req.csrfToken();
  socketId = req.session.user.email;
  //res.cookie('XSRF-TOKEN', token);
  //res.locals.csrfToken = token;
  res.locals.company_id = req.session.company_id;
  res.locals.user = req.session.user;
  // Gant role super user for email admin@gmail.com
  // if (res.locals.user.is_admin && req.session.role == "Admin") {
  //   acl.userRoles(req.session.user._id, (err, roles) => {
  //     if(roles.length === 0) {
  //       acl.addUserRoles(req.session.user._id, 'super_user');
  //     }
  //   });
  // }
  res.locals.role = req.session.role;
  res.locals.countryCode = req.session.countryCode;
  // res.locals.acl = acl;
  next();
});
app.use("/", healthCheckRoutes);
app.use("/", validate.validatorParams, validate.validatorQuery, fileRoutes);
app.use("/api/timesheets", validate.validatorParams, validate.validatorQuery, cashDRoutes);
app.use("/api/users", validate.validatorParams, validate.validatorQuery, usersRoutes);
app.use("/api/fe", validate.validatorParams, validate.validatorQuery, apiFERoutes);
app.use("/", validate.validatorParams, validate.validatorQuery, backEndRoutes);
app.use("/admin", isAuth, validate.validatorParams, validate.validatorQuery, adminRoutes);
app.use("/oauth", validate.validatorParams, validate.validatorQuery, oauthRoutes);

//code run server live
app.get("/callback/keypay", (req, res) => {
  var code = req.query.code;
  if (code !== null && code !== undefined) {
    var encoding = code.replace("%21", "!");
    socket.emit("join", {
      socketId,
      code: encoding,
      key: "KEYPAY",
    });
    socketHttp.emit("join", {
      socketId,
      code: encoding,
      key: "KEYPAY",
    });
  }
  return res.json({
    success: true,
    result: null,
    message: "",
    code: 200,
  });
});
app.get("/callback/xero2", (req, res) => {
  var { code, state } = req.query;
  if (code !== null && code !== undefined) {
    var encoding = code.replace('%21', '!');
    socket.emit('join', {
      socketId,
      code: encoding,
      key: "XERO",
      state,
    });
    socketHttp.emit('join', {
      socketId,
      code: encoding,
      key: "XERO",
      state,
    });
  }
  return res.json({
    success: true,
    result: null,
    message: '',
    code: 200
  });
});
app.get("/callback/deputy", (req, res) => {
  var code = req.query.code;
  if (code !== null && code !== undefined) {
    socket.emit("join", {
      socketId,
      code: code,
      key: "DEPUTY",
    });
    socketHttp.emit("join", {
      socketId,
      code: code,
      key: "DEPUTY",
    });
  }
  return res.json({
    success: true,
    result: null,
    message: "",
    code: 200,
  });
});
app.get("/callback/reckon", (req, res) => {
  var code = req.query.code;
  if (code !== null && code !== undefined) {
    socket.emit("join", {
      socketId,
      code: code,
      key: "RECKON",
    });
    socketHttp.emit("join", {
      socketId,
      code: code,
      key: "RECKON",
    });
  }
  return res.json({
    success: true,
    result: null,
    message: "",
    code: 200,
  });
})
// end code run server live

//csrf token for admin
app.use(function (req, res, next) {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  // socketId = req.session.
  next();
});

// error handler
app.use(function (err, req, res, next) {
  if (err.code !== "EBADCSRFTOKEN") return next(err);

  // handle CSRF token errors here
  res.status(403);

  res.send("form tampered with");
});

module.exports = app;