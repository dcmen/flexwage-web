const express = require('express');
const router = express.Router();

const UserController = require('../controllers/web-admin/user.controller');
const StaffController = require('../controllers/web-admin/staff.controller');
const BusinessController = require('../controllers/web-admin/business.controller');
const CompanyController = require('../controllers/web-admin/company.controller'); 
const CompanyControllerV1 = require('../controllers/web-admin/companyv1.controller'); 
const BankInfoController = require('../controllers/web-admin/bank.controller');
const TransactionController = require('../controllers/web-admin/transactions.controller');
const paymentSystemsController = require('.././controllers/web-admin/paymentSystem.controller.js')
const AdminController = require('../controllers/web-admin/admin.controller');
const { companyEntityQuery } = require('../controllers/web-admin/astute.controller');
const { userAuthorized } = require('../controllers/web-admin/hr3.controller');
const { validateParamAPIUserAuthorized } = require('../validates/hr3.validate');

const checkToken = require('../middleware/checkToken');

router.get('/console/login', UserController.getLogin);
router.post('/console/login', UserController.postLogin);
router.get('/login', UserController.getLogin);
router.post('/login', UserController.postLogin);
router.get('/my/login', UserController.getChooseStaff);
router.post('/my/login', UserController.postChooseStaff);

router.get('/console/register', UserController.getRegister);
router.post('/console/register', UserController.postRegister);

// Payment Systems
router.post('/add-payment-systems', paymentSystemsController.addNewPaymentSystems)
router.get('/get-payment-systems', paymentSystemsController.getPaymentSystems)
router.put('/update-payment-system-id', paymentSystemsController.updatePaymentSystemsId)
router.get('/get-all-companies', paymentSystemsController.getAllCompanies)
router.put('/update-country-currency-language-for-company', paymentSystemsController.updateCountryLanguageCurrencyForCompany)
router.post('/export-excel-file-transaction', paymentSystemsController.exportExcelFile)
router.post('/get-payment-system-by-id', paymentSystemsController.getPaymentSystemsById)

const csrf = require('csurf');
const csrfProtection = csrf();

router.use(csrfProtection);

router.get('/signup', UserController.getSignUp);
router.post('/signup', UserController.postSignUp);

router.get('/', UserController.getSignIn);
router.post('/signin', UserController.postSignIn);
router.get('/check2fa', UserController.check2fa)
router.post('/get-otp-login', UserController.getOTPLogin)
router.post('/post-otp-login', UserController.postOTPLogin)

router.post('/get-user-profile', UserController.getUserProfile);
router.post('/change-password', UserController.changePassIsFirstLogin);

router.get('/forgot-password', UserController.getForgotPassword);
router.post('/forgot-password', UserController.postForgotPassword);
router.get('/otp-forgot-password', UserController.getOTPForgotPassword);
router.post('/otp-forgot-password', UserController.postOTPForgotPassword);
router.get('/create-new-password', UserController.getCreateNewPassword);
router.post('/create-new-password', UserController.postCreateNewPassword);
router.post("/createAdminPassword", AdminController.createAdminPassword);

router.post('/get-deductionFile', UserController.getDeductionFile);
router.post('/get-deductionFile-detail', UserController.getDeductionFileDetail);
router.post('/get-deductionFileById', UserController.getDeductionFileById);
router.post('/one-pay-period', UserController.onePayPeriod);
router.post('/get-feedback', UserController.getFeedback);
router.post('/get-transactions', TransactionController.getDataTransactions);
router.post('/create-aba', TransactionController.getCreateABA);
router.post('/get-bank', TransactionController.getBank);
router.post('/get-companies', UserController.getCompanies);
router.get('/get-pay-period', UserController.getPeriod);
router.post('/deduction/undo', CompanyController.undoDeduction);
// test

router.post('/get-data-export-excel', TransactionController.getDataExportExcel);
router.post('/import-data-from-excel', TransactionController.importDataFromExcelFile);

