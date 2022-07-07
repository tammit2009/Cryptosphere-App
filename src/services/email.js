const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendDirectEmail = async (email, subject, text) => {
    return await sgMail.send({
        to: email,
        from: 'tammit@kustomlynx.net',  
        subject,
        text 
    });
};

module.exports = {
    sendDirectEmail
}