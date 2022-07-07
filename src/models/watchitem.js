const mongoose = require('mongoose');

const WatchItemSchema = new mongoose.Schema({
    symbolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Market',
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
    state: {    // active, passive
        type: String,
        required: true
    },
    txn_fee: {  // assume on the base currency
        type: Number,
        required: true
    },
    long_funds: { // how much funds to trade this pair in the long direction (in asset currency terms)
        type: Number,
        required: true
    },
    short_funds: { // how much funds to trade this pair in the short direction (in base currency terms)
        type: Number,
        required: true
    },
    allocation: { // fraction of the funds to trade in a single position
        type: Number,
        required: true
    },
    description: {    
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, 
{
    timestamps: true
});

const WatchItem = mongoose.model('WatchItem', WatchItemSchema);

module.exports = WatchItem;