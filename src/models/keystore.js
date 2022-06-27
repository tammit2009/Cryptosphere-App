const mongoose = require('mongoose');

const KeystoreSchema = new mongoose.Schema({

    initVector: {
        type: String,
        required: true,
    },
    data: [{
        key: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        val: {
            type: String,
            required: true
        },
        description: {
            type: String,
        },
        addInfo: {
            type: String,
        },
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

const Keystore = mongoose.model('Keystore', KeystoreSchema);

module.exports = Keystore;