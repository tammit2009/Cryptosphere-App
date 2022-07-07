
const Trade = require('../models/trade');
const Position = require('../models/position');

async function createTrade(data) {
    // const pos = await Position.findOne({ _id: posId });
    // if (!pos) return false;

    const { price, size } = data;

    const trade = await Trade.create({ 
        price,
        size, 
        // position: pos._id 
    }); 

    await trade.save();

    return trade;
}


async function listTrades(data) {

    // For now, ignore the position - will be rectified later

    // const position = await Position.findOne({ _id: posId });
    // if (!position) return false;

    const { limit, skip, sort } = data;

    try {
        const trades = await Trade.find({}, null, {
            limit: limit ? parseInt(limit) : 10,
            skip: skip ? parseInt(skip) : 0,
            sort: sort ? sort : -1
        }); 
    
        return trades;
    }
    catch (err) {
        return false;  // temp
    }
}


async function getTrade(data) {

    // For now, ignore the position - will be rectified later

    // const position = await Position.findOne({ _id: posId });
    // if (!position) return false;

    if (data.tradeId) {
        try {
            // const trade = await Trade.findOne({ _id: data.tradeId, position: posId });
            const trade = await Trade.findOne({ _id: data.tradeId });
            if (!trade) return false;
            
            return trade;
        }
        catch (err) {
            return false; // temp
        }
    }
    else 
        return false;
}


async function deleteTrade(data) {
    // For now, ignore the position - will be rectified later

    // const position = await Position.findOne({ _id: posId });
    // if (!position) return false;

    if (data.tradeId) {
        try {
            // const trade = await Trade.findOneAndDelete({ _id: data.tradeId, position: posId });
            const trade = await Trade.findOneAndDelete({ _id: data.tradeId });
            if (!trade) return false;
                
            return trade;
        }
        catch (err) {
            return false;  // temp
        }
    }
    else 
        return false;
}


module.exports = {
    createTrade,
    listTrades,
    getTrade,
    deleteTrade
}