const mongoose = require('mongoose');

//create schema

const taskSchema = mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    // saving user ID in the Task for later assignment of both
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

// create model (like JS constructor)

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;