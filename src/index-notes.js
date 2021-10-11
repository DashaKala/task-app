// starting point of our app is this file - creation of express app and its launch
// npm run dev
// npm run start

const express = require('express');
const mongoose = require('./db/mongoose');

const userRouter = require('./routers/user');
const userTask = require('./routers/task');

const app = express();

const port = process.env.PORT || 3000;

// configurating express to automatically parse JSON to object
app.use(express.json())
app.use(userRouter);
app.use(userTask);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}.`);
})
















