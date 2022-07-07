
const Market = require('../models/market');

async function createMarket(data) {

    try {
        const market = await Market.create({ 
            symbol: data.symbol, 
            asset: data.asset, 
            base: data.base, 
            type: data.type, 
            description: data.description,            
        }); 
    
        await market.save();
    
        return market;
    }
    catch (err) {
        return false;  // temp
    }
}


async function listMarkets(data) {

    const { limit, skip, sort } = data;

    try {
        const markets = await Market.find({}, null, {
            limit: limit ? parseInt(limit) : 10,
            skip: skip ? parseInt(skip) : 0,
            sort: sort ? sort : -1
        }); 
    
        return markets;
    }
    catch (err) {
        return false;  // temp
    }
}


async function getMarket(data) {

    if (data.marketId) {
        try {
            const market = await Market.findOne({ _id: data.marketId });
            if (!market) return false;
            
            return market;
        }
        catch (err) {
            return false; // temp
        }
    }
    else 
        return false;
}


async function updateMarket(data) {

    if (data.marketId) {
        try {
            const market = await Market.findOne({ _id: data.marketId });   
            if (!market)  return false;

            // data: { marketId, updateKeys, params }
            data.updateKeys.forEach((updateKey) => market[updateKey] = data.params[updateKey]);
            await market.save();

            return market;                         
        } catch (err) {
            return false;  
        }
    }
    else 
        return false;
}


async function deleteMarket(data) {

    if (data.marketId) {
        try {
            const market = await Market.findOneAndDelete({ _id: data.marketId });
            if (!market) return false;
            
            return market;
        }
        catch (err) {
            return false;  // temp
        }
    }
    else 
        return false;
}


module.exports = {
    createMarket,
    listMarkets,
    getMarket,
    updateMarket,
    deleteMarket
}