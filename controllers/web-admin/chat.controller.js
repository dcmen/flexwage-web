const Staff = require("../../models/staff");
const User = require("../../models/user");
const mongoose = require("mongoose");

const config = require("../../config/http");

exports.getConversation = async (req, res) => {
  const user = req.session.user;
  const receiverId = req.params.id;

  const staff = await Staff.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(receiverId) } },
    {
      $lookup: {
        from: "companies",
        localField: "company_id",
        foreignField: "_id",
        as: "company",
      },
    },
    { $unwind: "$company" },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
  ]);

  let sender = await Staff.aggregate([
    {
      $match: {
        $and: [
          { user_id: mongoose.Types.ObjectId(user._id) },
          { company_id: mongoose.Types.ObjectId(staff[0].company._id) }
        ]
      }
    }
  ]);

  if (!sender.length) {
    sender = await User.findOne({
      _id: mongoose.Types.ObjectId(user._id),
    });
  }

  res.render("company/chat", {
    title: "Chat",
    pageName: "chat",
    staff: staff[0],
    sender: sender[0] ? sender[0] : sender,
    receiverId: receiverId,
    csrfToken: req.csrfToken(),
    url: config.API_HTTPS
  });
};

exports.getAvatarStaff = async (req, res) => {
  const staff_id = req.params.id;

  const staff = await Staff.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(staff_id) }
    },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    { $project: {
      "avatar": "$user.avatar_path"
    } }
  ]);
  if (!staff[0]) {
    const user = await User.findOne({_id: mongoose.Types.ObjectId(staff_id)});
    return res.json(user);
  }

  return res.json(staff[0]);
}

exports.getAdminConversation = async (req, res) => {
  const sender = req.session.user;
  const receiverId = req.params.id;
  const companyId = req.params.company_id;

  const staff = await Staff.aggregate([
    {
      $match: {
        $and: [
          { user_id: mongoose.Types.ObjectId(sender._id) },
          { company_id: mongoose.Types.ObjectId(companyId) },
        ],
      },
    },
    {
      $lookup: {
        from: "companies",
        localField: "company_id",
        foreignField: "_id",
        as: "company",
      },
    },
    { $unwind: "$company" },
  ]);

  const admin = await User.findOne({
    _id: mongoose.Types.ObjectId(receiverId),
  });

  res.render("company/admin-chat", {
    title: "Support",
    pageName: "support",
    staff: admin,
    sender: staff ? staff[0] : null,
    csrfToken: req.csrfToken(),
    url: config.API_HTTPS
  });
};

exports.getListConversationIframe = async (req, res) => {
  if (req.session.user.is_admin) {
    res.redirect("/admin/conversations");
  }
  const staff = await Staff.aggregate([
    {
      $match: {
        $and: [
          { user_id: mongoose.Types.ObjectId(req.session.user._id) },
          { company_id: mongoose.Types.ObjectId(req.params.id) },
        ],
      },
    },
    {
      $lookup: {
        from: "companies",
        localField: "company_id",
        foreignField: "_id",
        as: "company",
      },
    },
    { $unwind: "$company" },
  ]);

  res.render("company/conversation-blankLeftBar", {
    title: "List Conversation",
    csrfToken: req.csrfToken(),
    staff: staff ? staff[0] : null,
    url: config.API_HTTPS
  });
};

exports.getListConversation = async (req, res) => {
  res.render("company/list-conversation", {
    title: "List Conversation",
    csrfToken: req.csrfToken(),
    pageName: "conversations",
    url: config.API_HTTPS
  });
};
