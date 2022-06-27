const axios = require('axios');

const baseUrl = process.env.BASE_URL;

const cliHandler = (yargs) => {

    const mktConfig = {
        asset: 'ETH',
        base: 'USDT',
        allocation: 0.1,    // % of our portfolio that can be allocated for each trade
        spread: 0.2,        // % applied to the mid range to create buy or sell limit order
        tickInterval: 30000
    };

    console.log('Market: ', `${mktConfig.asset}${mktConfig.base}`);  // 'ETH/USDT'

    const now = new Date().getTime(); 
    const yesterday = now - (24 * 60 * 60 * 1e3);

    console.log('now: ', new Date(now));

    // Customize yargs
    yargs.version('1.1.0');

    // List command
    yargs.command({
        command: 'list',
        describe: 'List notes',
        handler() {

            console.log('List invoked');

        }
    });
    
    // traderbot command
    yargs.command({
        command: 'traderbot',
        describe: 'Run traderbot app',
        builder: {

            interval: {                    
                describe: 'Interval (15s, 30s, 1m...)',
                alias: 'i',
                demandOption: false,     // required    
                type: 'string',          // array, boolean (default), count, number, string
                default: '1m'
            },
            asset: {
                describe: 'Asset',
                alias: 'a',
                demandOption: true,
                type: 'string',
                default: `${mktConfig.asset}`
            },
            base: {
                describe: 'Base',
                alias: 'b',
                demandOption: true,
                type: 'string',
                default: `${mktConfig.base}`
            },
            strategy: {
                describe: 'Strategy',
                alias: 't',
                demandOption: true,
                type: 'string',
                default: 'simple'
            },
            start: {
                describe: 'Start Time in unix ms',
                alias: 's',
                demandOption: true,
                type: 'number',
                default: yesterday
            },
            end: {
                describe: 'End Time in unix ms',
                alias: 'e',
                demandOption: true,
                type: 'number',
                default: now
            },
            type: {
                describe: 'Run Type (Back Test or Trading)',
                alias: 'r',
                demandOption: true,
                type: 'string',
                default: 'backtester'  // 'backtester' or 'trader'
            },
            funds: {
                describe: 'Funds Available',
                alias: 'f',
                demandOption: true,
                type: 'number',
                default: 100
            },
            ticksrc: {
                describe: 'Tick Source',
                alias: 'x',
                demandOption: true,
                type: 'string',
                default: 'ticker'  // 'ticker' or 'poller'
            },
            live: {
                describe: 'Run Live Trading (i.e. execute physical trades)',
                alias: 'l',
                demandOption: true,
                type: 'boolean',
                default: false
            },
            exestate: {
                describe: 'Required Execution State (i.e. start, stop, ...)',
                alias: 'z',
                demandOption: true,
                type: 'string',
                default: 'start'
            }
        },
        async handler(argv) {
            // console.log(argv);
            const { interval, asset, base, strategy, start, end, type, funds, live, ticksrc, exestate } = argv;

            // if (type == 'trader') {
            //     console.log('Starting Trader');
            //     // const trader = new Trader({
            //     //     reporter, start, end, interval, asset, base, strategyType: strategy, type, funds, live, ticksrc
            //     // });
            //     // await trader.start();
            // }
            // else {
            //     console.log('Starting Backtester');
            //     // const tester = new Backtester({
            //     //     reporter, start, end, interval, asset, base, strategyType: strategy
            //     // });
            //     // await tester.start();
            // }

            try {
                if (exestate === 'state') { // check current state of either backtester or trader
                    const resp = await axios.get(`${baseUrl}/traderbot/${exestate}`);
                    console.log(resp.data);
                }
                else {
                    const resp = await axios.post(`${baseUrl}/traderbot/${type}/${exestate}`, {
                        interval, asset, base, strategy, start, end, type, funds, live, ticksrc
                    });
                    console.log(resp.data);
                }
            }
            catch(err) {
                if (err.code === 'ECONNREFUSED') {
                    return console.log('Unable to connect to the service');
                }

                console.log(err);
            };
 
        }
    });

    // Start command
    // yargs.command({
    //     command: 'start',
    //     describe: 'Start the scheduler',
    //     async handler() {
    //         try {
    //             const resp = await axios.get(`${baseUrl}/scheduler/start`);
    //             console.log(resp.data);
    //         }
    //         catch(err) {
    //             if (err.code === 'ECONNREFUSED') {
    //                 return console.log('Unable to connect to the service');
    //             }

    //             console.log(err);
    //         };
    //     }
    // });

    // // Activate command
    // yargs.command({
    //     command: 'activate',
    //     describe: 'Activate the scheduler',
    //     async handler() {
    //         try {
    //             const resp = await axios.get(`${baseUrl}/scheduler/activate`);
    //             console.log(resp.data);
    //         }
    //         catch(err) {
    //             if (err.code === 'ECONNREFUSED') {
    //                 return console.log('Unable to connect to the service');
    //             }

    //             console.log(err);
    //         }
    //     }
    // });

    // // Passivate command
    // yargs.command({
    //     command: 'passivate',
    //     describe: 'Passivate the scheduler',
    //     async handler() {
    //         try {
    //             const resp = await axios.get(`${baseUrl}/scheduler/passivate`);
    //             console.log(resp.data);
    //         }
    //         catch(err) {
    //             if (err.code === 'ECONNREFUSED') {
    //                 return console.log('Unable to connect to the service');
    //             }

    //             console.log(err);
    //         }
    //     }
    // });

    // // Stop command
    // yargs.command({
    //     command: 'stop',
    //     describe: 'Stop the scheduler',
    //     async handler() {
    //         try {
    //             const resp = await axios.get(`${baseUrl}/scheduler/stop`);
    //             console.log(resp.data);
    //         }
    //         catch(err) {
    //             if (err.code === 'ECONNREFUSED') {
    //                 return console.log('Unable to connect to the service');
    //             }

    //             console.log(err);
    //         }
    //     }
    // });

};


module.exports = cliHandler;

