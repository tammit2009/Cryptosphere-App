const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({

    rolename: {
        type: String,
        required: true,
        trim: true
    },
    ruid: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        trim: true
    }
});

const Role = mongoose.model('Role', RoleSchema);

module.exports = Role;