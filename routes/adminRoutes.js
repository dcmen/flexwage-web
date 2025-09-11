const express = require("express");
const router = express.Router();
var path = require("path");

async function checkPermissions(req, res, next) {
  // let acl = res.locals.acl;
  // if (req.session.user) {
  //   acl.isAllowed(
  //       req.session.user._id.toString(),
  //       req.url, req.method.toLowerCase(), (error, allowed) => {
  //         console.log('allowed', allowed);
  //         if (allowed) {
  //           next();
  //         } else {
  //           res.send({ message: 'Insufficient permissions to access resource' });
  //         }
  //       });
  // } else {
  //   res.send({ message: 'User not authenticated' })
  // }
  next();
}

const IndexController = require("../controllers/web-admin/index.controller");
const CompanyController = require("../controllers/web-admin/company.controller");
const StaffController = require("../controllers/web-admin/staff.controller");
const IconController = require("../controllers/web-admin/icon.controller");
const BannerController = require("../controllers/web-admin/banner.controller");
const FeatureController = require("../controllers/web-admin/feature.controller");
const AboutController = require("../controllers/web-admin/about.controller");
const FunfactController = require("../controllers/web-admin/funfact.controller");
const PricingController = require("../controllers/web-admin/pricing.controller");
const ScreenshotController = require("../controllers/web-admin/screenshot.controller");
const TeamController = require("../controllers/web-admin/team.controller");
const FeedbackController = require("../controllers/web-admin/feedback.controller");
const HIWController = require("../controllers/web-admin/howitwork.controller");
const AwesomeController = require("../controllers/web-admin/awesome.controller");
const UserController = require("../controllers/web-admin/user.controller");
const ConfigController = require("../controllers/web-admin/config.controller");
const FaqController = require("../controllers/web-admin/faq.controller");
const DownloadController = require("../controllers/web-admin/download.controller");
const paymentSystemsController = require("../controllers/web-admin/paymentSystem.controller")
const BlogCategoryController = require("../controllers/web-admin/blogCategory.controller");
const BlogTagController = require("../controllers/web-admin/blogTag.controller");
const BlogPostController = require("../controllers/web-admin/blogPost.controller");
const VideoController = require("../controllers/web-admin/video.controller");
const ContactController = require("../controllers/web-admin/contact.controller");
const abaController = require("../controllers/web-admin/aba.controller");
const transactionsController = require("../controllers/web-admin/transactions.controller");
const settingsController = require("../controllers/web-admin/settings.controller");
const retailerController = require("../controllers/web-admin/retailer.controller");
const LenderController = require("../controllers/web-admin/lender.controller");
const MonoovaTransactionController = require("../controllers/web-admin/monoova.controller");
const ChatController = require("../controllers/web-admin/chat.controller");
const logsController = require("../controllers/web-admin/logs.controller");
const ErrorCodeController = require("../controllers/web-admin/errorCode.controller");
const AdminController = require("../controllers/web-admin/admin.controller");
const groupsController = require("../controllers/web-admin/group.controller");
const validateFormAba = require("../validates/setting.validate");
const isAdmin = require("../middleware/is-admin");
const checkToken = require("../middleware/checkToken");
const retailerModel = require("../models/web-admin/retailer.model");
const PUBLIC_SHARED_FILES_URL = '../public_shared_files';

const fs = require("fs");


const multer = require("multer");

const csrf = require("csurf");

const csrfProtection = csrf();
router.use(csrfProtection);

/* Upload File */
let storage = multer.diskStorage({
  destination: `${path.resolve("./", PUBLIC_SHARED_FILES_URL)}/tmp`,
  filename: (req, file, cb) => {
    let filename = file.originalname;
    cb(null, Date.now() + "-" + filename);
  },
  fileFilter: (req, file, callback) => {
    let ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      return callback(null, false);
    }
    callback(null, true);
  },
});

let upload = multer({
  storage: storage,
  limits: {
    fileSize: "4MB",
  },
});

/* Company Management */

/* Dashboard */
router.get("/", IndexController.getDashboard);

router.get("/logout", UserController.postLogout);
router.get("/logout-auto", UserController.postLogoutAuto);

/* Contact */
router.get("/contact-management", ContactController.getContact);
router.get("/watch-contact/:id", ContactController.getWatchContact);
router.get("/delete-contact/:id", ContactController.getDeleteContact);

