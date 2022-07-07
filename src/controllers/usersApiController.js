
/* User API Controller */

// Dependencies
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Group = require('../models/group');

// ===============================================================
// Create/Register a new User 
// ---------------------------------------------------------------
// Method: 'POST', url = '/api/v1/users', Access: 'Public'
// ===============================================================
const createUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // Validate inputs
    if (!username || !email || !password) 
        throw createError(400, `Bad Request: Invalid Fields for Creation of New User`);

    // set default group initially
    const defaultGroup = await Group.findOne({ groupname: 'User' })
    if (!defaultGroup) {
        throw createError(500, `Server Error: Unable to Create User`)   
    }

    const userEmailExists = await User.findOne({ email });
    if (userEmailExists) {
        return res.status(400).json({ error: `Email already exists.`});   
    }

    const userNameExists = await User.findOne({ username });
    if (userNameExists) {
        return res.status(400).json({ error: `Username already exists.`});  
    }

    // Create and save the new user
    const user = await User.create({ username, email, password, group: [defaultGroup._id] });
    await user.save();
    
    const accessToken = await user.generateAccessRefreshToken(); // handles saving itself

    const refreshToken = user.refreshToken;  // refresh token already saved above ('generateAccessRefreshToken()')

    // Send refresh token in a httponly cookie which is not available to javascript (can only be accessed by the server)
    // Note: 'secure: true' is commented out for dev: it is required in production but will only work with https
    res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', /*secure: true,*/ maxAge: 24 * 60 * 60 * 1000 }); 

    // Send welcome email?
    // sendWelcomeEmail(user.email, user.username);

    // Filter out irrelevant or protected data
    const userData = user.getPrivateProfile();

    res.status(201).json({ user: userData, accessToken }); 
}); 


// ==============================================================
// List All Users  
// --------------------------------------------------------------
// Method: 'GET', url = '/api/v1/users', Access: 'Private/Admin'
// Parameterized:
// - Pagination: GET /groups?limit=10&skip=10
// - Sort:       GET /groups?sortBy=createdAt:desc
// ==============================================================
const listUsers = asyncHandler(async (req, res) => {
    const sort = {};

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    const users = await User.find({}).populate({
        path: 'group',
        options: {
            limit: req.query.limit ? parseInt(req.query.limit) : 10,
            skip: req.query.skip ? parseInt(req.query.skip) : 0,
            sort
        }
    });  

    res.json(users);                                                                         
}); 


// =========================================================================
// Fetch a specific user's details  
// -------------------------------------------------------------------------
// Method: 'GET', url = '/api/v1/users/profile/:id', Access: 'Private/Admin'
// =========================================================================
const getUser = asyncHandler(async (req, res) => {
    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    // const user = await User.findById(_id).select('-password');
    const user = await User.findById(_id);
    if (user) 
        res.json(user);                                 
    else 
        return res.status(404).json({ error: `User not found` });                           
}); 


