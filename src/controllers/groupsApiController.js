
/* Role API Controller */

// Dependencies
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');

const Group = require('../models/group');
const Role = require('../models/role');

// ===============================================================
// Create a new group 
// ---------------------------------------------------------------
// Method: 'POST', url = '/api/v1/groups', Access: 'Private/Admin'
// ===============================================================
const createGroup = asyncHandler(async (req, res) => {
    const { groupname, description } = new Group(req.body);

    // Validate inputs
    if (!groupname || !description) 
        throw createError(400, `Bad Request: Invalid Fields for Creation of New Group`);

    // Check and ensure ruid is unique
    const groupExists = await Group.findOne({ groupname });
    if (groupExists) {
        throw createError(400, `Group name already taken`)
    }

    // Create and save the new group
    const group = await Group.create({ groupname, description });
    await group.save();

    res.status(201).json(group);  
}); 


// =====================================================================
// Add Role to Group 
// ---------------------------------------------------------------------
// Method: 'POST', url = '/api/v1/groups/roles', Access: 'Private/Admin'
// =====================================================================
const groupAddRole = asyncHandler(async (req, res) => {
    const { groupid, roleid } = req.body;

    const group = await Group.findOne({ _id: groupid });
    const role = await Role.findOne({ _id: roleid });
    if (!group || !role) {
        return res.status(404).json({ error: `Group or role not found.`});     
    }

    // Check if the role or group already exists in either collection
    const roleExists = group.roles.includes(role._id);
    if (roleExists) {
        return res.status(400).json({ error: `Role already exists in group.`});  
    }

    group.roles = group.roles.concat(role._id);
    await group.save();

    // res.status(200).send({ message: role.rolename + ' added to group ' + group.groupname });
    res.sendStatus(204);    // No Content
}); 


// =======================================================================
// Remove Role to Group 
// -----------------------------------------------------------------------
// Method: 'DELETE', url = '/api/v1/groups/roles', Access: 'Private/Admin'
// =======================================================================
const groupRemoveRole = asyncHandler(async (req, res) => {
    const { groupid, roleid } = req.body;

    const group = await Group.findOne({ _id: groupid });
    const role = await Role.findOne({ _id: roleid });
    if (!group || !role) {
        return res.status(404).json({ error: `Group or role not found.`});    
    }

    // Check if the role exists in the group
    const roleExists = group.roles.includes(role._id);
    if (!roleExists) {
        return res.status(400).json({ error: `Role does not exist in group.`});   
    }

    group.roles = group.roles.filter((roleid) => !roleid.equals(role._id));
    await group.save();

    // res.status(200).send({ message: role.rolename + ' removed from group ' + group.groupname });
    res.sendStatus(204);    // No Content 
}); 


// ==============================================================
// List all groups  
// --------------------------------------------------------------
// Method: 'GET', url = '/api/v1/groups', Access: 'Private/Admin'
// Parameterized:
// - Pagination: GET /groups?limit=10&skip=10
// - Sort:       GET /groups?sortBy=createdAt:desc
// ==============================================================
const listGroups = asyncHandler(async (req, res) => {
    const sort = {};

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    const groups = await Group.find({}).populate({
        path: 'roles',
        options: {
            limit: req.query.limit ? parseInt(req.query.limit) : 10,
            skip: req.query.skip ? parseInt(req.query.skip) : 0,
            sort
        }
    });  

    res.json(groups);                                                                         
}); 


// ==================================================================
// View a Specific group 
// ------------------------------------------------------------------
// Method: 'GET', url = '/api/v1/groups/:id', Access: 'Private/Admin'
// ==================================================================
const getGroup = asyncHandler(async (req, res) => {
    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const group = await Group.findOne({ _id });
    if (!group) {
        return res.status(404).json({ error: `Group not found` });
    }
    res.json(group);                         
}); 


// ====================================================================
// Update a specific group 
// --------------------------------------------------------------------
// Method: 'PATCH', url = '/api/v1/groups/:id', Access: 'Private/Admin'
// ====================================================================
const updateGroup = asyncHandler(async (req, res) => {
    const updates = Object.keys(req.body);

    // TODO: if the groupname is being changed, ensure the new name does not already exist

    const allowedUpdates = [/*'groupname',*/ 'description', 'roles'];

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        throw createError(400, `Bad Request: Invalid Fields for Update`);    
    }

    try {
        const group = await Group.findOne({ _id: req.params.id });  
        if (!group) {
            return res.status(404).json({ error: `Group not found` });  
        }

        updates.forEach((update) => group[update] = req.body[update]);
        await group.save();
        res.json(group);                         
    } catch (err) {
        throw createError(400, err.message);   
    }
}); 


// =====================================================================
// Delete a specific group
// ---------------------------------------------------------------------
// Method: 'DELETE', url = '/api/v1/groups/:id', Access: 'Private/Admin'
// =====================================================================
const deleteGroup = asyncHandler(async (req, res) => {
    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const group = await Group.findOneAndDelete({ _id });
    if (!group) {
        return res.status(404).json({ error: `Group not found` });                    
    }
    res.json(group);
}); 


module.exports = { 
    createGroup,
    listGroups,
    groupAddRole,
    groupRemoveRole,
    getGroup,
    updateGroup,
    deleteGroup
};