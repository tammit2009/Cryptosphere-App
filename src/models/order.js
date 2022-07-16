const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({

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
        type: String,    // 'pending', 'filled'
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

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;