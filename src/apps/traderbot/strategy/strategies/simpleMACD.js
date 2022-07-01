// const Strategy = require('./strategy');
// const tulind = require('tulind');

// class simpleMACD extends Strategy {

//     async run({ sticks, time }) {
//         const prices = sticks.map(stick => stick.average());

//         // console.log('MACD')

//         const shortPeriod = 12;
//         const longPeriod = 26;
//         const signalPeriod = 9;
//         const indicator = tulind.indicators.macd.indicator;

//         const results = await indicator([prices], [shortPeriod, longPeriod, signalPeriod]);

//         const histogram = results[2];
//         const signal = results[1];
//         const macd = results[0];

//         // const lastHisto = histogram[histogram.length-1];
//         // const lastSignal = signal[signal.length - 1];
//         // const lastMACD = macd[macd.length - 1];
//         // const subbed = (lastMACD - lastSignal) === lastHisto
//         // console.log(`${lastMACD} ${lastSignal} ${lastHisto} ${subbed}`);

//         const length = histogram.length;
//         if (length < 2) return;

//         const penultimate = histogram[length - 2];
//         const last = histogram[length - 1];

//         const boundary = 0;

//         const wasAbove = penultimate > boundary;
//         const wasBelow = penultimate < boundary;
//         const isAbove = last > boundary;
//         const isBelow = last < -boundary;

//         const open = this.getOpenPositions();

//         const price = sticks[sticks.length - 1].close;

//         if (open.length == 0) {
//             if (wasAbove && isBelow) {
//                 this.onBuySignal({ price, time });
//             }
//         }
//         else {
//             open.forEach(p => {
//                 if (isAbove && wasBelow) {
//                     if (p.enter.price * 1.005 < price 
//                         /*|| p.enter.price * 0.9 > price */) {   // stop loss
//                         this.onSellSignal({ price, time, size: p.enter.size, position: p });
//                     }
//                 }
//                 else { // with stop loss
//                     // if (p.enter.price * 0.95 > price) {
//                     //     this.onSellSignal({ price, time, size: p.enter.size, position: p }); 
//                     // }
//                 }
//             }); 
//         }       
//     }
// }

// module.exports = simpleMACD;