// router.get('/company-management', CompanyController.getCompany);
router.get("/company-management", CompanyController.getCompany);
router.get("/company-group", CompanyController.getCompany);
router.post("/get-company-management", CompanyController.getDataCompany);
router.get("/edit-company/:id", CompanyController.getEditCompany);
router.post("/edit-company/:id", CompanyController.postEditCompany);
// router.post('/update-lender-company/:id/lender/:lender_id', CompanyController.updateLenderInCompany);
router.get("/delete-company/:id", CompanyController.deActive);
router.get("/watch-company/:id", CompanyController.getWatchCompanyV1);
router.post("/get-totals", CompanyController.getAllTotalsCompany);
router.get("/watch-company-infor/:id", CompanyController.getWatchCompany);
router.post("/change-status/:id", CompanyController.changeStatus);
router.post("/deduction-repayment-type", CompanyController.setupRepaymentType);
router.post("/pay-now", CompanyController.paymentNow);
router.post("/add-direct-debit", CompanyController.addDirectDebit);
router.get("/get-direct-debit/:companyId", CompanyController.getDirectDebitForm);
router.post("/send-mail-payment", CompanyController.sendMailPayment);
router.post("/get-dd-histories/:companyId", CompanyController.getDDHistories);
router.post("/action-direct-debit-request/:companyId", CompanyController.actionDDRequestForm);

router.get("/staff-company/:id", CompanyController.getWatchStaff);
router.post("/edit-limit-company/:id", CompanyController.postLimitCompany);
router.post("/edit-limit-staff/:id", CompanyController.postLimitStaff);
router.post("/edit-monoova_live/:id", CompanyController.postMonoovaMode);
router.post("/validate-bank_account/:id", CompanyController.postValidateBank);
router.post(
  "/edit-payment-verification/:id",
  CompanyController.postPaymentVerifyMode
);
router.post("/company/deduction/excel", CompanyController.createDeductionFileExcel);
router.post("/company/deduction/pdf", CompanyController.createDeductionFilePDF);
router.post("/company/direct-debit-request/pdf", CompanyController.createDirectDebitRequestFilePDF);

// router.get('/edit-staff-company/:id', CompanyController.getEditStaff);
// router.post('/edit-staff-company/:id', CompanyController.postEditStaff);

/* Staff Management */
router.get("/staff-management", StaffController.getStaffs);
router.get("/edit-staff/:id", StaffController.getStaff);
router.post(
  "/edit-staff/:id",
  upload.single("avatar_img"),
  StaffController.postStaff
);
router.get("/watch-staff/:id", StaffController.getWatchStaff);
router.post("/staff-management/:id", StaffController.blockUser);
router.get("/block-user", StaffController.getBlockUsers);
router.post("/block-user/:id", StaffController.unBlockUser);
router.post("/change-role/:id", StaffController.changeRole);
router.post("/staffs/change-status", StaffController.changeStatusStaffs);
router.post("/staffs/registered", StaffController.exportDataStaffRegistered);
router.post("/staffs/invited", StaffController.exportDataStaffInvited);
router.post("/staffs/work-day", StaffController.paySetUp);
router.post("/staffs/support", StaffController.staffSupport);

/* Admin Management */
router.get("/admin-management", AdminController.getAdmins);
router.get("/create-admin", AdminController.getCreateAdmin);
router.post("/create-admin", upload.single("avatar"), AdminController.postCreateAdmin);
router.post("/block-admin/:id", AdminController.blockAdmin);
router.get("/edit-admin/:id", AdminController.getEditAdmin);
router.post("/edit-admin/:id", upload.single("avatar"), AdminController.postEditAdmin);

/* List Icon */
router.get("/ico-font", IconController.getIcoFont);

/* Banner */
router.get("/banner-management", BannerController.getBanners);
router.get("/add-banner", BannerController.getAddBanner);
router.post(
  "/add-banner",
  upload.single("imagePath"),
  BannerController.postAddBanner
);
router.get("/edit-banner/:id", BannerController.getEditBanner);
router.post(
  "/edit-banner/:id",
  upload.single("imagePath"),
  BannerController.postEditBanner
);
router.get("/delete-banner/:id", BannerController.getDeleteBanner);

