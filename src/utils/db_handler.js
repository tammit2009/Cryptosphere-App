// Dependencies
const CronSchedule = require('../models/cronschedule');
const Job          = require('../models/job');
// const helpers      = require('./helpers');

// Define the filedb_handler
var handler = {};

// // Create cron - cronLabel is the unique property
// handler.createCron = async function(data, callback) {

//     // validate inputs
//     var cronLabel = typeof(data.cronLabel) == 'string' ? data.cronLabel : false;
//     var frequency = typeof(data.frequency) == 'string'  ? data.frequency : false;
//     var handler = typeof(data.handler) == 'string' ? data.handler : false;
//     var active = typeof(data.active) == 'boolean' ? true : false;

//     if (cronLabel && frequency && handler && active) {

//         // Make sure that the cron does not alreay exist
//         const cronScheduleExists = await CronSchedule.findOne({ cronLabel });
//         if (cronScheduleExists) {
//             return callback({ statusCode: 400, 'Error': 'A cron with that cronLabel already exists' }, undefined);   
//         }

//         // Create the cron object
//         var cronObject = {
//             'cronLabel': cronLabel,
//             'frequency': frequency,
//             'handler': handler,
//             'active': active
//         };

//         // Store the cron
//         try {
//             const cron = await CronSchedule.create(cronObject);
//             await cron.save();
//             callback(undefined, { statusCode: 200, cron });
//         }
//         catch(err) {
//             console.log(err);
//             callback({ statusCode: 500, 'Error': 'Could not create the cron' }, undefined);
//         }
//     }
//     else {
//         callback({ statusCode: 400, 'Error': 'Missing required fields'}, undefined);
//     }
// };

// // Read crons
// handler.readCrons = async function(query, callback) {

//     const match = {};
//     const sort = {};
//     let limit = 10;
//     let skip = 0;

//     if (query.sortBy) {
//         const parts = query.sortBy.split(':');
//         sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
//     }

//     if (query.limit) {
//         limit = parseInt(query.limit);
//     }

//     if (query.skip) {
//         skip = parseInt(query.skip);
//     }

//     try {
//         const crons = await CronSchedule.find({}, null, {
//             match,
//             limit,
//             skip,
//             sort
//         });

//         callback(undefined, { statusCode: 200, crons });
//     }
//     catch (err) {
//         console.log(err);
//         callback({ statusCode: 404 });
//     }
// };

// // Read cron
// handler.readCron = async function(data, callback) {
//     var cronLabel = typeof(data.cronLabel) == 'string' ? data.cronLabel : false;
//     if (cronLabel) {
//         // Lookup cron
//         try {
//             const cron = await CronSchedule.findOne({ cronLabel });
//             if (cron) {
//                 callback(undefined, { statusCode: 200, cron });
//             }
//             else {
//                 callback({ statusCode: 404, 'Error': 'Unable to find specified cron' }, undefined);
//             }
//         }
//         catch (err) {
//             console.log(err);
//             callback({ statusCode: 500 }, undefined);
//         }
//     }
//     else {
//         callback({ statusCode: 400, 'Error': 'Missing required field' }, undefined);
//     }
// };

// // Read cron jobs
// handler.readCronJobs = async function(query, callback) {
//     const match = {};
//     const sort = {};
//     let limit = 10;
//     let skip = 0;

//     if (query.sortBy) {
//         const parts = query.sortBy.split(':');
//         sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
//     }

//     if (query.limit) {
//         limit = parseInt(query.limit);
//     }

//     if (query.skip) {
//         skip = parseInt(query.skip);
//     }

//     var cronLabel = typeof(query.cronLabel) == 'string' ? query.cronLabel : false;
//     if (cronLabel) {

//         try {
//             // Lookup cron
//             const cron = await CronSchedule.findOne({ cronLabel }).populate({
//                 path: 'jobs',
//                 match,
//                 options: { limit, skip, sort }
//             });    

//             // console.log(cron);
//             callback(undefined, { statusCode: 200, jobs: cron.jobs });
//         }
//         catch (err) {
//             console.log(err);
//             callback({ statusCode: 404 });
//         }
//     }
//     else {
//         callback(400, { 'Error': 'Missing required field' });
//     }
// };

