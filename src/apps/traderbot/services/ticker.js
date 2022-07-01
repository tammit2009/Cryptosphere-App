// const WebSocket = require('ws');

// const reconnectInterval = 2000;  // 2s

// class Ticker {

//     constructor({ asset, base, interval, onTick, onError }) {
//         this.market = `${asset.toLowerCase()}${base.toLowerCase()}`;
//         this.interval = interval;
//         this.onTick = onTick;
//         this.onError = onError;
//         this.running = false;

//         // console.log('Constructor Ticker');
//     }

//     start() {

//         const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${this.market}@kline_${this.interval}`);
//         this.wsClient = ws;

//         return new Promise((resolve, reject) => {
//             console.log('client connecting to binance ws...')

//             ws.on('open', () => {
//                 this.running = true
//                 resolve(this.running)
//             });

//             // Tick Source
//             ws.on('message', async (data) => {
//                 this.onTick(data.toString()); 
//             });
    
//             ws.on('error', err => {
//                 this.onError(err);
//                 this.running = false;
//                 // ws.connect();
//                 // setTimeout(this.start, reconnectInterval);
//                 reject(err)
//             });
    
//             ws.on('close', (err) => {
//                 // if (this.running) {
//                 //     ws.connect();
//                 // }
//                 this.running = false
//                 reject(err)
//             });
//         });
//     }

//     async reconnect() {
//         try {
//             await this.start()
//         } catch (err) {
//             console.log('WEBSOCKET_RECONNECT: Error', new Error(err).message)
//         }
//     }

//     reconnectLoop = () => {
//         // repeat reconnect attempt every 5 seconds
//         setInterval(() => {
//             if (!this.running) {
//                 this.reconnect()
//             }
//         }, timeInterval)
//     }

//     timedStop = (timeoutMs) => {
//         if (this.running) {
//             setTimeout(() => { this.stop() }, timeoutMs);
//         }
//     }

//     stop() {
//         this.running = false;
//         this.wsClient.close();
//     }

// }

// module.exports = Ticker;