
const SysTask = require('../models/systask');

async function createSysTask(data) {

    try {
        const systask = await SysTask.create({ 
            action: data.action,
            description: data.description
        }); 
    
        await systask.save();
    
        return systask;
    }
    catch (err) {
        return false;  // temp
    }
}


async function listSysTasks(data) {

    const { limit, skip, sort } = data;

    try {
        const systasks = await SysTask.find({}, null, {
            limit: limit ? parseInt(limit) : 10,
            skip: skip ? parseInt(skip) : 0,
            sort: sort ? sort : -1
        }); 
    
        return systasks;
    }
    catch (err) {
        return false;  // temp
    }
}


async function getSysTask(data) {

    if (data.systaskId) {
        try {
            const systask = await SysTask.findOne({ _id: data.systaskId });
            if (!systask) return false;
            
            return systask;
        }
        catch (err) {
            return false; // temp
        }
    }
    else 
        return false;
}


async function updateSysTask(data) {

    if (data.systaskId) {
        try {
            const systask = await SysTask.findOne({ _id: data.systaskId });   
            if (!systask)  return false;

            // data: { systaskId, updateKeys, params }
            data.updateKeys.forEach((updateKey) => systask[updateKey] = data.params[updateKey]);
            await systask.save();

            return systask;                         
        } catch (err) {
            return false;  
        }
    }
    else 
        return false;
}


async function deleteSysTask(data) {

    if (data.systaskId) {
        try {
            const systask = await SysTask.findOneAndDelete({ _id: data.systaskId });
            if (!systask) return false;
            
            return systask;
        }
        catch (err) {
            return false;  // temp
        }
    }
    else 
        return false;
}


module.exports = {
    createSysTask,
    listSysTasks,
    getSysTask,
    updateSysTask,
    deleteSysTask
}