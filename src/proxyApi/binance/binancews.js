const Websocket = require('ws');
const events = require('events');

let binancews = {
    EE: new events(), //event emitter
    ws: '',
    switchSymbol({ symbol }) {
        if (binancews.ws) binancews.ws.terminate();

        binancews.ws = new Websocket(
            `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth`
        );
        
        binancews.ws.on('message', binancews.processStream);
    },
    processStream(payload) {
        // console.log(payload.toString());
        const pl = JSON.parse(payload);
        binancews.EE.emit('OBUPDATES', pl);
    },
};

module.exports = binancews;

// Notes:
// Stream Name: <symbol>@depth OR <symbol>@depth@100ms

// Update Speed: 1000ms or 100ms

// Payload:
/*
{
    "e": "depthUpdate",     // Event type
    "E": 123456789,         // Event time
    "s": "BNBBTC",          // Symbol
    "U": 157,               // First update ID in event
    "u": 160,               // Final update ID in event
    "b": [                  // Bids to be updated
        [
            "0.0024",       // Price level to be updated
            "10"            // Quantity
        ]
    ],
    "a": [                  // Asks to be updated
        [
            "0.0026",       // Price level to be updated
            "100"           // Quantity
        ]
    ]
}
*/

// How to manage a local order book correctly
// 1. Open a stream to wss://stream.binance.com:9443/ws/bnbbtc@depth.
// 2. Buffer the events you receive from the stream.
// 3. Get a depth snapshot from https://api.binance.com/api/v3/depth?symbol=BNBBTC&limit=1000 .
// 4. Drop any event where u is <= lastUpdateId in the snapshot.
// 5. The first processed event should have U <= lastUpdateId+1 AND u >= lastUpdateId+1.
// 6. While listening to the stream, each new event's U should be equal to the previous event's u+1.
// 7. The data in each event is the absolute quantity for a price level.
// 8. If the quantity is 0, remove the price level.

// Receiving an event that removes a price level that is not in your local order book can 
// happen and is normal.
// Note: Due to depth snapshots having a limit on the number of price levels, a price level 
//       outside of the initial snapshot that doesn't have a quantity change won't have an 
//       update in the Diff. Depth Stream. 
//       - Consequently, those price levels will not be visible in the local order book even 
//         when applying all updates from the Diff. Depth Stream correctly and cause the local 
//         order book to have some slight differences with the real order book. 
//       - However, for most use cases the depth limit of 5000 is enough to understand the market 
//         and trade effectively.


// Raw Data
/*

{
    "e":"depthUpdate",
    "E":1656619347996,
    "s":"ETHUSDT",
    "U":17922868002,
    "u":17922868160,
    "b":[
        ["1018.73000000","4.22320000"],
        ["1018.69000000","0.00000000"],
        ["1018.67000000","0.00000000"],
        ["1018.65000000","0.01090000"],
        ["1018.64000000","1.06180000"],
        ["1018.62000000","0.00000000"],
        ["1018.58000000","0.00000000"],
        ["1018.55000000","0.00000000"],
        ["1018.54000000","0.00000000"],
        ["1018.53000000","4.85910000"],
        ["1018.52000000","4.32660000"],
        ["1018.51000000","0.93160000"],
        ["1018.50000000","6.88810000"],
        ["1018.49000000","0.00000000"],["1018.48000000","1.35010000"],["1018.47000000","0.00000000"],["1018.46000000","0.00000000"],["1018.45000000","0.00000000"],["1018.44000000","5.54090000"],["1018.43000000","0.00000000"],["1018.42000000","0.00000000"],["1018.41000000","3.01340000"],["1018.40000000","1.80310000"],["1018.39000000","2.39870000"],["1018.38000000","0.00000000"],["1018.36000000","0.11650000"],["1018.35000000","0.00000000"],["1018.30000000","0.00000000"],["1018.28000000","0.00000000"],["1018.23000000","28.27390000"],["1018.21000000","6.77990000"],["1018.20000000","0.58610000"],["1018.18000000","20.33990000"],["1018.11000000","0.24520000"],["1018.08000000","0.89250000"],["1018.07000000","0.16670000"],["1018.05000000","28.21770000"],["1017.98000000","0.00000000"],["1017.97000000","11.21730000"],["1017.96000000","0.19650000"],["1017.89000000","0.00000000"],["1017.81000000","1.78110000"],["1017.80000000","0.16840000"],["1017.74000000","27.28160000"],["1017.71000000","0.00000000"],["1017.49000000","31.39200000"],["1017.33000000","0.00000000"],["1017.31000000","0.17840000"],["1017.26000000","21.61870000"],["1017.25000000","3.24800000"],["1017.24000000","1.02540000"],
        ["1015.78000000","82.38640000"]
    ],
    "a":[
        ["1018.74000000","26.06830000"],
        ["1018.75000000","8.03770000"],
        ["1018.76000000","8.31040000"],
        ["1018.77000000","1.70330000"],
        ["1018.79000000","0.00000000"],
        ["1018.80000000","6.12820000"],
        ["1018.82000000","0.98810000"],
        ["1018.83000000","2.46120000"],
        ["1018.84000000","0.00000000"],
        ["1018.85000000","0.00000000"],["1018.86000000","0.00000000"],["1018.90000000","0.00000000"],["1018.91000000","0.82150000"],["1019.29000000","0.00000000"],["1019.33000000","0.40000000"],["1019.39000000","0.00000000"],["1019.43000000","0.80000000"],
        ["1019.68000000","1.16310000"],
        ["1019.74000000","0.00000000"]
    ]
}

*/