/* Feature */
router.get("/feature-management", FeatureController.getFeatures);
router.post("/update-header-feature", FeatureController.postUpdateHeader);
router.get("/add-feature", FeatureController.getAddFeature);
router.post(
  "/add-feature",
  upload.single("imagePath"),
  FeatureController.postAddFeature
);
router.get("/edit-feature/:id", FeatureController.getEditFeature);
router.post(
  "/edit-feature/:id",
  upload.single("imagePath"),
  FeatureController.postEditFeature
);
router.get(
  "/delete-feature/:id",

  FeatureController.getDeleteFeature
);

/* About */
router.get("/about-management", AboutController.getAbouts);
router.post("/update-header-about", AboutController.postUpdateHeader);
router.post(
  "/edit-about/:id",
  upload.single("imagePath"),
  AboutController.postEditAbout
);

/*Faq*/
router.get("/faq-management", FaqController.getFaq);
router.post(
  "/update-header-faq",
  upload.single("imagePath"),
  FaqController.postUpdateHeader
);
router.get("/add-faq", FaqController.getAddFaq);
router.post("/add-faq", upload.single(), FaqController.postAddFaq);
router.get("/edit-faq/:id", FaqController.getEditFaq);
router.post("/edit-faq/:id", upload.single(), FaqController.postEditFaq);
router.get("/delete-faq/:id", FaqController.getDeleteFaq);

/* Download */
router.get("/download-management", DownloadController.getDownload);
router.post(
  "/update-header-download",
  upload.single("imagePath"),
  DownloadController.postUpdateHeader
);
router.post(
  "/edit-download/:id",
  upload.single("imagePath"),
  DownloadController.postEditDownload
);

/* FUN-FACT */
router.get("/funfact-management", FunfactController.getFunfact);
router.post("/update-header-funfact", FunfactController.postUpdateHeader);
router.get("/add-funfact", FunfactController.getAddFunfact);
router.post("/add-funfact", FunfactController.postAddFunfact);
router.get("/edit-funfact/:id", FunfactController.getEditFunfact);
router.post("/edit-funfact/:id", FunfactController.postEditFunfact);
router.get(
  "/delete-funfact/:id",

  FunfactController.getDeleteFunfact
);

/* PRICING */
router.get("/pricing-management", PricingController.getPricing);
router.post("/update-header-pricing", PricingController.postUpdateHeader);
router.get("/add-pricing", PricingController.getAddPricing);
router.post("/add-pricing", PricingController.postAddPricing);
router.get("/edit-pricing/:id", PricingController.getEditPricing);
router.post("/edit-pricing/:id", PricingController.postEditPricing);
router.get(
  "/delete-pricing/:id",

  PricingController.getDeletePricing
);

/* SCREEN-SHOT */
router.get(
  "/screenshot-management",

  ScreenshotController.getScreenshot
);
router.post("/update-header-screenshot", ScreenshotController.postUpdateHeader);
router.get(
  "/add-screenshot",

  ScreenshotController.getAddScreenshot
);
router.post(
  "/add-screenshot",
  upload.single("imagePath"),
  ScreenshotController.postAddScreenshot
);
router.get(
  "/edit-screenshot/:id",

  ScreenshotController.getEditScreenshot
);
router.post(
  "/edit-screenshot/:id",
  upload.single("imagePath"),
  ScreenshotController.postEditScreenshot
);
router.get(
  "/delete-screenshot/:id",

  ScreenshotController.getDeleteScreenshot
);

/* TEAM MEMBER */
router.get("/team-management", TeamController.getTeam);
router.post("/update-header-team", TeamController.postUpdateHeader);
router.get("/add-team-member", TeamController.getAddTeamMember);
router.post(
  "/add-team-member",
  upload.single("imagePath"),
  TeamController.postAddTeamMember
);
router.get("/edit-team-member/:id", TeamController.getEditTeamMember);
router.post(
  "/edit-team-member/:id",
  upload.single("imagePath"),
  TeamController.postEditTeamMember
);
router.get("/delete-team-member/:id", TeamController.getDeleteTeamMember);

/* FEEDBACK */
router.get("/feedback-management", FeedbackController.getFeedback);
router.post("/update-header-feedback", FeedbackController.postUpdateHeader);
router.get("/add-feedback", FeedbackController.getAddFeedback);
router.post(
  "/add-feedback",
  upload.single("imagePath"),
  FeedbackController.postAddFeedback
);
router.get("/edit-feedback/:id", FeedbackController.getEditFeedback);
router.post(
  "/edit-feedback/:id",
  upload.single("imagePath"),
  FeedbackController.postEditFeedback
);
router.get("/delete-feedback/:id", FeedbackController.getDeleteFeedback);

