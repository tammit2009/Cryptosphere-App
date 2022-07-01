/////////////////////////////////////////////////
// the child also needs a connection to database
// as it is on another process.

require('colors');

// environment config
require('dotenv').config(); 

const connectMongoDb = require('./db/mongoose');
connectMongoDb();   

//////////////////////////////////////////////////

const traderbot = require('./apps/traderbot');
const { logger } = require("./utils/loggers");

let state = 'init';

process.on('message', (msg) => {
    // console.log('Message from parent:', msg);
    
    if (typeof(msg) == 'object' && msg.command) {
        if (msg['command'] === 'start') {

            logger.info(`Signal to start!`);
            state = 'active';

            // extract the arguments
            const data = JSON.parse(process.argv[3]);

            // start the bot
            startTraderBot(data);
        }
        else if (msg['command'] === 'stop') {
            logger.info(`Signal to stop forked child pid: ${process.pid}!`);
            stopTraderBot();
            
            state = 'stopped';

            // sleep for 2 seconds before exiting (to sync states)
            setTimeout(() => { process.exit(); }, 2000);
        }
        else if (msg['command'] === 'get_state') {
            process.send({ uptimeTicks, state });
        }
    }
});

process.on('exit', () => {
    logger.info(`child process with ${process.pid} exiting...`);
});

// Monitor the child's state (push)
let uptimeTicks = 0;

setInterval(() => {
    process.send({ uptimeTicks, state });
    uptimeTicks++;
}, 1000);

const startTraderBot = (data) => {
    // Start TraderBot
    traderbot.init(data);
};

const stopTraderBot = () => {
    // Stop TraderBot
    traderbot.terminate();
}