require('dotenv').config();
const request = require("request");
const fs = require("fs");
const CURRENT_ENV = process.env.TYPE.toLowerCase();
const API_URL = `https://${CURRENT_ENV === "prod" ? '' : CURRENT_ENV + '.'}web.cashd.com.au`;

const configs = require("../../config/http");
const baseService = require("../../service/baseService");

getGroups = async (req, res) => {
    let messages = req.flash();
    if (messages.success || messages.error) {
        messages = messages;
    } else {
        messages = null;
    }
  return res.render("groups/index", {
    title: "Groups",
    pageName: "groups",
    csrfToken: req.csrfToken(),
    messages
  });
};

getListGroup = async (req, res) => {
  const token = req.session.token;
  let { page, pageSize, keyword } = req.body;
  const url = `/api/users/getGroups?keyword=${keyword}&page=${+page}&pageSize=${+pageSize}`;
  const response = await baseService.getInstance().get(url, token, req);
  return res.send(response.body);
};

getAddGroup = async (req, res) => {
  let messages = req.flash();
    if (messages.success || messages.error) {
        messages = messages;
    } else {
        messages = null;
    }
  return res.render("groups/add-group", {
    title: "Add Group",
    pageName: "add-group",
    csrfToken: req.csrfToken(),
    messages
  });
};

postAddGroup = async (req, res) => {
  const token = req.session.token;
  const url = "/api/users/createOrUpdateGroup";
  let formData = {
    id: "",
    group_name: req.body.groupName,
    manager_ids: req.body.managerIds,
    company_ids: req.body.companyIds,
    is_remove_logo: "false",
  };
  if (req.file && req.file.filename) {
    formData.logo = {
      value: fs.createReadStream(req.file.path),
      options: {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      },
    };
  }

  const response = await baseService.getInstance().postFormData(url, formData, token, req);
  if (req.file) {
    //Remove old image
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
  let result = JSON.parse(response.body);
  if (result.success && result.code == 200) {
    req.flash('success', result.message)
    return res.redirect("/admin/groups");
  } else {
    req.flash('error', result.message)
    return res.redirect("/admin/group");
  }
};

getDetailGroup = async (req, res) => {
  const id = req.params.id;
  const token = req.session.token;
  const url = `/api/users/getGroupDetail?group_id=${id}`;
  if (!id) {
    return res.send({
      success: false,
      result: null,
      message: 'The field "group_id" is required.',
      code: 400,
      errorCode: "REQUIRE_GROUP_ID",
    });
  }

  const response = await baseService.getInstance().get(url, token, req);
  let body = JSON.parse(response.body);
  if (body.success) {
    return res.render("groups/detail-group", {
      title: "Detail Group",
      pageName: "detail-group",
      csrfToken: req.csrfToken(),
      group: body.result,
      url: API_URL
    });
  } else {
    return res.redirect('/admin/groups');
  }
};

getEditGroup = async (req, res) => {
  let messages = req.flash();
  if (messages.success || messages.error) {
      messages = messages;
  } else {
      messages = null;
  }

  const id = req.params.id;
  const token = req.session.token;
  const url = `/api/users/getGroupDetail?group_id=${id}`;

  if (!id) {
    return res.send({
      success: false,
      result: null,
      message: 'The field "group_id" is required.',
      code: 400,
      errorCode: "REQUIRE_GROUP_ID",
    });
  }

  const response = await baseService.getInstance().get(url, token, req);
  let body = JSON.parse(response.body);
  if (body.success) {
    return res.render("groups/edit-group", {
      title: "Edit Group",
      pageName: "edit-group",
      csrfToken: req.csrfToken(),
      group: body.result,
      messages,
      url: API_URL
    });
  } else {
    return res.redirect('back');
  }
};

postEditGroup = async (req, res) => {
  const id = req.params.id;
  const token = req.session.token;
  const url = "/api/users/createOrUpdateGroup";
  let formData = {
    id: id,
    group_name: req.body.groupName,
    manager_ids: req.body.managerIds,
    company_ids: req.body.companyIds
  };
  if (req.file && req.file.filename) {
    formData.logo = {
      value: fs.createReadStream(req.file.path),
      options: {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      },
    };
    formData.is_remove_logo = "false";
  } else if (req.body.imageExistence == 'false') {
    formData.is_remove_logo = "true";
  } else {
    formData.is_remove_logo = "false";
  }

  const response = await baseService.getInstance().postFormData(url, formData, token, req);
  if (req.file) {
    //Remove old image
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
  let result = JSON.parse(response.body);
  if (result.success && result.code == 200) {
    req.flash('success', result.message)
    return res.redirect("/admin/groups");
  } else {
    req.flash('error', result.message)
    return res.redirect(`/admin/group/${id}`);
  }
};

getManagers = async (req, res) => {
  const token = req.session.token;
  let { page, pageSize, keyword } = req.body;
  const url = `/api/users/getUsers?keyword=${keyword}&page=${page}&pageSize=${pageSize}`;
  const response = await baseService.getInstance().get(url, token, req);
  return res.send(response.body);
};

getCompaniesToAddGroup = async (req, res) => {
  const token = req.session.token;
  let { page, pageSize, keyword } = req.body;
  const url = `/api/users/getCompaniesToAddGroup?keyword=${keyword}&page=${page}&pageSize=${pageSize}`;
  const response = await baseService.getInstance().get(url, token, req);
  return res.send(response.body);
};

changeStatusGroup = async(req, res) => {
  const token = req.session.token;
  let id = req.params.id;
  let status = req.body.status;
  const body = {
    "group_id": id,
    "active": Number(status)
  };
  const url = "/api/users/activeGroup";

  const response = await baseService.getInstance().post(url, body, token, req);
  return res.send(response.body);
}

setGroupId = async(req, res) => {
  req.session.group_id = req.params.id;
  req.session.role = "Manager";
  return req.session.save(err => {
      if (err) console.log(err);
      res.send({success: true, result: null});
  });
}

module.exports = {
  getGroups,
  getListGroup,
  getAddGroup,
  postAddGroup,
  getDetailGroup,
  getEditGroup,
  getManagers,
  getCompaniesToAddGroup,
  postEditGroup,
  changeStatusGroup,
  setGroupId
};