/* How it works */
router.get("/hiw-management", HIWController.getFeatures);
router.post(
  "/update-header-hiw",
  upload.single("imagePath"),
  HIWController.postUpdateHeader
);
router.get("/hiw-add-feature", HIWController.getAddFeature);
router.post(
  "/hiw-add-feature",
  upload.single("imagePath"),
  HIWController.postAddFeature
);
router.get("/hiw-edit-feature/:id", HIWController.getEditFeature);
router.post(
  "/hiw-edit-feature/:id",
  upload.single("imagePath"),
  HIWController.postEditFeature
);
router.get("/hiw-delete-feature/:id", HIWController.getDeleteFeature);

/* Awesomes */
router.get("/awesome-management", AwesomeController.getFeatures);
router.post("/update-header-awesome", AwesomeController.postUpdateHeader);
router.get("/awesome-add-feature", AwesomeController.getAddFeature);
router.post("/awesome-add-feature", AwesomeController.postAddFeature);
router.get("/awesome-edit-feature/:id", AwesomeController.getEditFeature);
router.post("/awesome-edit-feature/:id", AwesomeController.postEditFeature);
router.get("/awesome-delete-feature/:id", AwesomeController.getDeleteFeature);

/* Config Page */
router.get("/config-page", isAdmin, ConfigController.getConfig);
router.post(
  "/config-page/:id",

  isAdmin,
  ConfigController.postConfig
);

/* User */
router.get("/user-management", UserController.getListUser);
router.get("/add-user", UserController.getAddUser);
router.post("/add-user", upload.single("avatar"), UserController.postAddUser);
router.post("/update-information/:id", UserController.postChangeInformation);
router.post("/change-password", UserController.postChangePassword);
router.get("/edit-user/:id", UserController.getEditUser);
router.post(
  "/edit-user/:id",
  upload.single("avatar"),
  UserController.postEditUser
);
router.get("/delete-user/:id", UserController.getDeleteUser);
router.post("/users/support", UserController.setSupport);

/* Blog-Category */
router.get(
  "/blog-category",

  BlogCategoryController.getBLogCategory
);
router.post("/add-blog-category", BlogCategoryController.postAddBlogCategory);
router.get(
  "/edit-blog-category/:id",
  BlogCategoryController.getEditBlogCategory
);
router.post(
  "/edit-blog-category/:id",
  BlogCategoryController.postEditBlogCategory
);
router.post(
  "/delete-blog-category/:id",
  BlogCategoryController.postDeleteBlogCategory
);

/* Blog-Tag */
router.get("/blog-tag", BlogTagController.getBLogTag);
router.post("/add-blog-tag", BlogTagController.postAddBlogTag);
router.get("/delete-blog-tag/:id", BlogTagController.getDeleteBlogTag);

/* Blog-Post */
router.get("/blog-post-management", BlogPostController.getBlogPost);
router.post("/update-header-blog", BlogPostController.postUpdateHeader);
router.get("/add-blog-post", BlogPostController.getAddBlogPost);
router.post(
  "/add-blog-post",
  upload.single("imagePath"),
  BlogPostController.postAddBlogPost
);
router.get("/edit-blog-post/:id", BlogPostController.getEditBlogPost);
router.post(
  "/edit-blog-post/:id",
  upload.single("imagePath"),
  BlogPostController.postEditBlogPost
);
router.get("/delete-blog-post/:id", BlogPostController.getDeleteBlogPost);

/* Video-Area */
router.get("/video-management", VideoController.getVideo);
router.post("/update-header-video", VideoController.postUpdateHeader);

/* ABA */
router.get("/documents", abaController.getABA);
router.post("/documents", abaController.postDocument);
router.get("/watch-aba/:id", abaController.getDeduction);
router.post("/delete-aba", abaController.postDeduction);

/* Transactions */
router.get("/transactions", transactionsController.getTransactions);
router.post("/excel", transactionsController.createFileExcel);
router.post("/pdf", transactionsController.createFilePdf);

/* Settings */
router.get("/settings", isAdmin, settingsController.getSettings);
router.post("/settings", isAdmin, settingsController.postSettings);
router.post(
  "/general-settings",

  isAdmin,
  validateFormAba.validateFee,
  settingsController.postGeneralSettings
);
router.post(
  "/general-settings-rate",

  isAdmin,
  settingsController.postGeneralSettingsRate
);

