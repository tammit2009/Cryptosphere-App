const mongoose = require('mongoose');

const TriggerSchema = new mongoose.Schema({
    timestamp: {
        type: Number,
        required: true
    },
    // actions: [{
    //     action: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'Action',
    //     },
    // }],
    actions: [{
        action: {
            type: String
        }
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
});

const Trigger = mongoose.model('Trigger', TriggerSchema);

module.exports = Trigger;