
// Import dependent modules 
// const sentinel = require('./apps/tradesentinel');

// Instantiate the workers object
var worker = {};

worker.sentinel = require('./apps/tradesentinel');

// Perform Sentinel Activity
worker.performTasks = function() {

    // Run tradesentinel
    worker.sentinel.run();

    // Add other tasks...

}

// Alert the user to change
worker.alertUserToStatusChange = function() {

    console.log('alert message here');
};


// Timer to execute the worker process 
worker.loop = function() {
    setInterval(function() {
        worker.performTasks();
    }, 1000 * 10);  // once every 10 seconds
};

// Init script
worker.init = function() {

    // Send to debug, in yellow '[33m'
    console.log('\x1b[33m%s\x1b[0m', 'Background worker is running'); // \x1b[33m "Background worker are running" \x1b[0m

    // Execute the first check
    // worker.performCheck();

    // Call the loop so the checks will execute later on
    worker.loop();
};


// Export the module
module.exports = worker;