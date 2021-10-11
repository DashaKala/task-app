// in package.json we set index --runInBand for jest -> tests will be done after each other and not at the same time

const request = require('supertest');
const Task = require('../src/models/task');
const app = require('../src/app');
const {
    userOneID,
    userOne,
    userTwoID,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
} = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: "My test"
        })
        .expect(201);

    // checking task has been created
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false)
});

test('Fetch tasks for userOne', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    // checking it shows correct number of user tasks
    expect(response.body.length).toEqual(2);

});

test('Should fail deletion of task of non-owner', async () => {
    await request(app)
        .delete('/tasks/'+ taskOne._id)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404);

    // checking the task is still in db
    const task = await Task.findById(taskOne._id);
    expect(task).not.toBeNull();
});

// Task Test Ideas
//
// Should not create task with invalid description/completed
// Should not update task with invalid description/completed
// Should delete user task
// Should not delete task if unauthenticated
// Should not update other users task
// Should fetch user task by id
// Should not fetch user task by id if unauthenticated
// Should not fetch other users task by id
// Should fetch only completed tasks
// Should fetch only incomplete tasks
// Should sort tasks by description/completed/createdAt/updatedAt
// Should fetch page of tasks














