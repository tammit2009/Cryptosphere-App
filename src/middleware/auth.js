/*
 * Authentication Middleware
 *
 */

// Dependencies
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
// const createError = require('http-errors');
// const passport = require('passport');

const allowedOrigins = require('../../config/allowedOrigins'); // whitelist
const helpers = require('../utils/helpers');

const ROLES = require('../../config/rolesList');

const MAX = process.env.API_MAX || 5;          // manual rate limiter max

const User = require('../models/user');
const Group = require('../models/group');
// const passportConf  = require('../middleware/passport');

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) 
        return res.status(403).send({ error: 'Invalid Token. Please authenticate.'});

    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) 
                return res.status(403).send({ error: 'Invalid Token. Please authenticate.'}); // invalid token
            
            const user = await User.findOne({ _id: decoded.userInfo._id });
            if (!user) 
                return res.status(404).send({ error: 'Invalid Token. Please authenticate.'});
            
            const roles = decoded.userInfo.roles.map(role => role.ruid);
            ////////////////////////////////////////////////

            // set user data from token into request object
            req.user = user;
            req.roles = roles

            ////////////////////////////////////////////////
            next();
        }
    )
};

// Set this 'Access-Control-Allow-Credentials' header in response (CORS requirement)
const credentials = (req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Credentials', true); 
    } 
    next();
};

// Check that the account has the listed 'allowedRoles'
const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req?.roles) return res.sendStatus(401); // not allowed

        const rolesArray = [...allowedRoles];

        // console.log(rolesArray);
        // console.log(req.roles);

        const result = req.roles
            .map(role => rolesArray.includes(role))
            .find(val => val === true);

        // Fail
        if (!result) return res.sendStatus(401);

        next();
    }
}; 

// Validate API Key
const validateApiKey = async (req, res, next) => {
    // let host = req.headers.host;

    // Where is the API key expected to be?
    // let api_key = req.query.api_key;      // version 1: with the querystring
    // let api_key = req.params.apikey;      // version 2: with the URL params
    let api_key = req.header('x-api-key');   // version 3: using a header

    const account = await User.findOne({ 'developer.api_key' : helpers.hash(api_key) });
    if (account) {
        // check the usage
        let today = new Date().toISOString().split('T')[0];
        let usageIndex = account.developer.usage.findIndex((day) => day.date == today);
        if (usageIndex >= 0) {
            // already used today
            if (account.developer.usage[usageIndex].count >= MAX) {
                // stop and respond
                res.status(429).send({
                    error: {
                        code: 429,
                        message: 'Max API calls exceeded.',
                    },
                });
            } else {
                // have not hit todays max usage
                account.developer.usage[usageIndex].count++;
                await account.save();
                // console.log('Good API call', account.developer.usage[usageIndex]);
                next();
            }
        } else {
            // not today yet
            account.developer.usage.push({ date: today, count: 1 });
            await account.save();
            // ok to use again
            next();
        }
    } 
    else {
        // stop and respond
        res.status(403).send({ error: { code: 403, message: 'You not allowed.' } });
    }
};

// using passport
const webAuth = async (req, res, next) => {

    // next();

    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');  
};

const adminRole = asyncHandler(async (req, res, next) => {
    // req.user & req.roles should already exist
    const result = req.roles.find(role => role === ROLES.Admin);
    if (!result) 
        return res.status(401).json({ error: 'Not authorized as an admin' });  // throw createError(401, 'Not authorized as an admin');
    else 
        next();
});

const webAdminRole = asyncHandler(async (req, res, next) => {
    // req.user should already exist
    if (req.user) {
        // Get the list of all available roles
        const group = await Group.findOne({ _id: req.user.group }).populate({ path: 'roles' });
        const roles = Object.values(group.roles).map(role => role.ruid);

        const result = roles.find(role => role === ROLES.Admin);
        if (!result) 
            res.redirect('/exceptions/401');  // Unauthorized Page
        else 
            next();
    }
    else { // should not get here if 'webAuth' precedes this.
        console.log('not logged in')
        res.redirect('/login');  // Not logged in
    }
});

// Check that the account has the listed 'allowedRoles'
const webVerifyRoles = (...allowedRoles) => {
    return async (req, res, next) => {

        // req.user should already exist
        if (req.user) {
            // Get the list of all available roles
            const group = await Group.findOne({ _id: req.user.group }).populate({ path: 'roles' });
            const roles = Object.values(group.roles)
                                .map(role => role.ruid);

            const rolesArray = [...allowedRoles];

            // console.log(rolesArray);
            // console.log(roles);
    
            const result = roles
                .map(role => rolesArray.includes(role))
                .find(val => val === true);
    
            if (!result) { // No match
                // console.log('role not matched')
                res.redirect('/exceptions/401');  
            }
            else {
                // console.log('role matched')
                next();
            }
        }
        else { // should not get here if 'webAuth' precedes this.
            console.log('not logged in')
            res.redirect('/login');  // Not logged in
        }
    }
}; 

module.exports = { 
    auth, 
    credentials, 
    verifyRoles, 
    validateApiKey, 
    webAuth, 
    adminRole, 
    webAdminRole,
    webVerifyRoles
};


// "protect" - for reference
// -------------------------

// const protect = asyncHandler(async (req, res, next) => {
//     let token;

//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//         try {
//             token = req.headers.authorization.split(' ')[1];
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             req.user = await User.findById(decoded.id).select('-password');
//             next();
//         }
//         catch (err) {
//             //console.error(err);
//             res.status(401);
//             throw new Error('Not authorized, token failed');
//         }
//     }

//     if (!token) {
//         res.status(401);
//         throw new Error('Not authorized, no token');
//     }
// });