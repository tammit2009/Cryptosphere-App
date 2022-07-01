// const tulind = require('tulind');

// // "RSI-Bot"
// // Concept from Coding with Larry 'Build a Real Time Crypto Trading Bot in under 100 lines of Code'

// const Strategy = require('./strategy');

// class SimpleRSI01Strategy extends Strategy {

//     constructor(data) {
//         super(data);

//         this.canBeBacktested = true; 
//         this.canBeLive       = true;
//         this.requireHistory  = true; 

//         this.closes         = [];    
//         this.rsi            = [];
//     }

//     async run({ sticks, time }) {

//         const RSI_PERIOD     = 14;
//         const RSI_OVERBOUGHT = 70;
//         const RSI_OVERSOLD   = 30;

//         const indicator = tulind.indicators.rsi.indicator;
        
//         // Discover tulind arguments for rsi 
//         // console.log(tulind.indicators.rsi);

//         const len = sticks.length;
//         // if (len < 2) { return }

//         // is the candle closed?
//         const is_candle_closed = sticks[len-1].state == 'closed';
//         // const penu = sticks[len-2].close;
//         const last = sticks[len-1].close;
//         const price = last;

//         if (is_candle_closed) {
            
//             console.log(`candle closed at ${price}`);
//             this.closes.push(parseFloat(price));
            
//             if (this.closes.length > RSI_PERIOD) {
//                 const results = await indicator([this.closes], [RSI_PERIOD]);
//                 const last_rsi = results[0][results[0].length - 1];
//                 this.rsi.push(last_rsi);
//             }
//             else {
//                 this.rsi.push(null);
//             }

//             // console.log('sticks:')
//             // console.log(sticks);

//             // console.log('closes:')
//             // console.log(this.closes);

//             // console.log('rsi values:')
//             // console.log(this.rsi);

//             // Implement the Strategy

//             const open = this.getOpenPositions();

//             if (this.rsi[this.rsi.length - 1]) {    // ensure this value is not null

//                 if (open.length == 0) {             // limit to only 1 trade
//                     // Buy strategy: rsi < 30%
//                     if (this.rsi[this.rsi.length - 1] < RSI_OVERSOLD) {
//                         // "Buy!
//                         this.onBuySignal({ price, time });  
//                     }
//                 }
//                 else {
//                     // Sell strategy: rsi > 70%
//                     if (this.rsi[this.rsi.length - 1] > RSI_OVERBOUGHT) {
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

// module.exports = SimpleRSI01Strategy;

// // Launcher: '$ npm run traderbot -- -i 1m -a ETH -b USDT -t rsi01 -r tester'
// // Launcher: '$ npm run traderbot -- -i 1m -a ETH -b USDT -t rsi01 -r trader'