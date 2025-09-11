const express = require('express');
const app = express();
const cors = require('cors');

const ApiBanner = require('../controllers/web-admin/api/banner.controller');
const ApiConfig = require('../controllers/web-admin/api/config.controller');
const ApiHeader = require('../controllers/web-admin/api/header.controller');
const ApiFeature = require('../controllers/web-admin/api/feature.controller');
const ApiAbout = require('../controllers/web-admin/api/about.controller');
const ApiFunFact = require('../controllers/web-admin/api/funfact.controller')
const ApiScreenShot = require('../controllers/web-admin/api/screenshot.controller');
const ApiTeam = require('../controllers/web-admin/api/team.controller');
const ApiFeedBack = require('../controllers/web-admin/api/feedback.controller');
const ApiPricing = require('../controllers/web-admin/api/pricing.controller');
const ApiFaq = require('../controllers/web-admin/api/faq.controller');
const ApiDownload = require('../controllers/web-admin/api/download.controller');
const ApiBlogPost = require('../controllers/web-admin/api/blog.controller');
const ApiContact = require('../controllers/web-admin/api/contact.controller');

app.get('/banner', cors(), ApiBanner.getBanner);
app.get('/header', cors(), ApiHeader.getHeader);
app.get('/feature', cors(), ApiFeature.getFeature);
app.get('/hiw', cors(), ApiFeature.getHiw);
app.get('/awesome', cors(), ApiFeature.getAwesome);
app.get('/config', cors(), ApiConfig.getConfig);
app.get('/about', cors(), ApiAbout.getAbout);
app.get('/funfact', cors(), ApiFunFact.getFunFact);
app.get('/screenshot', cors(), ApiScreenShot.getScreenShot);
app.get('/team', cors(), ApiTeam.getTeam);
app.get('/feedback', cors(), ApiFeedBack.getFeedback);
app.get('/pricing', cors(), ApiPricing.getPricing);
app.get('/faq', cors(), ApiFaq.getFaq);
app.get('/download', cors(), ApiDownload.getDownload);
app.get('/blog', cors(), ApiBlogPost.getBLogPost);
app.get('/search',cors(), ApiBlogPost.getSearchPost);
app.post('/contact', cors(), ApiContact.postContact);

module.exports = app;
