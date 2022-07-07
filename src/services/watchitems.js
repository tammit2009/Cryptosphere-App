
const WatchItem = require('../models/watchitem');
const User = require('../models/user');

async function createWatchItem(userId, data) {

    const user = await User.findOne({ _id: userId });
    if (!user) return false;

    try {
        const watchItem = await WatchItem.create({ 
            asset: data.asset, 
            base: data.base, 
            symbolId: data.symbolId, 
            type: data.type, 
            state: data.state, 
            txn_fee: data.txn_fee, 
            long_funds: data.long_funds, 
            short_funds: data.short_funds, 
            allocation: data.allocation, 
            description: data.description, 
            owner: user._id 
        }); 
    
        await watchItem.save();
    
        return watchItem;
    }
    catch (err) {
        return false;  // temp
    }
}


async function listWatchItems(userId, data) {

    const user = await User.findOne({ _id: userId });
    if (!user) return false;

    const { limit, skip, sort } = data;

    try {
        const watchItem = await WatchItem.find({}, null, {
            limit: limit ? parseInt(limit) : 10,
            skip: skip ? parseInt(skip) : 0,
            sort: sort ? sort : -1
        }); 
    
        return watchItem;
    }
    catch (err) {
        return false;  // temp
    }
}


async function getWatchItem(userId, data) {

    const user = await User.findOne({ _id: userId });
    if (!user) return false;

    if (data.watchItemId) {
        try {
            const watchItem = await WatchItem.findOne({ _id: data.watchItemId, owner: userId });
            if (!watchItem) return false;
            
            return watchItem;
        }
        catch (err) {
            return false; // temp
        }
    }
    else 
        return false;
}


async function updateWatchItem(userId, data) {

    const user = await User.findOne({ _id: userId });
    if (!user) return false;

    if (data.watchitemId) {
        try {
            const watchItem = await WatchItem.findOne({ _id: data.watchitemId, owner: user._id });   
            if (!watchItem)  return false;

            // data: { watchitemId, updateKeys, params }
            data.updateKeys.forEach((updateKey) => watchItem[updateKey] = data.params[updateKey]);
            await watchItem.save();

            return watchItem;                         
        } catch (err) {
            return false;  
        }
    }
    else 
        return false;
}


async function deleteWatchItem(userId, data) {

    const user = await User.findOne({ _id: userId });
    if (!user) return false;

    if (data.watchItemId) {
        try {
            const watchItem = await WatchItem.findOneAndDelete({ _id: data.watchItemId, owner: userId });
            if (!watchItem) return false;
            
            return watchItem;
        }
        catch (err) {
            return false;  // temp
        }
    }
    else 
        return false;
}


module.exports = {
    createWatchItem,
    listWatchItems,
    getWatchItem,
    updateWatchItem,
    deleteWatchItem
}