// const tulind = require('tulind');

// // Re-implementing simple python plot @ 'src/scripts/pybot/index.py'

// const Strategy = require('./strategy');

// class SimpleSlowFastSMAStrategy extends Strategy {

//     constructor(data) {
//         super(data);

//         this.canBeBacktested = true; 
//         this.canBeLive       = true;
//         this.requireHistory  = true; 

//         this.closes         = [];    
//         this.slowsma        = [];
//         this.fastsma        = [];
//     }

//     async run({ sticks, time }) {

//         const SLOW_SMA_PERIOD = 25;
//         const FAST_SMA_PERIOD = 7;

//         const indicator = tulind.indicators.sma.indicator;
        
//         // console.log(tulind.indicators.sma);  // Discover tulind arguments for simple moving average 

//         const len = sticks.length;
//         // if (len < 2) { return }

//         // is the candle closed?
//         const is_candle_closed = sticks[len-1].state == 'closed';
//         const last = sticks[len-1].close;
//         const price = last;

//         if (is_candle_closed) {
//             // console.log(`candle closed at ${price}`);
//             this.closes.push(parseFloat(price));

//             const results = await Promise.all([
//                 getSMA([this.closes], [FAST_SMA_PERIOD]),  
//                 getSMA([this.closes], [SLOW_SMA_PERIOD])
//             ])

//             // Fast SMA
//             if (results[0]) {
//                 const last_fsma = results[0][0][results[0][0].length - 1];
//                 this.fastsma.push(last_fsma);
//             }
//             else {
//                 this.fastsma.push(null);
//             }

//             // Slow SMA
//             if (results[1]) {
//                 const last_ssma = results[1][0][results[1][0].length - 1];
//                 this.slowsma.push(last_ssma);
//             }
//             else {
//                 this.slowsma.push(null);
//             }

//             // print out data
//             // console.log('sticks:'); console.log(sticks);
//             // console.log('closes:'); console.log(this.closes);
//             // console.log('fast sma values:'); console.log(this.fastsma);
//             // console.log('slow sma values:'); console.log(this.slowsma);

//             ////////////////////////////////////////////////////////////////////////////
//             // Implement the Strategy
//             ////////////////////////////////////////////////////////////////////////////

//             const open = this.getOpenPositions();

//             if (this.slowsma[this.slowsma.length - 1] 
//                     && this.fastsma[this.fastsma.length - 1]) {    // ensure these values are not null
//                 if (open.length == 0) {             // limit to only 1 trade
//                     // Buy strategy: lastrow.FastSMA > lastrow.SlowSMA crossover
//                     if ((this.slowsma[this.slowsma.length - 2] > this.fastsma[this.fastsma.length - 2])
//                         && (this.slowsma[this.slowsma.length - 1] < this.fastsma[this.fastsma.length - 1])){
                        
//                         // "Buy!
//                         this.onBuySignal({ price, time });  
//                     }
//                 }
//                 else {
//                     // Sell strategy: lastrow.SlowSMA > lastrow.FastSMA crossover
//                     if ((this.slowsma[this.slowsma.length - 2] < this.fastsma[this.fastsma.length - 2]) 
//                         && (this.slowsma[this.slowsma.length - 1] > this.fastsma[this.fastsma.length - 1])) {
                        
//                         // "Sell!"
//                         open.forEach(p => {
//                             this.onSellSignal({ price, size: p.enter.size, time, position: p }); 
//                         });
//                     }
//                 }
//             }     
//         }
//     }
// }

// const getSMA = ([closes], [period]) => {

//     const indicator = tulind.indicators.sma.indicator;

//     return new Promise((resolve, reject) => {

//         if (closes.length > period) {
//             indicator([closes], [period], (err, results) => {
//                 if (err) reject(err);
//                 else resolve(results);
//             });
//         }
//         else {
//             resolve(null);
//         }
//     });
// };

// module.exports = SimpleSlowFastSMAStrategy;

