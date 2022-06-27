
// set initial forked process' state
let forkedState = 'undefined'; 
let uptimeTicks = -1;

const registerChildEvents = (p) => {

    forkedState = 'init';
    uptimeTick = 0;

    p.on('message', (msg) => {
        // console.log('Message from child', msg);

        // const prevState = forkedState;
        if (msg.hasOwnProperty('state')) {
            // if (prevState !== msg['state']) { console.log('state is ' + msg['state']); }
            forkedState = msg['state'];
        }

        if (msg.hasOwnProperty('uptimeTicks')) {
            uptimeTicks = msg['uptimeTicks'];
        }
    });
    
    p.on('exit',(msg) => {
        console.log(`receiving exit code in parent process: ${msg}`);
        forkedState = 'undefined';
        // stopStateChecker(stateChecker);
    });
    
    p.on("error", (err) => {
        console.log(err);
    });
    
    // enabled by { silent: true }
    p.stdout.on('data', function(data) {
        // console.log('stdout: ==== ' + data);
        console.log('' + data);
    });
      
    // enabled by { silent: true }
    p.stderr.on('data', function(data) {
        // console.log('stdout: ' + data);
        console.log('' + data);
    });  

    // startStateChecker(p);
}

////////////////////////////////////////////////////////////////////////////////////
// Monitor the child's state (pull)

let stateChecker;

const startStateChecker = (p) => {
    // check the state every 2 seconds
    stateChecker = setInterval(() => {
        p.send({ command: 'get_state' });
    }, 2000);
};

const stopStateChecker = (stateChecker) => {
    clearInterval(stateChecker);
};

//////////////////////////////////////////////////////////////////////////////////////////

const getForkedState = async (p) => {
    if (p) {
        p.send({ command: 'get_state' });
    }
    await sleep(1000);
    return { forkedState, uptimeTicks };
};

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//////////////////////////////////////////////////////////////////////////////////////////


module.exports = { registerChildEvents, getForkedState, sleep };