const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    groupname: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    }]
});

const Group = mongoose.model('Group', GroupSchema);

module.exports = Group;