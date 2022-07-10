const mongoose = require('mongoose');

const PendingOrderSchema = new mongoose.Schema({

    orderId: {
        type: String,
        required: true,
        trim: true
    },
    symbol: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        trim: true
    },
    fillCheck: {
        type: Number,
        default: 0
    }
},
{
    timestamps: true
});

const PendingOrder = mongoose.model('PendingOrder', PendingOrderSchema);

module.exports = PendingOrder;