// // Update cron
// handler.updateCron = async function(cronLabel, data, callback) {

//     const updates = Object.keys(data);
//     const allowedUpdates = ['frequency', 'handler', 'active'];
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

//     if (!isValidOperation) {
//         return callback({ statusCode: 400, 'Error': 'Bad Request - Invalid Fields for Update' }, undefined);
//     }

//     // Check for the required field
//     var cronLabel = typeof(cronLabel) == 'string' ? cronLabel.trim() : false;

//     // Check and validate the optional fields
//     var frequency = typeof(data.frequency) == 'string' ? data.frequency : false;
//     var handler = typeof(data.handler) == 'string' ? data.handler : false;
//     var active = typeof(data.active) == 'boolean' ? (data.active ? 'true' : 'false') : false;

//     // Error if the cronLabel is invalid
//     if (cronLabel) {
//         // Error if nothing is sent to update
//         if (frequency || handler || active) {
            
//             try {
//                 // Lookup the cron
//                 const cron = await CronSchedule.findOne({ cronLabel });

//                 // Update the necessary fields
//                 if (frequency) {
//                     cron.frequency = frequency;
//                 }
//                 if (handler) {
//                     cron.handler = handler;
//                 }
//                 if (active) {
//                     cron.active = active === 'true' ? true : false;
//                 }

//                 // Store the new updates
//                 const savedCron = await cron.save();
//                 if (savedCron) {
//                     callback(undefined, { statusCode: 200 });
//                 }
//                 else {
//                     callback({ statusCode: 500, 'Error': 'Could not update the field(s)' }, undefined);
//                 }
//             }
//             catch (err) {
//                 console.log(err);
//                 callback({ statusCode: 500, 'Error': 'Could not update the field(s)' }, undefined);
//             }        
//         }
//         else {
//             callback({ statusCode: 400,  'Error': 'Missing fields to update' });
//         }
//     }
//     else {
//         callback({ statusCode: 400, 'Error': 'Missing required field' }, undefined);
//     }
// };

// // Delete cron
// handler.deleteCron = async function(data, callback) {

//     // Check that the cronLabel provided is valid
//     var cronLabel = typeof(data.cronLabel) == 'string' ? data.cronLabel.trim() : false;
     
//     if (cronLabel) {
//         // Lookup cron
//         try {
//             const cron = await CronSchedule.findOne({ cronLabel }).populate('jobs');
//             // console.log(cron);
//             if (cron) {
                
//                 // Delete each of the jobs associated with the cron
//                 var cronJobs = typeof(cron.jobs) == 'object' && cron.jobs instanceof Array ? cron.jobs : [];
//                 var jobsToDelete = cronJobs.length;
//                 if (jobsToDelete > 0) {
//                     var jobsDeleted = 0;
//                     var deletionErrors = false;

//                     // Loop through the jobs
//                     // const jobIds = cron.jobs.map((job) => job._id);
//                     cronJobs.forEach( async function(cronJob) {
//                         const job = await Job.findById(cronJob._id);
//                         if (job) {
//                             try {
//                                 await job.remove();
//                                 jobsDeleted++;
//                             }
//                             catch(e) {
//                                 deletionErrors = true;
//                             }
//                         }
//                     });
//                 }

//                 // Now delete the cron itself
//                 await cron.remove();

//                 callback(undefined, 200);

//                 // TODO: async.all or waterfall to process synchronously (see ref example below)
//                 // if (jobsDeleted == jobsToDelete) {
//                 //     console.log('EQUAL')
//                 //     if (!deletionErrors) {
//                 //         callback(undefined, 200);
//                 //     }
//                 //     else {
//                 //         callback({ statusCode: 500, 'Error' : 'Errors encountered while attempting to delete all of the cron\'s jobs. All jobs may not have been deleted from the system successfully' }, undefined);
//                 //     }
//                 // }

