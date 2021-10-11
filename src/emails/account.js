/*
managing emails sent to users
*/

const sgMail = require('@sendgrid/mail');

/* API key hold as environment variable in config directory not committed to shared server */
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'dag.mar.pfe.fe@gmail.com',
        subject: 'Thanks for joining us!',
        text: `Welcome, ${name}, in our community.`
    });
};

const sendGoodbyeEmail = (email, name) =>
    sgMail.send({
        to: email,
        from: 'dag.mar.pfe.fe@gmail.com',
        subject: 'Real good-bye?',
        text: `It is a pity, ${name}, you are leaving us :(`
    });

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
};
















