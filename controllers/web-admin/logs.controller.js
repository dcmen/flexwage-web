const request = require('request');

const localhost = require('../../config/http');
const baseService = require("../../service/baseService");

exports.getRegistration = async (req, res) => {
    return res.render('logs/registration', {
        title: 'Logs Registration',
        pageName: 'logs',
        csrfToken: req.csrfToken()
      });
}

exports.getRegistrationApi = async (req, res) => {
    const token = req.session.token;
    const url = `/api/timesheets/logs/registration/${req.body.page}/${req.body.pageSize}?q=${req.body.searchKey}`;
    const response = await baseService.getInstance().get(url, token, req);
    return res.status(200).send(response.body);
}

exports.getRate = async (req, res) => {
    return res.render('logs/rate', {
        title: 'Logs Rate',
        pageName: 'logs',
        csrfToken: req.csrfToken()
    });
}

exports.getRateApi = async (req, res) => {
    const token = req.session.token;
    const url = `/api/timesheets/logs/rates/${req.body.page}/${req.body.pageSize}?q=${req.body.searchKey}`;
    const response = await baseService.getInstance().get(url, token, req);
    return res.status(200).send(response.body);
}