//                 // Ref Example
//                 // _data.list('crons', function(err, crons) {
//                 //     if (!err && crons) {
//                 //         const cronDataArr = [];
//                 //         const promises = crons.map(cron => {
//                 //             return new Promise(function (resolve, reject) {
//                 //                 _data.read('crons', cron, function(err, data) {
//                 //                     if (!err && data) {
//                 //                         cronDataArr.push(data);
//                 //                         resolve(data);
//                 //                     }
//                 //                     else { reject(404); }
//                 //                 })
//                 //             });
//                 //         });
//                 //         Promise.all(promises).then(() => { callback(undefined, cronDataArr); })
//                 //     }
//                 //     else {
//                 //         callback({ statusCode: 404 });
//                 //     }
//                 // });

//             }
//             else {
//                 callback({ statusCode: 400, 'Error': 'Could not find the specified cron' });
//             }
//         }
//         catch (err) {
//             callback({ statusCode: 500, 'Error': 'database error' });
//         }  
//     }
//     else {
//         callback({ statusCode: 400, 'Error': 'Missing required field' }, undefined);
//     }
// };

// // Create job - send the cronLabel along with the data
// handler.createJob = async function(data, callback) {

//     // Check that the cronId is valid
//     var cronLabel = typeof(data.cronLabel) == 'string' ? data.cronLabel.trim() : false;

//     // validate inputs
//     var jobLabel = typeof(data.jobLabel) == 'string' ? data.jobLabel : false;
//     var nextRunningTime = typeof(data.nextRunningTime) == 'string' ? data.nextRunningTime : false;
//     var status = typeof(data.status) == 'string' ? data.status : false;
//     var type = typeof(data.type) == 'string' ? data.type : false;
//     var repeat = typeof(data.repeat) == 'number' ? data.repeat : false;
//     var guard = typeof(data.guard) == 'string' ? data.guard : false;
//     var handler = typeof(data.handler) == 'string' ? data.handler : false;

//     if (jobLabel && nextRunningTime && status && type && repeat && guard && handler) {

//         // Lookup the cron data
//         const cron = await CronSchedule.findOne({ cronLabel });
//         if (!cron) {
//             return callback({ statusCode: 400, 'Error': 'Not found: cronLabel' }, undefined);   
//         }

//         var cronJobs = typeof(cron.jobs) == 'object' && cron.jobs instanceof Array ? cron.jobs : [];

//         // Create a random id for the new job
//         //var jobId = helpers.createRandomString(20);

//         // Create the job object
//         var jobObject = {
//             // id: jobId,
//             jobLabel,
//             nextRunningTime,
//             status,
//             type,                                  
//             repeat,                                         
//             guard,                                       
//             handler,
//             cronParent: cron._id
//         };

//         // Save the job object
//         // Store the cron
//         try {
//             const job = await Job.create(jobObject);
//             await job.save();

//             // Now add the jobId to the owner cron object
//             cronJobs.push(job._id);
//             cron.jobs = cronJobs;

//             // Save the cron's jobs data
//             await cron.save();

//             // Return the data about the new job
//             callback(undefined, { statusCode: 200, job });
//         }
//         catch(err) {
//             console.log(err);
//             callback({ statusCode: 500, 'Error': 'Could not create the job' }, undefined);
//             // callback({ statusCode: 500, 'Error': 'Could not update the cron with the new job' });
//         }
//     }
// };

// // Read jobs
// handler.readJobs = async function(query, callback) {
//     const match = {};
//     const sort = {};
//     let limit = 10;
//     let skip = 0;

//     if (query.sortBy) {
//         const parts = query.sortBy.split(':');
//         sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
//     }

//     if (query.limit) {
//         limit = parseInt(query.limit);
//     }

//     if (query.skip) {
//         skip = parseInt(query.skip);
//     }

//     try {
//         const jobs = await Job.find({}, null, {
//             match,
//             limit,
//             skip,
//             sort
//         });

//         callback(undefined, { statusCode: 200, jobs });
//     }
//     catch (err) {
//         console.log(err);
//         callback({ statusCode: 404 });
//     }
// };

// // Read job
// handler.readJob = async function(data, callback) {

//     // Check that the jobId is valid
//     var id = typeof(data.jobId) == 'string' ? data.jobId.trim() : false;
//     if (id) {
//         // Lookup the job
//         try {
//             const job = await Job.findById(id);
//             if (job) {
//                 callback(undefined, { statusCode: 200, job });
//             }
//             else {
//                 callback({ statusCode: 404, 'Error': 'Unable to find specified job' }, undefined);
//             }
//         }
//         catch (err) {
//             console.log(err);
//             callback({ statusCode: 500 }, undefined);
//         }
//     }
//     else {
//         callback(400, { 'Error': 'Missing required field!' });
//     }
// };

// // Update job
// handler.updateJob = async function(jobId, data, callback) {

//     const updates = Object.keys(data);
//     const allowedUpdates = [
//         // 'cronParent', 
//         'jobLabel', 
//         'nextRunningTime', 
//         'status', 
//         'type', 
//         'repeat',
//         'guard',
//         'handler'
//     ];
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
//     if (!isValidOperation) {
//         return callback({ statusCode: 400, 'Error': 'Bad Request - Invalid Fields for Update' }, undefined);
//     }

//     // Check for the required fields (jobId)
//     var _id = typeof(jobId) == 'string' ? jobId.trim() : false;

//     // Check and validate the optional fields
//     var jobLabel = typeof(data.jobLabel) == 'string'  ? data.jobLabel : false;
//     var nextRunningTime = typeof(data.nextRunningTime) == 'string' ? data.nextRunningTime : false;
//     var status = typeof(data.status) == 'string' ? data.status : false;
//     var type = typeof(data.type) == 'string' ? data.type : false;
//     var repeat = typeof(data.repeat) == 'number' ? data.repeat : false;
//     var guard = typeof(data.guard) == 'string' ? data.guard : false;
//     var handler = typeof(data.handler) == 'string' ? data.handler : false;

//     // Check to make sure the id is valid
//     if (_id) {
//         // Check to make sure one or more optional fields has been sent
//         if (jobLabel || nextRunningTime || status || type || repeat || guard || handler) {
            
//             try {
//                 // Lookup the job
//                 const job = await Job.findOne({ _id });

//                 // Update the job where necessary
//                 if (jobLabel) {
//                     job.jobLabel = jobLabel;
//                 }
//                 if (nextRunningTime) {
//                     job.nextRunningTime = nextRunningTime;
//                 }
//                 if (status) {
//                     job.status = status;
//                 }
//                 if (type) {
//                     job.type = type;
//                 }
//                 if (repeat) {
//                     job.repeat = repeat;
//                 }
//                 if (guard) {
//                     job.guard = guard;
//                 }
//                 if (handler) {
//                     job.handler = handler;
//                 }

//                 // Store the new updates
//                 const savedJob = await job.save();
//                 if (savedJob) {
//                     callback(undefined, { statusCode: 200 });
//                 }
//                 else {
//                     callback({ statusCode: 500, 'Error': 'Could not update the field(s)' }, undefined);
//                 }
//             }
//             catch (err) {
//                 console.log(err);
//                 callback({ statusCode: 500, 'Error': 'Could not update the field(s)' }, undefined);
//             }
//         }
//         else {
//             callback(400, { 'Error': 'Missing fields to update' });
//         }
//     }
//     else {
//         callback({ statusCode: 400, 'Error': 'Missing required field' });
//     }

// };

// // delete job
// handler.deleteJob = async function(data, callback) {
//     // Check that the jobId is valid
//     var _id = typeof(data.jobId) == 'string' ? data.jobId.trim() : false;
//     if (_id) {
//         // Lookup the job
//         try {
//             const job = await Job.findById(_id);
//             if (job) {
//                 await job.remove();
//                 callback(undefined, 200);
//             }   
//             else {
//                 callback({ statusCode: 404, 'Error': 'Job not found.' }, undefined);
//             }
//         }
//         catch (err) {
//             callback({ statusCode: 500, 'Error': 'Database Error.' }, undefined);
//         }
//     }
//     else {
//         callback({ statusCode: 400, 'Error': 'Missing required field!' }, undefined);
//     }
// }

// Export the module
module.exports = handler;