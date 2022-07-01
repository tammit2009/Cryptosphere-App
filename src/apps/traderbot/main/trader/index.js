const randomstring          = require('randomstring');
const moment                = require('moment');
const Runner                = require('../runner');
const Candlestick           = require('../../models/candlestick');
const Ticker                = require('../../services/ticker');
const Poller                = require('../../services/poller');
const Broker                = require('../../services/broker');
const { intervalToSeconds } = require('../../services/exchanges/binance');
const config                = require('../../config');

class Trader extends Runner {

    constructor(data) {
        super(data); // startTime, endTime, interval, asset, base, strategyType already handled in super()

        this.isLive       = data.live;
        this.long_funds   = parseFloat(config.get('L_long_fund')); // data.funds;
        this.short_funds  = parseFloat(config.get('L_short_fund'));
        this.allocation   = parseFloat(config.get('L_allocation'));

        // create a broker to handle transactions with the exchange
        this.broker = new Broker({ isLive: this.isLive, asset: this.asset, base: this.base });

        if (data.ticksrc == 'poller') {
            console.log('Starting Poller');
            // ceate a poller for live data
            this.ticker = new Poller({
                asset: this.asset, 
                base: this.base,
                interval: this.interval,
                poll: 5000,  // ms
                onTick: async (tick) => { await this.onTick(tick) },
                onError:     (error) => { this.onError(error) }
            });
        }
        else {
            console.log('Starting Ticker');
            // create a ticker for live data
            this.ticker = new Ticker({
                asset: this.asset, 
                base: this.base,
                interval: this.interval,
                onTick: async (tick) => { await this.onTick(tick) },
                onError:     (error) => { this.onError(error) }
            });
        }
    }

    async start() {

        console.log('Starting Trader');

        if (!this.strategy.canBeLive) {
            console.log('Live trading not applicable for this strategy');
            return;
        }

        try { 
            this.currentCandle = null;
            if (this.strategy.requireHistory) this.history = await this.historical.getData();
            else this.history = [];  // e.g. for xsimple demo

            // start the broker
            this.broker.start();  
            
            // start the websocket or poll service to refresh data
            await this.ticker.start();  // this.ticker.timedStop(15000);
        }
        catch(err) { 
            // this.ticker.reconnect(); // this.ticker.timedStop(15000);
        }
    }

    async onBuySignal({ price, size, time, position }) {    

        console.log(`BUY BUY BUY ${price}`);

        if (position && this.strategy.getPosition(position.id)) {

            // already in a short position (strategy.getPosition(id)), close the  
            // position with a 'BUY' transaction
            console.log('Already in a SHORT position, close the position')

            const result = await this.broker.buy({ size, price, oid: position.id, trade: 'close_short' });
            // console.log('result: ', result)
            if (!result) { return };
            
            this.strategy.positionClosed({
                price: result.price, 
                time, 
                size: result.size, 
                id: result.oid
            });
        }
        else {
            // not in a position, open a new LONG position with a BUY transaction
            const exec_fund = this.long_funds * this.allocation;
            const result = await this.broker.buy({ funds: exec_fund, price, trade: 'open_long' });  
            // console.log('result: ', result)
            if (!result) { return };

            const oid = result.oid ? result.oid : randomstring.generate(20);
            console.log('Opening position with price: ', result.price, ', time: ',  time, ', size: ', result.size, ', oid: ', oid)

            this.strategy.positionOpened({
                price: result.price, 
                time, 
                size: result.size, 
                id: oid, 
                direction: 'long'
            });
        }   
    }

    async onSellSignal({ price, size, time, position }) {   
        
        console.log(`SELL SELL SELL ${price}`);
        
        if (position && this.strategy.getPosition(position.id)) {

            // already in a long position (strategy.getPosition(id)), close the 
            // position with a 'SELL' transaction
            const result = await this.broker.sell({ size, price, oid: position.id, trade: 'close_long' });
            // console.log('result: ', result)
            if (!result) { return };
            
            this.strategy.positionClosed({
                price: result.price, 
                time, 
                size: result.size, 
                id: result.oid
            });
        }
        else {
            // not in a position, open a new SHORT position with a SELL transaction
            console.log('Not in any position, open a SHORT position with a SELL transaction')

            const exec_fund = this.short_funds * this.allocation;
            const result = await this.broker.sell({ funds: exec_fund, price, trade: 'open_short' });  
            // console.log('result: ', result)
            if (!result) { return };

            const oid = result.oid ? result.oid : randomstring.generate(20);

            console.log('Opening position with price: ', result.price, ', time: ',  time, ', size: ', result.size, ', oid: ', oid)

            this.strategy.positionOpened({
                price: result.price, 
                time, 
                size: result.size, 
                id: oid, 
                direction: 'short'
            });
        } 
    }

    async onTick(_tick) {
        const tick = JSON.parse(_tick);
        // console.log(tick);

        const parsed = Date.parse(tick.k.t);
        const time   = isNaN(parsed) ? new Date() : parsed;
        const open   = parseFloat(tick.k.o);
        const high   = parseFloat(tick.k.h);
        const low    = parseFloat(tick.k.l);
        const close  = parseFloat(tick.k.c);
        const closed = tick.k.x;
        const volume = parseFloat(tick.k.v);

        const price = close;

        console.log(`Time: ${moment(time).format('DD-MM-YYYY HH:mm:ss')} Price: ${price.toFixed(2)} Volume: ${volume} -- ${closed}`);

        try {
            if (this.currentCandle) {
                this.currentCandle.onPrice({ open, high, low, close, volume, time, closed });
            }
            else {
                this.currentCandle = new Candlestick({ 
                    open: open, 
                    high: high,
                    low: low,
                    close: close,
                    volume: volume, 
                    interval: intervalToSeconds(this.interval),
                    startTime: time,
                    closed: closed
                });
            }

            // console.log(`Current candle state: ${this.currentCandle.state}`)

            // Add the current candle to a copy of the history
            const sticks = this.history.slice();
            sticks.push(this.currentCandle);
    
            //////////////////////////////////////////////////////////////////////////
            // Run the Strategy
            await this.strategy.run({
                sticks: sticks,
                time: time
            });
            //////////////////////////////////////////////////////////////////////////
    
            // Add the current candle permanently to history if closed
            if (this.currentCandle.state == 'closed') {
                // console.log('A closed candle operation detected!');
                const candle = this.currentCandle;
                this.currentCandle = null;
                this.history.push(candle);

                this.printPositions();
                this.printProfit();
            }
        }
        catch(err) {
            console.log(err);
        }

    }

    onError() { }

}

module.exports = Trader;