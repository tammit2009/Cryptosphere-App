var async = require('async');
var moment = require('moment');
const { resolve } = require('path');

const dbhandler = require('../../libs/db_handler');

module.exports = {
    process: (cb) => {

        async.waterfall([
            (next) => {
                // First get the available jobs for the cron0 (this is cron0_service)
                dbhandler.readCronJobs({ cronLabel: 'cron0' }, (err, data) => {
                    if (err) {
                        return next(err);
                    }

                    const cronJobs = data.jobs;

                    // Filter eligible tasks based on nextRunningTime and Status
                    const eligibleJobs = cronJobs.filter((job) => {
                        
                        if (job.status !== 'active') {
                            return false;
                        }

                        const jobId = job._id.toString();

                        var now = moment(); 
                        let nextRunningTime = moment(job.nextRunningTime, "DD/MM/YYYY HH:mm:ss");
                        var secondsDiff = nextRunningTime.diff(now, 'seconds');  // nextRunningTime - now
                        var guard_s;
                        switch (job.guard) {
                            case '1s': guard_s  = -1*1; break;
                            case '2s': guard_s  = -1*2; break;
                            case '3s': guard_s  = -1*3; break;
                            case '5s': guard_s  = -1*5; break;
                            case '10s': guard_s = -1*10; break;
                            case '15s': guard_s = -1*15; break;
                            case '30s': guard_s = -1*30; break;
                            case '1m':  guard_s = -1*60; break;
                            case '5m':  guard_s = -1*300; break;
                            case '30m': guard_s = -1*30 * 60; break;
                            case '1hr': guard_s = -1*60 * 60; break;
                        }

                        if (secondsDiff <= 0) {  // if negative (i.e. in the past)
                            if (secondsDiff > guard_s) {
                                // console.log('Executing ' + job.jobLabel);
                                
                                const updated_diff = -1 * secondsDiff % job.repeat;
                                
                                // update the schedule
                                nextRunningTime = now.add(job.repeat - updated_diff, 'seconds').format('DD/MM/YYYY HH:mm:ss');
                                
                                // update to db
                                dbhandler.updateJob(jobId, { nextRunningTime }, (err, code) => {
                                    if (err) {
                                        return console.log(err);
                                    }
                                });
                                
                                // console.log('next running time updated: ', nextRunningTime);
                                return true;
                            }
                            else {   
                                // the delta is greater than guard time, so reschedule
                                // console.log('Task Window Elapsed for ' + job.jobLabel);

                                // How large is the elapse? Use secondsDiff to calculate the nextRunningTime, 
                                // using modulo division
                                const updated_diff = -1 * secondsDiff % job.repeat;
                                
                                // update the schedule
                                nextRunningTime = now.add(job.repeat - updated_diff, 'seconds').format('DD/MM/YYYY HH:mm:ss');
                                
                                // save to db
                                dbhandler.updateJob(jobId, { nextRunningTime }, (err, code) => {
                                    if (err) {
                                        return console.log(err);
                                    }
                                });

                                // console.log('next running time rescheduled: ', nextRunningTime);
                                return false;
                            }
                        }
                        // if positive (i.e. still in the future)
                        else {
                            // The job is not due yet
                            // console.log(job.jobLabel + ' not due... skipping.');

                            // var ms = nextRunningTime.diff(now);
                            // var d = moment.duration(ms);
                            // var s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");

                            return false;
                        }
                    })

                    return next(null, eligibleJobs);
                });
            },

            (eligibleJobs, next) => {
                // Early bailout in case no eligible entries are found
                if (eligibleJobs.length === 0) {
                    return next(null, [204]);
                }
                async.map(eligibleJobs, (job, callback) => {
                    // Process for associated jobs of each task
                    // console.log(job.jobLabel, job.nextRunningTime, job.status);
                    const jobHandler = require(resolve(job.handler));
                    jobHandler(job);
                    
                    return callback(null, 200);  // return an array of result codes
                }, 
                (err, result) => {               // summarize them as result here
                    if (err) {
                        return next(err);
                    }
                    next(null, result);
                });
            }
        ], cb);
    }
}