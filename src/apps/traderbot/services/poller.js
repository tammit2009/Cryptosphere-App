
const axios             = require('axios');
const ccxt              = require('ccxt');
const moment            = require('moment');
const binance           = require('./exchanges/binance');
const config            = require('../config');
// const binance_key       = config.get('BINANCE_API_KEY');
// const binance_secret    = config.get('BINANCE_API_SECRET');

// $ npm run traderbot -- -t xsimple -r trader -x poller

class Poller {

    constructor({ asset, base, interval, poll, onTick, onError }) {
        this.asset = asset;
        this.base = base;
        this.interval = interval;
        this.pollInterval = poll;
        this.onTick = onTick;
        this.onError = onError;
        this.running = false;

        this.dex = 'binance';  // 'coingecko'
    }

    start() {
        // initialize the polling schedule
        this.pollerId = setInterval(this.doPoll, this.pollInterval, { 
            asset: this.asset, 
            base: this.base, 
            interval: this.interval,
            onTick: this.onTick,
            onError: this.onError,
            dex: this.dex
        });

        return new Promise((resolve, reject) => {
            if (this.dex == 'coingecko')
                console.log('client starting polling service towards coinGecko');
            else if (this.dex == 'binance')
                console.log('client starting polling service towards binance');
            this.running = true;
            resolve(this.running);
        });
    }

    async doPoll({ asset, base, interval, onTick, onError, dex }) {

        let market;
        const now = new Date().getTime(); 
        const oneHourAgo = now - (60 * 60 * 1e3);

        switch (dex) {
            case 'binance':
                market = `${asset}${base}`;
        
                // console.log(`POLL (${moment(new Date(oneHourAgo)).format('DD-MM-YYYY HH:mm:ss')} - ${moment(new Date(now)).format('DD-MM-YYYY HH:mm:ss')})`);

                // connect to service and get the data
                try {
                    const results = await binance.getKlines(market, interval, oneHourAgo, now);
                    const latest = results[results.length - 1];

                    const data = {
                        e: 'kline',
                        E: latest[0],
                        s: market,
                        k: {
                            t: latest[0],
                            T: latest[6],
                            s: market,
                            i: interval,
                            o: latest[1],
                            c: latest[2],
                            h: latest[3],
                            l: latest[4],
                            v: latest[5],
                            x: false   
                        }
                    }

                    if (this.previousData && now >= this.previousData.k.T) {
                        this.previousData.k.x = true;

                        // Send the previous candle if closed
                        onTick(JSON.stringify(this.previousData));
                    }
                    else {
                        // Send the current candle
                        onTick(JSON.stringify(data));
                    }

                    // Save this candle
                    this.previousData = data; 
                }
                catch (err) {
                    console.log(err);
                }  
                break;

            case 'coingecko':

                // const config = {
                //     asset: 'ETH',
                //     base: 'USDT',
                //     allocation: 0.1,    // % of our portfolio that can be allocated for each trade
                //     spread: 0.2,        // % applied to the mid range to create buy or sell limit order
                //     tickInterval: 30000
                // };
        
                market = `${asset}/${base}`;
                
                try {
                    // connect to service and get the data
                    const results = await Promise.all([
                        axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'),
                        axios.get('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd')
                    ]);
            
                    console.log(results[0].data);
                    console.log(results[1].data);
            
                    const marketPrice = results[0].data.bitcoin.usd / results[1].data.tether.usd;
        
                    // Unfortunately we are not getting OHLCV data to be passed on to the strategy 
                    // in the 'onTick' function - attempting workaround here:
            
                    const data = {
                        e: 'kline',
                        E: now,
                        s: market,
                        k: {
                            t: now,
                            T: now,
                            s: market,
                            //i: interval,
                            o: marketPrice,
                            c: marketPrice,
                            h: marketPrice,
                            l: marketPrice,
                            v: '0.00',
                            x: true   
                        }
                    }
        
                    // console.log(data);
            
                    onTick(JSON.stringify(data));
                }
                catch (err) {
                    console.log(err);
                }
                break;
        }
    }

    timedStop = (timeoutMs) => {
        if (this.running) {
            setTimeout(() => { this.stop() }, timeoutMs);
        }
    }

    stop() {
        this.running = false;
        clearInterval(this.pollerId);
        console.log('Polling stopped.');
    }

    async reconnect() {
        // try {
        //     await this.start()
        // } catch (err) {
        //     console.log('POLLER_RECONNECT: Error', new Error(err).message)
        // }
    }

    reconnectLoop = () => {
        // // repeat reconnect attempt every 5 seconds
        // setInterval(() => {
        //     if (!this.running) {
        //         this.reconnect()
        //     }
        // }, timeInterval)
    }

    // handle error
    // ws.on('error', err => {
    //     this.onError(err);
    //     this.running = false;
    //     // ws.connect();
    //     // setTimeout(this.start, reconnectInterval);
    //     reject(err)
    // });

    // handle close
    // ws.on('close', (err) => {
    //     // if (this.running) {
    //     //     ws.connect();
    //     // }
    //     this.running = false
    //     reject(err)
    // });
}

module.exports = Poller;




