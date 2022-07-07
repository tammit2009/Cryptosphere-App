
const Trigger = require('../models/trigger');
const User = require('../models/user');

async function createTrigger(userId, data) {

    const user = await User.findOne({ _id: userId });
    if (!user) return false;

    try {
        const trigger = await Trigger.create({ 
            timestamp: new Date().getTime(), 
            actions: data.actions ? data.actions : [],
            owner: user._id 
        }); 
    
        await trigger.save();
    
        return trigger;
    }
    catch (err) {
        return false;  // temp
    }
}


async function listTriggers(userId, data) {

    const user = await User.findOne({ _id: userId });
    if (!user) return false;

    const { limit, skip, sort } = data;

    try {
        const triggers = await Trigger.find({}, null, {
            limit: limit ? parseInt(limit) : 10,
            skip: skip ? parseInt(skip) : 0,
            sort: sort ? sort : -1
        }); 
    
        return triggers;
    }
    catch (err) {
        return false;  // temp
    }
}


async function getTrigger(userId, data) {

    const user = await User.findOne({ _id: userId });
    if (!user) return false;

    if (data.triggerId) {
        try {
            const trigger = await Trigger.findOne({ _id: data.triggerId, owner: userId });
            if (!trigger) return false;
            
            return trigger;
        }
        catch (err) {
            return false; // temp
        }
    }
    else 
        return false;
}


async function updateTrigger(userId, data) {

    const user = await User.findOne({ _id: userId });
    if (!user) return false;

    if (data.triggerId) {
        try {
            const trigger = await Trigger.findOne({ _id: data.triggerId, owner: user._id });   
            if (!trigger)  return false;

            // data: { triggerId, updateKeys, params }
            data.updateKeys.forEach((updateKey) => trigger[updateKey] = data.params[updateKey]);
            await trigger.save();

            return trigger;                         
        } catch (err) {
            return false;  
        }
    }
    else 
        return false;
}


async function deleteTrigger(userId, data) {

    const user = await User.findOne({ _id: userId });
    if (!user) return false;

    if (data.triggerId) {
        try {
            const trigger = await Trigger.findOneAndDelete({ _id: data.triggerId, owner: userId });
            if (!trigger) return false;
            
            return trigger;
        }
        catch (err) {
            return false;  // temp
        }
    }
    else 
        return false;
}


module.exports = {
    createTrigger,
    listTriggers,
    getTrigger,
    updateTrigger,
    deleteTrigger
}