const mongoose = require('mongoose');
const validator = require('validator');

// create model (like JS constructor)

const User = mongoose.model('User', {
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 18,
        validate(value) {
            if(value < 0) {
                throw new Error('Age must be a positive number!');
            }
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
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
    }
})

module.exports = User;