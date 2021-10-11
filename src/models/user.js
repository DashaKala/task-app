const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs'); // hashing passwords
const jwt = require('jsonwebtoken');
const Task = require('./task');

// to get advantage of middleware, we have to create Schema before Model

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 18,
        validate(value) {
            // own validation
            if(value < 0) {
                throw new Error('Age must be a positive number!');
            }
        }
    },
    email: {
        unique: true,
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            // using npm validator
            if(!validator.isEmail(value)) {
                throw new Error('Email is not valid!');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if(validator.equals(value, 'password')) {
                throw new Error('Password cannot equal "password"!')
            }
        }
    },
    /* holding all tokens for future use */
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    /* setting user avatars to be saved in binary on user profile (preventing to lose them during deployment) */
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

/* "virtual property" functionalism */
userSchema.virtual(
    'tasks',
    {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

// middleware section:

// generating token
userSchema.methods.generateAuthToken = async function () {
    const user = this;

    const token = jwt.sign(
        { _id: user._id.toString()},
        process.env.JWT_SECRET // secretOrPrivateKey ("secret")
    );

    /* saving token to users db */
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

// setting function for sending relevant data from server to client

// ---------- own method:
userSchema.methods.getPublicProfile = function () {
    const user = this;
    const userObject = user.toObject(); // provide raw profile data

    /* data which we do not want to send */
    delete userObject.password;
    delete userObject.tokens;

    return userObject;
};
// ---------- using toJSON method:
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

// validation of user existence

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne( {email} );
    if(!user) {
        throw new Error('Unable to login!'); // as little info as possible
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
        throw new Error('Unable to login');
    }
    return user;
};

// using pre method

// doing correction in router so that mongoose could not ignore middleware function!!!
// not use arrow key statement because of "this"!!!
userSchema.pre('save', async function (next) {
    const user = this;
    /* setting when hashing a password */
    if(user.isModified('password')) {
        /* default value for 2.nd arg is 10 */
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

//delete all tasks when User is deleted:

userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next();
});

// create model (like JS constructor):

const User = mongoose.model('User', userSchema);

module.exports = User;