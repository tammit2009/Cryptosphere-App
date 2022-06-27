/* Web Routes */

// Dependencies
const express = require('express');
const router = express.Router();
const passport = require('passport');
const passportConf  = require('../middleware/passport');

const ROLES = require('../../config/rolesList');

const { webAuth, webAdminRole, webVerifyRoles } = require('../middleware/auth.js');

const { 
    getIndexPage,
    getAboutPage,
    getCryptocurrencies,
    getCryptoDetails,
    getCryptoNews,
    getTradingIndex,
    getAdmin,
    webProfilePage,
    webProfileEditPage,
    webPostProfileEditPage,
    getSettingsPage,
    getUnauthorizedPage,
    getUnknownPage,
    webLoginPage,
    webRegisterPage, 
    webPostRegisterPage,
    webLogoutUser,
} = require('../controllers/webController.js');

// routes
router.get('/',                 getIndexPage);
router.get('/about',            getAboutPage);
router.get('/cryptocurrencies', getCryptocurrencies);
router.get('/cryptodetails',    getCryptoDetails);
router.get('/cryptonews',       getCryptoNews);
router.get('/cryptotrading',    webAuth, getTradingIndex);
router.get('/admin',            webAuth, webAdminRole, getAdmin);  // webVerifyRoles(ROLES.Admin)
router.get('/settings',         webAuth, webAdminRole, getSettingsPage);

router.get('/exceptions/401',   getUnauthorizedPage);
router.get('/exceptions/404',   getUnknownPage);

router
    .route('/login')
        .get(webLoginPage)
        .post( 
            // use Passport middleware for actual login
            passport.authenticate('local-login', {
                successRedirect: '/cryptotrading',
                failureRedirect: '/login',
                failureFlash: true }));
router
    .route('/register')
        .get(webRegisterPage)
        .post(webPostRegisterPage);
router.get('/profile',             webAuth, webProfilePage); // can also use "passportConf.isAuthenticated" here instead
router
    .route('/profile/edit')
        .get(webProfileEditPage)
        .post(webPostProfileEditPage);
router.get('/logout', webLogoutUser);

// Exports
module.exports = router;