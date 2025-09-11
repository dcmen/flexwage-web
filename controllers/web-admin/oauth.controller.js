var request = require("request");
const { JsonWebTokenError } = require("jsonwebtoken");

const localhost = require("../../config/http");
const baseService = require("../../service/baseService");

exports.getAuth = async (req, res) => {
  let messagesInfo = req.flash("info");
  if (messagesInfo.length > 0) {
    messagesInfo = messagesInfo[0];
  } else {
    messagesInfo = null;
  }
  const page = req.query.page >= 1 ? req.query.page - 1 : 0;
  const pageSize = req.query.pageSize ? req.query.pageSize : 5;
  const url = `/api/clients?page=${page}&pageSize=${pageSize}`;

  const response = await baseService
    .getInstance()
    .get(url, req.session.token, req);
  var data = JSON.parse(response.body);
  if (data.code == 200) {
    return res.render("clients/oauth", {
      title: "Oauth Clients",
      clients: data.result,
      pagination: {
        total: data.totalCount,
        viewItemTotal: data.result.length,
        viewItem: 1,
        totalPages: data.totalPages,
        pageIndex: data.pageIndex,
        pageSize: data.pageSize,
      },
      messagesInfo: messagesInfo,
    });
  } else {
    return res.render("clients/oauth", {
      title: "Oauth Clients",
      clients: [],
      total: 0,
      pagination: {
        total: 0,
        viewItemTotal: 0,
        viewItem: 0,
        totalPages: 0,
        pageIndex: 0,
        pageSize: 5,
      },
      messagesInfo: messagesInfo,
    });
  }
};

exports.getCliens = async (req, res) => {
  const page = req.query.page >= 1 ? req.query.page - 1 : 0;
  const pageSize = req.query.pageSize ? req.query.pageSize : 5;
  const q = req.query.q;
  const url = `/api/clients?page=${page}&pageSize=${pageSize}&q=${q}`;
  const response = await baseService
    .getInstance()
    .get(url, req.session.token, req);
  var data = JSON.parse(response.body);
  if (data.code == 200) {
    return res.send({
      clients: data.result,
      pagination: {
        total: data.totalCount,
        viewItemTotal: data.result.length,
        viewItem: 1,
        totalPages: data.totalPages,
        pageIndex: data.pageIndex,
        pageSize: data.pageSize,
      },
    });
  } else {
    return res.send({
      clients: [],
      total: 0,
      pagination: {
        total: 0,
        viewItemTotal: 0,
        viewItem: 0,
        totalPages: 0,
        pageIndex: 0,
        pageSize: 5,
      },
    });
  }
};

exports.getNewClient = async (req, res) => {
  let messagesErr = req.flash("error");
  if (messagesErr.length > 0) {
    messagesErr = messagesErr[0];
  } else {
    messagesErr = null;
  }
  let messagesInfo = req.flash("info");
  if (messagesInfo.length > 0) {
    messagesInfo = messagesInfo[0];
  } else {
    messagesInfo = null;
  }
  return res.render("clients/new-client", {
    title: "New Oauth Client",
    csrfToken: req.csrfToken(),
    messagesErr: messagesErr ? messagesErr : null,
    messagesInfo: messagesInfo ? messagesInfo : null,
  });
};

exports.getDevApp = async (req, res) => {
  const url = "/api/delete/client";
  const response = await baseService
    .getInstance()
    .post(url, { id: req.body.id }, req.session.token, req);
  return res.render("clients/app-oauth-client", {
    title: "Oauth Clients",
    client: null,
  });
};

exports.postNewClient = async (req, res) => {
  const body = {
    user_id: req.session.user_id,
    name: req.body.name,
    redirect_uri: req.body.redirect_uri,
    description: req.body.description,
    logo_uri: req.body.logo_uri,
  };
  const token = req.session.token;
  const url = "/api/add/client";
  const response = await baseService.getInstance().post(url, body, token, req);
  const responseBody = JSON.parse(response.body);
  if (responseBody.code == 200) {
    req.flash("info", "Add new client successfully.");
    return res.redirect("/oauth/clients");
  } else {
    req.flash("error", "Add new client failed.");
    return res.redirect("/oauth/clients/add");
  }
};

