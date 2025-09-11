const ErrorCodeModel = require('../../models/error_code');

exports.getErrorCodes = async (req, res) => {
    return res.render('error_code/list', {
        title: 'Error Codes Management',
        pageName: 'error-code',
        csrfToken: req.csrfToken(),
    });
}

exports.postErrorCodes = async (req, res) => {
    let sortColum = req.body['order[0][column]'];
    let value = req.body['order[0][dir]'] == "asc" ? 1 : -1;
    const nameFiled = ["code", "message"];
    let sort = {};
    sort[nameFiled[sortColum - 1]] = value;

    let perPage = +req.body.pageSize
        , page = +req.body.page;

    let query, countQuery;
    if (req.body.errorCode) {
        query = [
            { $match: { code: +req.body.errorCode } },
            { $sort: sort },
            { $skip: perPage * page },
            { $limit: perPage },
        ];
        countQuery = { code: +req.body.errorCode };
    } else {
        query = [
            { $sort: sort },
            { $skip: perPage * page },
            { $limit: perPage }
        ];
        countQuery = {};
    }
    const errorCodes = await ErrorCodeModel.aggregate(query);
    const totalItems = await ErrorCodeModel.countDocuments(countQuery);

    return res.send(JSON.stringify({result: errorCodes, totalItems: totalItems}))
}