const mongoose = require('mongoose');

const SysTaskSchema = new mongoose.Schema({
    // action: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Action',
    // },
    action: {
        type: String,
        required: true
    },
    description: {    
        type: String,
        required: true
    }
});

const SysTask = mongoose.model('SysTask', SysTaskSchema);

module.exports = SysTask;