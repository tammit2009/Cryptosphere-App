
const Position = require('../models/position');
const User     = require('../models/user');

async function createPosition(userId, data) {

    const { entryId, exitId, fee, type, state, direction } = data;

    const user = await User.findOne({ _id: userId });
    if (!user) return false;

    const position = await Position.create({ 
        entry: entryId, 
        exit: exitId,
        fee,
        type,      // market, limit, ...
        state,     // open, closed
        direction, // long, short
        transactor: user._id 
    }); 

    await position.save();

    return position;
}


async function listPositions(userId, data) {

    const user = await User.findOne({ _id: userId });
    if (!user) return false;

    const { limit, skip, sort } = data;

    try {
        const positions = await Position.find({}, null, {
            limit: limit ? parseInt(limit) : 10,
            skip: skip ? parseInt(skip) : 0,
            sort: sort ? sort : -1
        }); 
    
        return positions;
    }
    catch (err) {
        return false;  // temp
    }
}


async function getPosition(userId, data) {

    const user = await User.findOne({ _id: userId });
    if (!user) return false;

    if (data.positionId) {
        try {
            const position = await Position.findOne({ _id: data.positionId, owner: userId });
            if (!position) return false;
            
            return position;
        }
        catch (err) {
            return false; // temp
        }
    }
    else 
        return false;
}


async function updatePosition(userId, data) {

    const user = await User.findOne({ _id: userId });
    if (!user) return false;

    if (data.positionId) {
        try {
            const position = await Position.findOne({ _id: data.positionId, owner: user._id });   
            if (!position)  return false;

            // data: { positionId, updateKeys, params }
            data.updateKeys.forEach((updateKey) => position[updateKey] = data.params[updateKey]);
            await position.save();

            return position;                         
        } catch (err) {
            return false;  
        }
    }
    else 
        return false;
}


async function deletePosition(userId, data) {

    const user = await User.findOne({ _id: userId });
    if (!user) return false;

    if (data.positionId) {
        try {
            const position = await Position.findOneAndDelete({ _id: data.positionId, owner: userId });
            if (!position) return false;
            
            return position;
        }
        catch (err) {
            return false;  // temp
        }
    }
    else 
        return false;
}


module.exports = {
    createPosition,
    listPositions,
    getPosition,
    updatePosition,
    deletePosition
}