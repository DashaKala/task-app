const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        // valid token?
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // token is valid - finding user in db
        const user = await User.findOne({
            _id: decoded._id,
            'tokens.token': token
        });
        if (!user) {
            throw new Error();
        }

        /* saving concrete token for concrete device which user is logged in on (other route handlers can access it) */
            req.token = token;

        /* allowing route handler access user which is loaded; route handler will have access to user property
        (added to request) containing the object
        is added to */
        req.user = user;

        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate!' });
    }
}

module.exports = auth;