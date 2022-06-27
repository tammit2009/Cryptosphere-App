/* Keystore API Controller */

// Dependencies
const asyncHandler = require('express-async-handler');
const createError  = require('http-errors');
const crypto         = require('crypto');

const Keystore     = require('../models/keystore');
const helpers      = require('../utils/helpers');

// ==============================================================
// Add a new keystore entry 
// --------------------------------------------------------------
// Method: 'POST', url = '/api/v1/keystore', Access: 'Private'
// ==============================================================
const addKeystoreEntry = asyncHandler(async (req, res) => {
    const owner = req.user;
    if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    // Get inputs
    const { key, val, description, addInfo } = req.body;

    // Validate mandatory inputs
    if (!key || !val)
        throw createError(400, `Bad Request: Invalid Fields for Keystore Entry`);
            
    // Check if keystore for this user exists
    let keystore = await Keystore.findOne({ owner: owner._id });   
    if (!keystore) {
        // Create the keystore if it does not exist
        keystore = await Keystore.create({ 
            initVector: crypto.randomBytes(16).toString('hex'), 
            owner: req.user._id 
        }); 
        await keystore.save();
    }
    else {        
        // Ensure the key is unique
        const keyExists = keystore.data.find((entry) => {
            // Decrypt existing key for comparison
            const initv = Buffer.from(keystore.initVector, 'hex');
            const decryptedKey = helpers.decryptString({ encryptedData: entry.key, iv: initv });

            return decryptedKey === key;  // return entry.key === key
        });
        if (keyExists) {
            throw createError(400, `Key already exists`) 
        }
    }

    // Encrypt the data before inserting (use the initVector)
    const iv = Buffer.from(keystore.initVector, 'hex');

    const encKey         = helpers.encryptString({ data: key,         iv }).encryptedData;
    const encVal         = helpers.encryptString({ data: val,         iv }).encryptedData;
    const encDescription = helpers.encryptString({ data: description, iv }).encryptedData;
    const encAddInfo     = helpers.encryptString({ data: addInfo,     iv }).encryptedData;

    // Add the entry
    keystore.data = [...keystore.data, { 
        key:         encKey, 
        val:         encVal, 
        description: encDescription, 
        addInfo:     encAddInfo 
    }];

    await keystore.save();

    res.status(201).json(keystore);  
}); 


// ==============================================================
// List all keystore entries (for current user only) 
// --------------------------------------------------------------
// Method: 'GET', url = '/api/v1/keystore', Access: 'Private'
// ==============================================================
const listKeystoreEntries = asyncHandler(async (req, res) => {
    const owner = req.user;
    if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const keystore = await Keystore.findOne({ owner: owner._id });
    if (!keystore) return res.status(401).json({ error: `No key entries available for this user.` });

    const initv = Buffer.from(keystore.initVector, 'hex');

    // Decrypt the data before responding
    const keystoreEntries = keystore.data.map((entry) => {
        return {
            key: helpers.decryptString({ encryptedData: entry.key, iv: initv }),
            val: helpers.decryptString({ encryptedData: entry.val, iv: initv }),
            description: helpers.decryptString({ encryptedData: entry.description, iv: initv }),
            addInfo: helpers.decryptString({ encryptedData: entry.addInfo, iv: initv }),
        };
    });

    res.json(keystoreEntries);   
}); 


// =================================================================
// View a Specific Keystore Entry 
// -----------------------------------------------------------------
// Method: 'GET', url = '/api/v1/keystore/:id', Access: 'Private'
// =================================================================
const getKeystoreEntry = asyncHandler(async (req, res) => {
    // Get the id of the required keystore entry
    const _id = req.params.id;
    if (!_id) return res.status(400).json({ error: `Bad Request` });

    const owner = req.user;
    if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const keystore = await Keystore.findOne({ owner: owner._id });
    if (!keystore) {
        return res.status(404).json({ error: `Keystore for this user not found.` });
    }

    const entry = keystore.data.find((key_entry) => {
        if (key_entry._id.toString() === _id) return key_entry;
    });

    if (!entry) return res.status(400).json({ error: `Specific keystore entry not found.` });

    // Decrypt the data before responding
    const initv = Buffer.from(keystore.initVector, 'hex');

    const keystoreEntry = {
        key: helpers.decryptString({ encryptedData: entry.key, iv: initv }),
        val: helpers.decryptString({ encryptedData: entry.val, iv: initv }),
        description: helpers.decryptString({ encryptedData: entry.description, iv: initv }),
        addInfo: helpers.decryptString({ encryptedData: entry.addInfo, iv: initv }),
    }

    res.json(keystoreEntry); 
}); 


// ===================================================================
// Update a specific Keystore Entry 
// -------------------------------------------------------------------
// Method: 'PATCH', url = '/api/v1/keystore/:id', Access: 'Private'
// ===================================================================
const updateKeystoreEntry = asyncHandler(async (req, res) => {
    // const updates = Object.keys(req.body);
    // const allowedUpdates = ['rolename', 'ruid', 'description'];

    // const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    // if (!isValidOperation) {
    //     throw createError(400, `Bad Request: Invalid Fields for Update`);    
    // }

    // try {
    //     const role = await Role.findOne({ _id: req.params.id });   
    //     if (!role) {
    //         throw createError(404, `Not Found`);  
    //     }

    //     updates.forEach((update) => role[update] = req.body[update]);
    //     await role.save();
    //     res.send(role);                         
    // } catch (err) {
    //     throw createError(400, err.message);   
    // }

    res.send('ok');
}); 


// ===================================================================
// Delete a specific Keystore entry
// -------------------------------------------------------------------
// Method: 'DELETE', url = '/api/v1/keystore/:id', Access: 'Private'
// ===================================================================
const deleteKeystoreEntry = asyncHandler(async (req, res) => {

    // // TODO: find all groups with this role and delete the role from the group

    // const role = await Role.findOneAndDelete({ _id: req.params.id });
    // if (!role) {
    //     throw createError(404, `Not Found`);                    
    // }
    // res.send(role);

    res.send('ok');
}); 


module.exports = { 
    addKeystoreEntry,
    listKeystoreEntries,
    getKeystoreEntry,
    updateKeystoreEntry,
    deleteKeystoreEntry
};