const express = require('express');
const Task = require('../models/task');
const mongoose = require('../db/mongoose');
const auth = require('../middleware/authentication');

const router = new express.Router();

// creating task

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        /* pairing task to user ID */
        owner: req.user._id
    });
    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(error);
    }
});

// fetching all tasks

// !!!! separator is ":"
router.get('/tasks', auth, async (req, res) => {
    /* saving keys put in url such as /tasks?completed=true */
    const match = {};
    /* saving properties for sorting */
    const sort = {};

    if(req.query.completed) {
        match.completed = req.query.completed === 'true';
        /* if "/tasks?completed=false", above statement return Boolean false assigned to match.completed */
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match, // property for setting conditionals of filter
            options: {
                /* keys values in url are string, that's why we parse them to Number */
                limit: parseInt(req.query.limit), // limit per page
                skip: parseInt(req.query.skip), // how many results should skip to next batch

                /* 1 = ascending; -1 = descending */
                sort //:{createdAt: 1}
            }
        }).execPopulate();
        if(req.user.tasks.length === 0) {
            return res.send('User has no tasks saved.');
        }
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send();
    }
});

// fetching task by its ID

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    if(!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(406).send('ID is not valid!');
    }

    try {
        const task = await Task.findOne({_id, owner: req.user._id});
        if(!task) {
            return res.status(404).send('ID is not found!');
        }
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

// update task

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every(item => allowedUpdates.includes(item));
    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!'});
    }
    try {
        if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(406).send('ID is not valid!');
        }
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
        if(!task) {
            return res.status(404).send('ID is not found!');
        }
        updates.forEach(key => task[key] = req.body[key]);
        await task.save();
        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

// deleting task

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!task) {
            return res.status(404).send('ID is not found!');
        }
        res.send(`Task "${task.description}" has been removed.`);
    } catch {
        res.status(500).send();
    }
});

module.exports = router;