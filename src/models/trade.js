const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
    price: {
        type: Number,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    // position: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Position',
    //     required: true
    // },
}, 
{
    timestamps: true
});

const Trade = mongoose.model('Trade', TradeSchema);

module.exports = Trade;