//wallet
router.post('/get-wallet', UserController.getWallet);
router.post('/wallet/excel', CompanyController.createWalletFileExcel);
router.post('/wallet/pdf', CompanyController.createWalletFilePDF);
//signup
router.post('/get-OTPCode', UserController.getOTPCode);
router.post('/send-OTPCode', UserController.sendOTPCode);
router.post('/send-activationCode', UserController.sendActiveCode);
router.post('/resend-activationCode', UserController.resendActiveCode);
router.post('/get-systemList', UserController.getSystemList);
router.post('/update-company-refreshToken', UserController.updateCompanyRefreshToken);
router.post('/sync-payroll', UserController.syncPayrollData);
//XERO
router.get('/xero', UserController.getViewLoginXero);
router.post('/xero', UserController.getAccessTokenXero);
router.post('/xero-get-connections', UserController.getConnectionsXero);
router.post('/xero-get-profile', UserController.getUserProfileXero);
router.post('/xero-refresh_token', UserController.getRefreshTokenXero);
router.post('/xero-get-company', UserController.getCompanyInforXero);
router.post('/xero-get-employee', UserController.getEmployeesXero);
router.post('/xero-dis-connections', UserController.disConnectXero);
//KEYPAY
// router.get('/keypay', UserController.getKeyPay);
router.post('/keypay', UserController.postKeyPay);
router.post('/keypay-get-user', UserController.getUserPay);
router.post('/keypay-refresh-token', UserController.refreshTokenKeypay);
router.post('/keypay-get-business', UserController.getBusinessKeypay);
router.post('/keypay-get-employees', UserController.getEmployeesKeypay);
// approve timesheet in server KEYPAY
router.post('/keypay/approve', UserController.approveKeyPay);
router.post('/keypay/deduction-back-to-keypay', CompanyController.addDeductionsBackToKeyPayOnePayPeriodByEmployee);
//DEPUTY
router.post('/deputy', UserController.getAccessTokenDeputy);
router.post('/deputy-get-profile', UserController.getUserProfileLogin);
router.post('/deputy-get-company', UserController.getCompanyDeputy);
router.post('/deputy-get-employees', UserController.getEmployeeDeputy);
router.post('/deputy-refresh_token', UserController.refreshTokenDeputy);
//Staff management
router.post('/get-registered-staff', StaffController.getRegisterStaff);
router.post('/get-unregistered-staff', StaffController.getUnregisterStaff);
router.post('/send-invite-employee', StaffController.inviteStaff);
router.post('/invite-staffs', StaffController.getListStaffInvite);
//Approve Timesheet Systems
router.post('/system-get-timesheets', UserController.getTimesheets);
router.post('/system-approve-timesheet', UserController.approveTimesheet);
router.post('/system-accept-timesheetRequest', UserController.acceptRequest);
router.post('/system-reject-timesheetRequest', UserController.rejectRequest);
router.post('/system-requestRawForm', UserController.requestRawForm);
//pay period
router.post('/get-origination-pay-period', UserController.getOriginationPayPeriods);
router.post('/add-origination-pay-period', UserController.addOriginationPayPeriod);
router.post('/update-origination-pay-period', UserController.updateOriginationPayPeriod);
router.post('/delete-origination-pay-period', UserController.deleteOriginationPayPeriod);
router.post('/save-pay-cycle', StaffController.savePayCycle);
router.post('/sent-pay-period', StaffController.sentPayPeriod);
//setup payrun
router.post('/setup-payroll', CompanyController.setupPayroll);
router.post('/setup-bank',  CompanyController.setupBank);
router.post('/banks/:id', CompanyController.getBanks);
//get deduction scheduler
router.post('/get-deduction-scheduler', CompanyController.getDeductionScheduler);
router.post('/update-deduction-scheduler', CompanyController.updateDeductionScheduler);
//payrun setup xero
router.post('/get-accounts', CompanyController.getListAccounts);
router.post('/add-new-account', CompanyController.addNewAccount);
router.post('/get-deduction-category', CompanyController.getDeductionCate);
router.post('/add-deduction-category', CompanyController.addNewCategory);
//bank info
router.post('/post-bank', BankInfoController.postBank);
router.post('/get-funds', BankInfoController.getFunds);
// Address
router.get('/countries', UserController.getCountries);
router.get('/states', UserController.getStates);
router.get('/suburbs', UserController.getSuburbs);
router.get('/cities', UserController.getCities);
// chat type
router.post('/chat-type', CompanyController.addChatType);
// set staff_id
router.post('/staff/:id', function(req, res) {
    req.session.staff_id = req.params.id;
    req.session.role = req.body.role;
    return req.session.save(err => {
        if (err) console.log(err);
        res.send("OK");
    });
});
// get access token payroll
router.get('/access-token', UserController.getAccessTokenPayroll);

// RECKON
router.post('/reckon', UserController.getAccessTokenReckon);
router.post('/reckon/cashbooks', UserController.getCashbooksReckon);
router.post('/reckon/company-info', UserController.getCompanyInfoReckon);
// router.post('/reckon/approve', UserController.approveReckon);

router.get('/reckon/cashd-trial', UserController.reckonTrial);
router.post('/reckon/post-cashd-trial', UserController.postReckonTrial);
router.get('/reckon/cashd-onboarding/:id', UserController.reckonCashDRegister);
router.get('/downloads/terms-and-conditions/:valid_parameter', UserController.downloadTermsAndConditions);
router.post('/reckon/register-reckon-trial-company', UserController.registerReckonTrialCompany);
router.get('/reckon/direct-debit-form', UserController.getDirectDebitForm);
router.post('/reckon/direct-debit-form', UserController.postDirectDebitForm);
router.post('/employers', UserController.getEmployers);
router.post('/send-direct-debit-invite', UserController.sendDirectDebitFormInvitation);

// get BSB
router.get("/bsb/australia", CompanyController.getBSB);

// ASTUTE
router.post('/astute/company-entity-query', companyEntityQuery);

// HR3
router.post('/hr3/request-user-authorized', validateParamAPIUserAuthorized, userAuthorized);

// new
router.get('/get-cycles', CompanyControllerV1.getCycles);
router.get('/get-payroll-data', CompanyControllerV1.getPayrollData);
router.get("/get-total-registered", CompanyControllerV1.getTotalRegistered);
router.get("/get-total-unregistered", CompanyControllerV1.getTotalUnregistered);
router.get("/get-total-unaccepted-invitations", CompanyControllerV1.getTotalUnacceptedInvitations);

//business
router.post('/get-business', BusinessController.getBusiness);
router.post('/setup-fee-type', BusinessController.setupFeeTypeBusiness)



module.exports = router;
