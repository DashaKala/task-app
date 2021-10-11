const request = require('supertest'); // it is a convention to name this variable as "request"

const User = require('../src/models/user');

const app = require('../src/app');

const {userOneID, userOne, setupDatabase} = require('./fixtures/db');

beforeEach(setupDatabase);

// using "await" with "supertest" supports promises
// using "await" will make sure that the request actually finishes before "jest" figures out if it's a success or a failure


test('Should signup a new user', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Emil',
            email: 'emil@seznam.cz',
            password: 'pass1234'
        }).expect(201);

    // checking user save and loading its data from db
    const user = await User.findById(response.body.user._id);
    // if not in db, user variable value would be null - so we expect not to be null
    expect(user).not.toBeNull();

    //checking response body contains correct data
    expect(response.body).toMatchObject({
        user: {
            name: 'Emil',
            email: 'emil@seznam.cz'
        },
        token: user.tokens[0].token
    });

    //checking password is not saved as simple text
    expect(user.password).not.toBe('pass1234')
});


test('Should login existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        }).expect(200);

    // validation of creation of new token during logging
    const user = await User.findById(userOneID);
    expect(response.body.token).toMatch(user.tokens[1].token)
});


test('Should fail login for non-existent user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'blabla123'
    }).expect(400)
});


test('Should read profile data', async () => {
    await request(app)
        .get('/users/me')
        // setting which data will be used for validation of user
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
});


test('Should not read profile data for non-auth user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
});


test('Delete profile of authorized user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    // validation of deleting user
    const user = await User.findById(userOneID);
    expect(user).toBeNull();

});


test('Refuse removing profile of non-authorized user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
});


test('Should upload avatar to the server', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'test/fixtures/profile-pic.jpg')
        .expect(200);

    // checking of correct uploading of avatar
    const user = await User.findById(userOneID);
    // toEqual can compare properties of objects
    expect(user.avatar).toEqual(expect.any(Buffer))
});


test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Ashik'
        })
        .expect(200);
    // checking a field has been correctly updated
    const user = await User.findById(userOneID);
    expect(user.name).toEqual('Ashik')

});


test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Praha'
        })
        .expect(400)
});

// User Test Ideas
//
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated










