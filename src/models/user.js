const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Group = require('./group');
const Keystore = require('./keystore');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    profile: {
        firstname: {type: String, default: ''},
        lastname: {type: String, default: ''},
        description: {type: String, default: ''},
        picture: { type: String, default: ''}
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid.');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"');
            }
        }
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    refreshToken: {
        type: String,
        required: false
    },
    developer: {
        api_key: {
            type: String, 
            default: '', 
            // required: true
        },
        hosts: [{ 
            type: String, 
            default: '' 
        }],
        usage: [{
            date: { 
                type: String, 
                default: '' 
            },
            count: { 
                type: Number, 
                default: 0 
            }
        }],
    }
}, 
{
    timestamps: true
});

UserSchema.methods.toJSON = function () {              
    const user = this;
    const userObject = user.toObject();

    delete userObject.profile;
    delete userObject.password;
    delete userObject.developer;
    // delete userObject.refreshToken;

    return userObject;
};

UserSchema.methods.getPrivateProfile = function () {               
    const user = this;
    const userObject = user.toObject();

    // delete userObject.profile;
    delete userObject.password;
    // delete userObject.developer;
    // delete userObject.refreshToken;

    return userObject;
};

// static/model method (invoked by 'User')
UserSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ error: `Unable to login.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ error: `Unable to login.` });
    }

    return user;
};

// instance method (invoked by 'user')
UserSchema.methods.generateAccessRefreshToken = async function () {
    const user = this;

    const group = await Group.findOne({ _id: user.group }).populate({ path: 'roles' });
    const roles = Object.values(group.roles);

    // create access JWT
    const accessToken = jwt.sign({   
        "userInfo": {
            "_id": user._id,
            "roles": roles
        }},
        process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' }  // usually 5m, 15m
    );

    // create refresh JWT
    const refreshToken = jwt.sign(
        { "_id": user._id, }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' }  
    );

    // save refresh token with current user
    user.refreshToken = refreshToken;
    await user.save();

    // return access token;
    return accessToken;
};


// Get role ruids as an array
UserSchema.methods.getRuids = async function () {
    const user = this;
    const group = await Group.findOne({ _id: user.group }).populate({ path: 'roles' });
    return Object.values(group.roles).map(role => role.ruid);
}

// Compare password in db and the one user typed in
UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};


// Hash the plain text password before saving
UserSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

// Delete user keystore when user has been removed
UserSchema.pre('remove', async function (next) {
    const user = this;
    await Keystore.deleteMany({ owner: user.id });
    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;