/* Retailer */
router.get("/retailers", isAdmin, checkPermissions, retailerController.getRetailers);
router.get("/retailer", retailerController.getAddRetailer);
router.post("/retailer", retailerController.postAddRetailer);
router.get("/retailer/:id", retailerController.getRetailerDetail);
router.post("/retailer/:id", retailerController.postEditRetailer);
router.post("/delete-retailer", retailerController.deletteRetailer);

/* Lender */
router.get("/lenders", isAdmin, checkPermissions, LenderController.getLenders);
router.get("/lender", isAdmin, LenderController.addLender);
router.get(
  "/settings/supper-lender",

  isAdmin,
  LenderController.addLenderSupper
);
router.post("/lender", CompanyController.updateLender);

router.post("/add-lender", LenderController.newLender);
router.post("/add-supper-lender", LenderController.newSupperLender);
router.post(
  "/get-lenders-company",

  LenderController.getListLenderCompany
);
router.post("/get-lenders", LenderController.getListLenders);
router.get("/lenders/:id", LenderController.deleteLender);
router.put("/lenders/:id", LenderController.changeStatus);
router.post(
  "/update-lender-link-company",

  LenderController.updateLenderLinkCompany
);

router.get("/edit-lender/:id", LenderController.getInfoLender);
router.post("/edit-lender/:id", LenderController.editLender);
router.get("/lender/:id", LenderController.getLender);

router.post("/financial", LenderController.getFinancialDetail);
router.post("/mWallet", LenderController.getAllmWallet);
router.post("/mWallet/:id", LenderController.addmWallet);
router.put("/mWallet/:id", LenderController.paymentOnmWallet);

router.post("/check-key-test", LenderController.checkKeyMonoovaTest);
router.post("/check-key-live", LenderController.checkKeyMonoovaLive);

router.post("/lender-link-company", LenderController.getLenderLinkCompany);
/* kyc */
router.post("/kyc/:id", CompanyController.setKYC);

/* Reconcile */
router.post(
  "/get-reconciles",

  MonoovaTransactionController.getReconciles
);
router.post(
  "/monoova-reconciles",

  MonoovaTransactionController.getReconcilesTabMonoova
);
router.put(
  "/update-reconcile",

  MonoovaTransactionController.updateReconcile
);
router.post(
  "/sync-monoova-transactions/:id",

  MonoovaTransactionController.syncMonoovaTransactions
);

router.post("/pay-cycle-summary", MonoovaTransactionController.getPayCycleSummary);

// Chat
router.get("/conversations", ChatController.getListConversation);
router.get("/conversationsif/:id", ChatController.getListConversationIframe);
router.get("/conversations/:id", ChatController.getConversation);
router.get("/s-conversations/:company_id/:id", ChatController.getAdminConversation);
router.get("/con-get-avatar/:id", ChatController.getAvatarStaff);

// Notifications
router.get("/notifications", UserController.notifications);
router.post("/get-notifications", UserController.getAllNotifications);
router.post("/notifications", UserController.postNotifications);

// Logs
router.get("/logs/registration", logsController.getRegistration);
router.post(
  "/logs/registration",

  logsController.getRegistrationApi
);
router.get("/logs/rate", logsController.getRate);
router.post("/logs/rate", logsController.getRateApi);
router.get("/user-logs", UserController.usersLog);
router.post("/user-logs", UserController.postUsersLogs);
router.get("/error-code", ErrorCodeController.getErrorCodes);
router.post("/error-code", ErrorCodeController.postErrorCodes);

// Groups
router.get('/groups', isAdmin, groupsController.getGroups);
router.get('/group', isAdmin, groupsController.getAddGroup);
router.get('/groups/:id', isAdmin, groupsController.getDetailGroup);
router.get('/group/:id', isAdmin, groupsController.getEditGroup);
router.post('/group/:id/auth', groupsController.setGroupId);
router.post('/api-groups', isAdmin, groupsController.getListGroup);
router.post('/api-managers', isAdmin, groupsController.getManagers);
router.post('/api-companies', isAdmin, groupsController.getCompaniesToAddGroup);
router.post('/group', isAdmin, upload.single('logoGroup'), groupsController.postAddGroup);
router.post('/group/:id', isAdmin, upload.single('logoGroup'), groupsController.postEditGroup);
router.put('/group/:id', isAdmin, groupsController.changeStatusGroup);

module.exports = router;
