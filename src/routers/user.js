const express = require('express');
const multer = require('multer');
const mongoose = require('./db/mongoose');
//sharp model converts large images in common formats to smaller, web-friendly JPEG, PNG and WebP images of varying dimensions
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/authentication');
const {sendWelcomeEmail, sendGoodbyeEmail} = require('../emails/account');

const router = new express.Router();

//create user

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);

        /* generating token for new user */
        const token = await user.generateAuthToken();

        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
})

// validation of user login

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send();
    }
})

// logging out user from individual session

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(item => {
            return item.token !== req.token;
        })
        await req.user.save();
        res.send('User has been logged out.');
    } catch (e) {
        res.status(500).send();
    }
})

// logging out user from all sessions
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send('User has been logged out from all devices.')
    } catch (e) {
        res.status(500).send();
    }
})


// fetching user profile by its login data

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
})



// update user data

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'password', 'age', 'email'];
    const isValidOperation = updates.every(item => allowedUpdates.includes(item));// every returns Boolean

    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!'});
    }

    try {
        updates.forEach(key => req.user[key] = req.body[key]);
        await req.user.save();
        res.send({message: 'Updates have been successfully saved!', user: req.user});
    } catch (e) {
        res.status(500).send(e);
    }
});

// deleting user

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        sendGoodbyeEmail(req.user.email, req.user.name);

        res.send('User has been removed!');
    } catch (e) {
        res.status(500).send(e);
    }
})

// user avatar upload

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter (req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('You can load only image file.'));
        }
        cb(undefined, true);
    }
});
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send('Image has been uploaded.');
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
})

//  display user avatar in client

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar) {
            throw new Error();
        }

        /* setting own response header */
        res.set('Content-Type', 'image/png');

        res.send(user.avatar);

        // verifying in browser, not in postman local url localhost:3000/users/....id..../avatar
    } catch (e) {
        res.status(404).send();
    }
})

// deleting user avater
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send('Image has been removed!');
})

module.exports = router;