// ===========================================================================
// Update a specific user's profile 
// ---------------------------------------------------------------------------
// Method: 'PATCH', url = '/api/v1/users/profile/:id', Access: 'Private/Admin'
// ===========================================================================
const updateUser = asyncHandler(async (req, res) => {
    
    // Handle properties that dont exist
    const updates = Object.keys(req.body);
    const allowedUpdates = ['profile', 'password', 'group'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    // Handle profile subdata
    const allowedProfileData = ['firstname', 'lastname', 'description', 'picture'];
    let isValidProfileData = true;
    if (updates.includes('profile')) {
        const profile_updates = Object.keys(req.body.profile);
        isValidProfileData = profile_updates.every((update) => allowedProfileData.includes(update));
    }

    if (!isValidOperation || !isValidProfileData) throw createError(400, `Invalid Updates!`); 

    const user = await User.findById(req.params.id).select('-password');

    if (user) {
        updates.forEach(update => user[update] = req.body[update]);
        await user.save();

        // TODO: 1. need to validate that group exists if change is required
        // TODO: 2. is there a need to clear and regenerate tokens?

        res.send(user);                                     
    }
    else {
        return res.status(404).json({ error: `User not found` });  
    }

}); 


// =====================================================================
// Delete a specific user
// ---------------------------------------------------------------------
// Method: 'DELETE', url: '/api/v1/users/:id', Access: 'Private/Admin'
// =====================================================================
const deleteUser = asyncHandler(async (req, res) => {
    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const user = await User.findById(req.params.id);
    if (user) {
        await user.remove();
        res.json({ message: 'User removed', user });
    }   
    else {
        return res.status(404).json({ error: `User not found.` });
    }
}); 


// =========================================================================
// Fetch this user's details   
// -------------------------------------------------------------------------
// Method: 'GET', url = '/api/v1/users/me', Access: 'Private'
// =========================================================================
const getMyProfile = asyncHandler(async (req, res) => {
    // req.user is injected from JWT after authentication
    if (!req.user) throw createError(400, `Bad Request`);

    const user = req.user;      
    if (user) 
        res.json(user);                                 
    else 
        return res.status(404).json({ error: `User not found` });                           
}); 


// ===========================================================================
// Update this user's profile 
// ---------------------------------------------------------------------------
// Method: 'PATCH', url = '/api/v1/users/me', Access: 'Private'
// ===========================================================================
const updateMyProfile = asyncHandler(async (req, res) => {
    // req.user is injected from JWT after authentication
    if (!req.user) throw createError(400, `Bad Request`);
    
    // Handle properties that dont exist
    const updates = Object.keys(req.body);
    const allowedUpdates = ['profile', 'password', 'group'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    // Handle profile subdata
    const allowedProfileData = ['firstname', 'lastname', 'description', 'picture'];
    let isValidProfileData = true;
    if (updates.includes('profile')) {
        const profile_updates = Object.keys(req.body.profile);
        isValidProfileData = profile_updates.every((update) => allowedProfileData.includes(update));
    }

    if (!isValidOperation || !isValidProfileData) throw createError(400, `Invalid Updates!`); 

    const user = await User.findById(req.params.id).select('-password');

    if (user) {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();

        // TODO: 1. need to validate that group exists if change is required
        // TODO: 2. is there a need to clear and regenerate tokens?

        res.send(req.user);                                      
    }
    else {
        return res.status(404).json({ error: `User not found` });  
    }
}); 


// =====================================================================
// Delete this user
// ---------------------------------------------------------------------
// Method: 'DELETE', url = '/api/v1/users/me', Access: 'Private'
// =====================================================================
const deleteMyProfile = asyncHandler(async (req, res) => {
    // req.user is injected from JWT after authentication
    if (!req.user) throw createError(400, `Bad Request`);

    await req.user.remove();
    res.json({ message: 'User removed', user: req.user });
}); 


// ==========================================================================
// Login a user 
// --------------------------------------------------------------------------
// Method: 'POST', url = '/api/v1/users/login', Access: 'Public'
// Note: Sensitive information is filtered with 'userSchema.methods.toJSON()' 
// ==========================================================================
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) 
        return res.status(400).json({ 'message': 'Username and password are required.' });

    const user = await User.findByCredentials(email, password);  // asyncHandler handles 'try/catch'
    
    // Generate refresh and access token
    const accessToken = await user.generateAccessRefreshToken();
    
    const refreshToken = user.refreshToken;  // refresh token already saved above 

    // Send refresh token in a httponly cookie which is not available to javascript (can only be accessed by the server)
    // Note: 'secure: true' is commented out for dev: it is required in production but will only work with https
    res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', /*secure: true,*/ maxAge: 24 * 60 * 60 * 1000 }); 

    // Filter out irrelevant or protected data
    const userData = user.getPrivateProfile();

    res.json({ user: userData, accessToken });   
}); 


// ==========================================================================
// Logout user 
// --------------------------------------------------------------------------
// Method: 'POST', url: '/api/v1/users/logout', Access: 'Private'
// ==========================================================================
const logoutUser = asyncHandler(async (req, res) => {

    // Note: On client, also delete the access token

    const cookies = req.cookies;
    if (!cookies.jwt) return res.sendStatus(204); // No content 

    const refreshToken = cookies.jwt;

    // is refresh token in db
    const foundUser = await User.findOne({ refreshToken });
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true });
        return res.sendStatus(204);  // No content 
    }
    
    // Delete the refresh token in db and save
    foundUser.refreshToken = '';
    await foundUser.save();

    // TODO: implement rotating token to properly effect immediate logout from server
        
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None'/*, secure: true*/ }); // on dev server; 'secure: true' is required but will only work with https
    
    res.sendStatus(204); // no content 
}); 


// ==========================================================================
// Refresh Token 
// --------------------------------------------------------------------------
// Method: 'GET', url: '/api/v1/users/token-refresh', Access: 'Public'
// ==========================================================================
const tokenRefresh = asyncHandler(async (req, res) => {
    
    const cookies = req.cookies;
    if (!cookies.jwt) return res.sendStatus(401);

    // Extract the refresh token from httpOnly cookie
    const refreshToken = cookies.jwt;

    // Search user db for the refreshToken found in cookie
    const foundUser = await User.findOne({ refreshToken });
    if (!foundUser) 
        return res.sendStatus(403); // Forbidden 

    // evaluate jwt 
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err || foundUser._id.toString() !== decoded._id) return res.sendStatus(403);

            const group = await Group.findOne({ _id: foundUser.group }).populate({ path: 'roles' });
            const roles = Object.values(group.roles);

            const accessToken = jwt.sign({   
                "userInfo": {
                    "_id": decoded._id,
                    "roles": roles
                }}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' }
            );
            res.json({ accessToken })
        }
    );  
}); 


module.exports = { 
    createUser,
    listUsers,
    getUser,
    updateUser,
    deleteUser,
    getMyProfile,
    updateMyProfile,
    deleteMyProfile,
    loginUser,
    logoutUser,
    tokenRefresh,
    // uploadAvatar,
    // deleteAvatar,
    // getAvatar
};