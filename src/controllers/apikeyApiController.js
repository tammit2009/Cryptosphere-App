/* ApiKey API Controller */

// Dependencies
const asyncHandler = require('express-async-handler');

const User = require('../models/user');
const helpers = require('../utils/helpers');

// ===========================================================================
// Generate an API Key (user has to be logged in)
// ---------------------------------------------------------------------------
// Method: 'GET', url = '/api/v1/apikey/generate', Access: 'Private'
// ===========================================================================
const generateApiKey = asyncHandler(async (req, res) => {
    if (!req.user) return res.status(403).json({ error: `Forbidden: you are not logged in.` });

    let today = new Date().toISOString().split('T')[0];  // Today string

    const apiKey = helpers.generateApiKey();
    const hashedApiKey = helpers.hash(apiKey);
    console.log(hashedApiKey);

    // Update the user with a new apiKey
    const user = await User.findById(req.user._id);
    user.developer = {
        api_key: hashedApiKey,
        hosts: [req.headers.host],  // requester's hostname
        usage: [{ date: today, count: 0 }]
    };

    await user.save();

    // Send Info Email to Developer
    
    res.json({ apiKey }); // send the plain (unhashed apikey)
}); 


module.exports = { 
    generateApiKey,
};