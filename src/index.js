/* for testing reason is main code in app.js file */
/* we need an access to express but without calling "listen" as we need express before calling listen method;
* due to it setting express is in app.js - because when launching production envir. it will go to this file index.js and
* be able to access express; when launching test envir. it will access only app.js */

const app = require('./app');

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server is listening on port ${port}.`);
})