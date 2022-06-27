
/* API Routes */

// Dependencies
const express   = require('express');
const router    = express.Router();
const rateLimit = require('express-rate-limit');

const { auth, verifyRoles, adminRole, validateApiKey } = require('../middleware/auth.js');
const ROLES    = require('../../config/rolesList');

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const REQUESTS_PER_MS = 2;

// auto rate limiter (if required)
const developerLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES,
    max: REQUESTS_PER_MS,
    message: 'Too many requests, please try again after an 15 minutes',
});

/*
 * Role Routes
 */
const { 
    createRole, listRoles, getRole, updateRole, deleteRole
} = require('../controllers/rolesApiController.js');

router
    .route('/roles')
        .get(listRoles)             
        .post(createRole);
router
    .route('/roles/:id')
        .get(getRole)             
        .patch(updateRole)
        .delete(deleteRole);  


/*
 * Group Routes
 */
const { 
    createGroup, listGroups, getGroup, updateGroup, deleteGroup, groupAddRole, groupRemoveRole, 
} = require('../controllers/groupsApiController.js');

router
    .route('/groups')
        .get(listGroups)             
        .post(createGroup);
router
    .route('/groups/roles')
        .post(groupAddRole)     
        .delete(groupRemoveRole)  
router
    .route('/groups/:id')
        .get(getGroup)             
        .patch(updateGroup)
        .delete(deleteGroup);   


/*
 * User Routes
 */
const { 
    createUser, listUsers, getUser, updateUser, deleteUser, getMyProfile, updateMyProfile, 
    deleteMyProfile, loginUser, logoutUser, tokenRefresh
} = require('../controllers/usersApiController.js');

router
    .route('/users')
        .get(auth, adminRole, listUsers)  // .get(auth, verifyRoles(ROLES.Admin), listUsers)
        .post(createUser);
router  .post('/users/login', loginUser);
router  .post('/users/logout', auth, logoutUser);
router
    .route('/users/me')
        .get(auth, getMyProfile)
        .patch(auth, updateMyProfile)
        .delete(auth, deleteMyProfile);  
router
    .route('/users/profile/:id')
        .get(auth, getUser)   
        .patch(auth, updateUser);
router
    .route('/users/:id')
        .delete(auth, deleteUser);

// Refresh Token Route
router
    .route('/users/token-refresh')
        .get(tokenRefresh);         // uses httpOnly cookie


/*
 * Keystore Routes
 */
const { 
    addKeystoreEntry, listKeystoreEntries, getKeystoreEntry, updateKeystoreEntry, deleteKeystoreEntry
} = require('../controllers/keystoreApiController.js');

router
    .route('/keystore')
        .get(auth, listKeystoreEntries)  
        .post(auth, addKeystoreEntry);
router
    .route('/keystore/:id')
        .get(auth, getKeystoreEntry)   
        .patch(auth, updateKeystoreEntry)
        .delete(auth, deleteKeystoreEntry);


/*
 * ApiKey Routes
 */
const {
    generateApiKey
} = require('../controllers/apikeyApiController.js');

router
    .route('/apikey/generate')
        .get(auth, generateApiKey);


/*
 * Resources Routes - demo ApiKey management
 */

const { 
    listCheeses, addCheese, updateCheese, deleteCheese,
} = require('../controllers/resourcesApiController.js');

// Apply auto rate limiting to everything after this line
// router.use(developerLimiter);

router
    .route('/resources/cheeses')
        .get(validateApiKey, listCheeses) 
        .post(validateApiKey, addCheese);
router
    .route('/resources/cheeses/:id')
        .put(validateApiKey, updateCheese)
        .delete(validateApiKey, deleteCheese);


// Exports
module.exports = router;

