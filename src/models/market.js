const mongoose = require('mongoose');

const MarketSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true
    },
    asset: {
        type: String,
        required: true
    },    
    base: {
        type: String,
        required: true
    },
    type: {    // crypto, ...
        type: String,
        required: true
    },
    description: {    
        type: String,
        required: true
    }
});

const Market = mongoose.model('Market', MarketSchema);

module.exports = Market;