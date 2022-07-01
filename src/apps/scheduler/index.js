
const CronJob = require('cron').CronJob;
const { resolve } = require('path');    // resolving the current directory to build a uri path
const { isValidCron } = require('cron-validator');

const { logger } = require("../libs/loggers");
const dbhandler  = require('../libs/db_handler');

var scheduler = {};

scheduler.crontasks = [];

scheduler.initCrons = function() {

    logger.info('initializing crons');

    // get the available crons
    dbhandler.readCrons({}, (err, data) => {
        if (err) {
            return console.log('error:', err);
        }

        // Object.keys(config).forEach(function(key) {
        data.crons.forEach(function(cron) {
            if (cron.active) {
                if (isValidCron(cron.frequency), { seconds: true }) {
    
                    // initiate each cron with syntax: CronJob(cronTime, onTick, onComplete, start, timeZone)
                    const crontask = new CronJob(
                        cron.frequency, 
        
                        () => { 
                            const handler = require(resolve(cron.handler));
                            handler();
                        }, 
        
                        null, 
                        true, 
                        'Africa/Lagos'
                    ); 
        
                    scheduler.crontasks.push(crontask);
                }
                else {
                    console.log('invalid schedule');
                }
            }
        });
    });
   
};

scheduler.terminateCrons = function() {
    logger.info('terminating crons');

    // iteratively stop all the jobs
    scheduler.crontasks.forEach(crontask => crontask.stop());
};


module.exports = scheduler;


// template
// job = new CronJob(
//     '* * * * * *',            
//     function() {                
//         console.log('You will see this message every second.');
//     },
//     null,                       
//     true,                       
//     'Africa/Lagos'              
// );

// module.exports = job;