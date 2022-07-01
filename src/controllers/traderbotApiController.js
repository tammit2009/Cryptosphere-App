
/****************************/
/*** Traderbot Controller ***/
/****************************/

const asyncHandler  = require('express-async-handler');
const createError   = require('http-errors');
const async         = require('async');
const axios         = require('axios');

const { fork }      = require('child_process');
const { registerChildEvents, getForkedState, sleep } = require('../utils/parent_events');

let forked = false;
let apptype = 'undefined';

/*
 * Run Trader
 * Method: 'POST', url = '/traderbot/trader/:exestate', Access: 'Public'
 */
const runTrader = asyncHandler(async (req, res) => {
    const exestate = req.params.exestate;
    let message;

    const data = req.body;

    if (exestate === 'start') {
        if (!forked) {
            forked = fork('./src/child.js', ['trader', JSON.stringify(data)], { silent: true });
            registerChildEvents(forked);
            await sleep(2500);          // allow the child process to startup
            forked.send({ command: 'start' });

            // temporary
            apptype = 'Trader';
            message = `${apptype} Started`;
        }
        else {
            // temporary
            message = `${apptype} already started`;
        } 
    }
    else if (exestate === 'stop') {
        if (forked) {
            forked.send({ command: 'stop' });
            forked = false;

            // temporary
            message = `${apptype} stopped`;
            apptype = 'undefined';
        }
        else {
            // temporary
            message = `${apptype} already stopped`;
        } 
    }

    const { forkedState, uptimeTicks } = await getForkedState(forked);

    res.json({ 
        statusCode: 200, 
        message, 
        exestate, 
        forkedState, 
        uptimeTicks,
        //data // temporary 
    });
});


/*
 * Run Backtester
 * Method: 'POST', url = '/traderbot/backtester/:exestate', Access: 'Public'
 */
const runBacktester = asyncHandler(async (req, res) => {
    const exestate = req.params.exestate;
    let message;

    const data = req.body;
    
    if (exestate === 'start') {
        if (!forked) {
            forked = fork('./src/child.js', ['backtester', JSON.stringify(data)], { silent: true });
            registerChildEvents(forked);
            await sleep(2500);          // allow the child process to startup
            forked.send({ command: 'start' });

            // temporary
            apptype = 'Backtester';
            message = `${apptype} Started`;
        }
        else {
            // temporary
            message = message = `${apptype} already started`;
        }
    }
    else if (exestate === 'stop') {
        if (forked) {
            forked.send({ command: 'stop' });
            forked = false;

            // temporary
            message = `${apptype} stopped`;
            apptype = 'undefined';
        }
        else {
            // temporary
            message = `${apptype} already stopped`;
        }  
    }

    const { forkedState, uptimeTicks } = await getForkedState(forked);

    res.json({ 
        statusCode: 200, 
        message, 
        exestate, 
        forkedState, 
        uptimeTicks,
        //data // temporary
    });
});


/*
 * Run Trader
 * Method: 'GET', url = '/traderbot/state', Access: 'Public'
 */
const checkTraderbotState = asyncHandler(async (req, res) => {
    const { forkedState, uptimeTicks } = await getForkedState(forked);
    res.json({ apptype, forkedState, uptimeTicks });
});


// /*
//  * Start the scheduler 
//  * Method: 'GET', url = '/scheduler/start', Access: 'Public'
//  */
// const startScheduler = asyncHandler(async (req, res) => {
//     if (!forked) {
//         forked = fork('./src/child.js', ['arg1', 'arg2', 'arg3'], { silent: true });
//         registerChildEvents(forked);
//         await sleep(2500);          // allow the child process to startup
//     }
//     forked.send({ command: 'start' });
//     const { forkedState, uptimeTicks } = await getForkedState(forked);
//     res.json({ command: 'start', forkedState, uptimeTicks });
// });

// /*
//  * Activate the scheduler 
//  * Method: 'GET', url = '/scheduler/activate', Access: 'Public'
//  */
// const activateScheduler = asyncHandler(async (req, res) => {
//     forked.send({ command: 'activate' });            
//     const { forkedState, uptimeTicks } = await getForkedState(forked);
//     res.json({ command: 'activate', forkedState, uptimeTicks });
// });

// /*
//  * Passivate the scheduler 
//  * Method: 'GET', url = '/scheduler/passivate', Access: 'Public'
//  */
// const passivateScheduler = asyncHandler(async (req, res) => {
//     forked.send({ command: 'passivate' });
//     const { forkedState, uptimeTicks } = await getForkedState(forked);
//     res.json({ command: 'passivate', forkedState, uptimeTicks });
// });

// /*
//  * Stop the scheduler 
//  * Method: 'GET', url = '/scheduler/stop', Access: 'Public'
//  */
// const stopScheduler = asyncHandler(async (req, res) => {
//     if (forked) {
//         forked.send({ command: 'stop' });
//         forked = false;
//     }
//     const { forkedState, uptimeTicks } = await getForkedState(forked);
//     res.json({ command: 'stop', forkedState, uptimeTicks });
// });

// /*
//  * Fetch the state of the scheduler 
//  * Method: 'GET', url = '/scheduler/stop', Access: 'Public'
//  */
// const getSchedulerState = asyncHandler(async (req, res) => {
//     const { forkedState, uptimeTicks } = await getForkedState(forked);
//     res.json({ command: 'state', forkedState, uptimeTicks });
// });


module.exports = { 
    runTrader,
    runBacktester,
    checkTraderbotState,
    // startScheduler, 
    // activateScheduler, 
    // passivateScheduler, 
    // stopScheduler, 
    // getSchedulerState
};