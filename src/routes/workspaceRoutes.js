/* MyProfile Routes */

// Dependencies
const express   = require('express');
const router    = express.Router();

const { 
    getWorkspaceRoot,
} = require('../controllers/workspaceController.js');

// routes
router.get('/', getWorkspaceRoot);  


// Exports
module.exports = router;