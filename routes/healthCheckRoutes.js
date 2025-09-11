const express = require('express');
const {healthCheckController} = require("../controllers/healthCheckController");
const router = express.Router();


router.get('/keepAlive', healthCheckController);
module.exports = router;
