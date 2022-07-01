require('colors');

// environment config
require('dotenv').config(); 

const readline = require('readline');
var events = require('events');
class _events extends events{};
var e = new _events();

const yargs = require('yargs');
require('./utils/cli_handler')(yargs);

// Instantiate the CLI module object
var cli = {};

e.on('list', function(str) {
    cli.responders.list(str);
});

e.on('exit', function(str) {
    cli.responders.exit();
});

// Responders object
cli.responders = {};

// Exit
cli.responders.exit = function() {
    process.exit(0);
};

// List
cli.responders.list = function(str) {
    console.log('List invoked (not used)');
};

// Input processor
cli.processInput = function(str) {
    str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;

    // Only process the input if the user actually wrote something. Otherwise ignore
    if (str) {
        // Codify the unique strings that identify the unique questions allowed to be asked.
        var uniqueInputs = [
            'list',
            'help',
            'exit',
            'traderbot',
            // 'activate',
            // 'passivate',
            // 'stop',
            // 'state',
            // 'autotest'
        ];

        // Go through the possible inputs, emit an event when match is found
        var matchFound = false;

        uniqueInputs.some(function(input) {
            if (str.toLowerCase().indexOf(input) > -1) {
                matchFound = true;

                // what we want yargs to handle
                var yargsInputs = [
                    'help',
                    'traderbot',
                    // 'activate',
                    // 'passivate',
                    // 'stop',
                    // 'state',
                    // 'autotest'
                ];

                // var ymatched = yargsInputs.includes(str);
                var ymatched = yargsInputs.filter(yargsInput => yargsInput.indexOf(str) !== -1);
                if (ymatched) {
                    // handle by yargs
                    yargs.parse(str);
                }
                else {
                    // Emit an event matching the unique input, and  
                    // include the full string given
                    e.emit(input, str);
                }           

                return true;
            }
        });

        // If no match found, thell the user to try again
        if (!matchFound) {
            console.log("Sorry, try again");
        }
    }
    
    // add newline
    console.log();
};

// Init script
cli.init = function() {

    // Send the start message to the console, in dark blue
    console.log(`TraderBot CLi is running`.cyan.underline);
    console.log();

    // Start the interface
    var _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> '
    });

    // Create an initial prompt
    _interface.prompt();

    // Handle each line of input separately
    _interface.on('line', function(str) {
        // Send to the input processor
        cli.processInput(str);

        // Re-initialize the prompt afterwords
        _interface.prompt();
    });

    // If the user stops the CLI, kill thd associated process
    _interface.on('close', function() {
        process.exit(0);
    });
};

// Export the module
// module.exports = cli;

cli.init();
