const mongoose = require('mongoose');

const ActionSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    operations: [{
        key: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        val: {
            type: String,
            required: true
        }
    }],
    trigger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trigger',
        required: true
    },
}, 
{
    timestamps: true
});

const Action = mongoose.model('Action', ActionSchema);

module.exports = Action;