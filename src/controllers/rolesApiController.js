
/* Role API Controller */

// Dependencies
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');

const Role = require('../models/role');

// ==============================================================
// Create a new role 
// --------------------------------------------------------------
// Method: 'POST', url = '/api/v1/roles', Access: 'Private/Admin'
// ==============================================================
const createRole = asyncHandler(async (req, res) => {
    const { rolename, ruid, description } = new Role(req.body);

    // Validate inputs
    if (!rolename || !ruid || !description) 
        throw createError(400, `Bad Request: Invalid Fields for Creation of New Role`);

    // Check and ensure ruid is unique
    const roleExists = await Role.findOne({ ruid });
    if (roleExists) {
        throw createError(400, `Role's ruid already exists`)
    }

    // Create and save the new role
    const role = await Role.create({ rolename, ruid, description });
    await role.save();

    res.status(201).json(role);  
}); 


// ==============================================================
// List all roles 
// --------------------------------------------------------------
// Method: 'GET', url = '/api/v1/roles', Access: 'Private/Admin'
// Parameterized:
// - Pagination: GET /roles?limit=10&skip=10
// - Sort:       GET /roles?sortBy=createdAt:desc
// ==============================================================
const listRoles = asyncHandler(async (req, res) => {
    const sort = {};

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    const roles = await Role.find({}, null, {
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        skip: req.query.skip ? parseInt(req.query.skip) : 0,
        sort
    }); 

    res.json(roles);                                                                         
}); 


// =================================================================
// View a Specific role 
// -----------------------------------------------------------------
// Method: 'GET', url = '/api/v1/roles/:id', Access: 'Private/Admin'
// =================================================================
const getRole = asyncHandler(async (req, res) => {
    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const role = await Role.findOne({ _id });
    if (!role) {
        return res.status(404).json({ error: `Role not found` });
    }
    res.json(role);                         
}); 


// ===================================================================
// Update a specific role 
// -------------------------------------------------------------------
// Method: 'PATCH', url = '/api/v1/roles/:id', Access: 'Private/Admin'
// ===================================================================
const updateRole = asyncHandler(async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['rolename', 'ruid', 'description'];

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        throw createError(400, `Bad Request: Invalid Fields for Update`);    
    }

    try {
        const role = await Role.findOne({ _id: req.params.id });   
        if (!role) {
            throw createError(404, `Not Found`);  
        }

        updates.forEach((update) => role[update] = req.body[update]);
        await role.save();
        res.send(role);                         
    } catch (err) {
        throw createError(400, err.message);   
    }
}); 


// ===================================================================
// Delete a specific role
// -------------------------------------------------------------------
// Method: 'DELETE', url = '/api/v1/roles/:id', Access: 'Private/Admin'
// ===================================================================
const deleteRole = asyncHandler(async (req, res) => {

    // TODO: find all groups with this role and delete the role from the group

    const role = await Role.findOneAndDelete({ _id: req.params.id });
    if (!role) {
        throw createError(404, `Not Found`);                    
    }
    res.send(role);
}); 


module.exports = { 
    createRole,
    listRoles,
    getRole,
    updateRole,
    deleteRole
};