// // Launcher: '$ npm run traderbot -- -i 1m -a ETH -b USDT -t slowfastma -r tester'
// // Launcher: '$ npm run traderbot -- -i 1m -a ETH -b USDT -t slowfastma -r trader'





// /////////////////////////////////////////////////////////////////////////////
// // This also works but is messy
// /////////////////////////////////////////////////////////////////////////////
// // if (this.closes.length > FAST_SMA_PERIOD) {
// //     // const results = await indicator([this.closes], [FAST_SMA_PERIOD]);
// //     const results = await getSMA([this.closes], [FAST_SMA_PERIOD]);
// //     const last_fsma = results[0][results[0].length - 1];
// //     this.fastsma.push(last_fsma);
// // }
// // else {
// //     this.fastsma.push(null);
// // }

// // if (this.closes.length > SLOW_SMA_PERIOD) {
// //     //const results = await indicator([this.closes], [SLOW_SMA_PERIOD]);
// //     const results2 = await getSMA([this.closes], [SLOW_SMA_PERIOD]);
// //     const last_ssma = results2[0][results2[0].length - 1];
// //     this.slowsma.push(last_ssma);
// // }
// // else {
// //     this.slowsma.push(null);
// // }

// // // print out data
// // // console.log('sticks:'); console.log(sticks);
// // console.log('closes:'); console.log(this.closes);
// // console.log('fast sma values:'); console.log(this.fastsma);
// // console.log('slow sma values:'); console.log(this.slowsma);

// // if (this.closes.length > FAST_SMA_PERIOD) {
// //     indicator([this.closes], [FAST_SMA_PERIOD], (err, results) => {
// //         const last_fsma = results[0][results[0].length - 1];
// //         this.fastsma.push(last_fsma);

// //         if (this.closes.length > SLOW_SMA_PERIOD) {
// //             indicator([this.closes], [SLOW_SMA_PERIOD], (err, results) => {
// //                 const last_ssma = results[0][results[0].length - 1];
// //                 this.slowsma.push(last_ssma);

// //                 // print out data
// //                 // console.log('sticks:'); console.log(sticks);
// //                 // console.log('closes:'); console.log(this.closes);
// //                 // console.log('fast sma values:'); console.log(this.fastsma);
// //                 // console.log('slow sma values:'); console.log(this.slowsma);

// //                 ////////////////////////////////////////////////////////////////////////////
// //                 // Implement the Strategy

// //                 const open = this.getOpenPositions();

// //                 if (this.slowsma[this.slowsma.length - 1] 
// //                         && this.fastsma[this.fastsma.length - 1]) {    // ensure these values are not null
// //                     if (open.length == 0) {             // limit to only 1 trade
// //                         // Buy strategy: lastrow.FastSMA > lastrow.SlowSMA crossover
// //                         if ((this.slowsma[this.slowsma.length - 2] > this.fastsma[this.fastsma.length - 2])
// //                             && (this.slowsma[this.slowsma.length - 1] < this.fastsma[this.fastsma.length - 1])){
                            
// //                             // "Buy!
// //                             this.onBuySignal({ price, time });  
// //                         }
// //                     }
// //                     else {
// //                         // Sell strategy: lastrow.SlowSMA > lastrow.FastSMA crossover
// //                         if ((this.slowsma[this.slowsma.length - 2] < this.fastsma[this.fastsma.length - 2]) 
// //                             && (this.slowsma[this.slowsma.length - 1] > this.fastsma[this.fastsma.length - 1])) {
                            
// //                             // "Sell!"
// //                             open.forEach(p => {
// //                                 this.onSellSignal({ price, size: p.enter.size, time, position: p }); 
// //                             });
// //                         }
// //                     }
// //                 }

// //                 ////////////////////////////////////////////////////////////////////////////
// //             });
// //         }
// //         else {
// //             this.slowsma.push(null);
// //         }
// //     });
// // }
// // else {
// //     this.fastsma.push(null);
// // }
// ////////////////////////////////////////////////////////////////////////////////////////////////
