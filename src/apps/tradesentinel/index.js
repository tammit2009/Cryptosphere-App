
const events = require('events');

const { sendDirectEmail } = require('../../services/email');
const { tickerUpdateUI }  = require('./update_ticker');
const { runBot }  = require('./monitor_bot');

let bHourHit  = false;
let bMinuteHit  = false;

let sentinel = {};

sentinel.ee = new events;

// Inject Clock
sentinel.run = async function() {

    // React to time of day
    const now = new Date();

    // Execute every hour
    await perHourDispatcher(now);

    // Execute every minute
    await perMinuteDispatcher(now);

    // Execute every received tick
    await perTickDispatcher(sentinel.ee);
};

async function perHourDispatcher(now) {

    const timeZone = 1; 
    const hourNow = now.getUTCHours() + timeZone;

    const minNow = now.getUTCMinutes();

    if (hourNow == 14 && minNow == 22) { // message at every 14:22

    // if (minNow == 0) { // message at top of every hour
        if (!bHourHit) {   // will happen about 360x for 10s intervals
            console.log(now);
            bHourHit = true;

            // send email
            const mail = {
                email: "tb.takaya@gmail.com",
                subject: "Level 2 Alert",
                text: "CryptoSphere Notification Service: BTCBUSD has crossed a threshold and is now in an uptrend"
            };

            const resp = await sendDirectEmail(mail.email, mail.subject, mail.text);
            if (resp[0].statusCode && parseInt(resp[0].statusCode) == 202) {
                console.log({ message: `email successfully sent to ${mail.email}` });   
            }
            else {
                console.log(`Failed to send email to ${mail.email}`);
            }
        }
    }
    else {
        bHourHit = false;
    }
}

async function perMinuteDispatcher(now) {
    const secNow = now.getUTCSeconds();
    if (secNow < 10) {       
        if (!bMinuteHit) {   
            bMinuteHit = true;

            // run monitoring bot
            runBot();
        }
    }
    else {
        bMinuteHit = false;
    }
}

async function perTickDispatcher(event_emitter) {

    // Update UI with Ticker Info 
    await tickerUpdateUI(event_emitter);
}


module.exports = sentinel;