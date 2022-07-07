const mongoose = require('mongoose');

const PositionSchema = new mongoose.Schema({
    entry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trade',
        required: true
    },
    exit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trade',
    },
    fee: {
        type: Number,
        required: true
    },
    type: {    // market, limit, ...
        type: String,
        required: true
    },
    state: {    // open, closed
        type: String,
        required: true
    },
    direction: {    // long, short
        type: String,
        required: true
    },
    transactor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, 
{
    timestamps: true
});

const Position = mongoose.model('Position', PositionSchema);

module.exports = Position;