exports.deleteClient = async (req, res) => {
  const url = "/api/delete/client";
  const response = await baseService
    .getInstance()
    .post(url, { id: req.body.id }, req.session.token, req);
  return res.send(response.body);
};

exports.getAccessToken = async (req, res) => {
  if (req.body.grant_type == "refresh_token" && req.body.refresh_token) {
    const url = "/api/oauth/refresh-token";
    const body = {
      refresh_token: req.body.refresh_token,
      client_id: req.body.client_id,
      client_secret: req.body.client_secret,
    };

    const response = await baseService.getInstance().post(url, body, null, req);
    return res.status(200).send(response.body);
  } else {
    const code = req.body.code;
    const client_id = req.body.client_id;
    const client_secret = req.body.client_secret;
    req.session.client_id = req.body.client_id;
    const url = "/api/users/oauth/token";
    if (code && client_id) {
      const body = {
        code: code,
        client_id: client_id,
        client_secret: client_secret,
      };

      const response = await baseService
        .getInstance()
        .post(url, body, null, req);
      return res.status(200).send(response.body);
    } else {
      return res.status(400).send({
        message: "Invalidate params",
      });
    }
  }
};

exports.getUserInfor = async (req, res) => {
  try {
    const url = "/api/me";
    const token = req.headers.authorization;
    const response = await baseService.getInstance().get(url, token, req);
    return res.send(response.body);
  } catch (error) {
    return res.status(400).send({
      message: "Invalidate params",
    });
  }
};

exports.getCompanyInfor = async (req, res) => {
  try {
    const url = "/api/resource/company";
    const token = req.headers.authorization;
    const response = await baseService.getInstance().get(url, token, req);
    return res.send(response.body);
  } catch (error) {
    return res.status(400).send({
      message: "Invalidate params",
    });
  }
};

exports.getStaffInfor = async (req, res) => {
  try {
    const url = "/api/resource/staff";
    const token = req.headers.authorization;
    const response = await baseService.getInstance().get(url, token, req);
    return res.send(response.body);
  } catch (error) {
    return res.status(400).send({
      message: "Invalidate params",
    });
  }
};

exports.getEditClient = async (req, res) => {
  const getClient = await callApiGet(
    `/api/client?id=${req.params.id}`,
    req.session.token,
    req
  );
  // const getAuthCode = await callApiPost(`/api/users/code`, {"client_id": req.session.client._id, "staff_id": req.body.staff_id});
  return res.render("clients/app-oauth-client", {
    title: "Edit client",
    client: getClient.result,
    staffs: req.session.staffs,
    csrfToken: req.csrfToken(),
  });
};

exports.postEditClient = async (req, res) => {
  const body = {
    _id: req.params.id,
    user_id: req.session.user_id,
    name: req.body.name,
    redirect_uri: req.body.redirect_uri,
    description: req.body.description,
    logo_uri: req.body.logo_uri,
  };

  const url = "/api/edit/client";
  const token = req.session.token;
  const response = await baseService.getInstance().post(url, body, token, req);
  const data = JSON.parse(response.body);
  if (data.success) {
    return res.redirect("/oauth/client/detail/" + data.result._id);
  } else {
    return res.redirect("/oauth/client/detail/" + data.result._id);
  }
};

exports.getCode = async (req, res) => {
  const url = `/api/code?response_type=code&user_id=${req.session.user_id}`;
  const body = {
    client_id: req.query.client_id,
    staff_id: req.query.staff_id,
  };
  const response = await baseService.getInstance().post(url, body, null, req);
  const data = JSON.parse(response.body);
  return res.status(200).json(data);
};

async function callApiGet(str, token, req) {
  const result = await baseService.getInstance().get(str, token, req);
  const data = JSON.parse(result.body);
  return data;
}

async function callApiPost(str, body) {
  var request = require("request-promise");
  var options = {
    method: "POST",
    url: `${localhost.API_HTTPS}${str}`,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
  var result = await request(options);
  const data = JSON.parse(result);
  return data;
}
