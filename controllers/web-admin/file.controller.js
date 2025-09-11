const path = require('path');

const baseService = require("../../service/baseService");

getFile = async (req, res) => {
  baseService.getInstance().getFile(req.url, res);
}

module.exports = {
  getFile
};