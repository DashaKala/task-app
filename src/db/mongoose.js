const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    //useCreateIndex to true is going to make sure that when Mongoose works with Mongo D.B. our indexes are created allowing
    //  us to quickly access the data we need to access:
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

module.exports = mongoose;















