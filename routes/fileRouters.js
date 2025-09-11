const express = require("express");
const router = express.Router();

const fileController = require('../controllers/web-admin/file.controller');

router.get("/images/:folder/:fileName", fileController.getFile);

router.get("/files/:fileType/deductions/:companyId/:filename", fileController.getFile);

module.exports = router;