/* Workspace Controller */

const asyncHandler  = require('express-async-handler');


// View the Index page
// Method: 'GET', url = '/workspace', Access: 'Private'
const getWorkspaceRoot = asyncHandler(async (req, res, next) => {

    const data = {
        user: req.user,
        roles: (req.user) ? await req.user.getRuids() : [],
        layout: 'layouts/workspace'
    };

    res.render('workspace/index', data); 
}); 

module.exports = { 
    getWorkspaceRoot,
};