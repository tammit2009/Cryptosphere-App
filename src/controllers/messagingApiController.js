
/********************************/
/*** Messaging API Controller ***/
/********************************/

// Dependencies
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');

const { 
    sendDirectEmail
} = require('../services/email');

/*
 * Send an email
 * Method: 'POST', url = '/api/v1/messaging/sendmail', Access: 'Private/Admin'
 */
const sendEmail = asyncHandler(async (req, res) => {
    const { email, subject, text } = req.body;

    const resp = await sendDirectEmail(email, subject, text);
    // console.log(resp[0].statusCode);

    if (resp[0].statusCode && parseInt(resp[0].statusCode) == 202) {
        res.status(200).send({ message: `email successfully sent to ${email}` });   
    }
    else {
        throw createError(500, `Failed to send email to ${email} `);
    }
    
});


module.exports = { 
    sendEmail
};