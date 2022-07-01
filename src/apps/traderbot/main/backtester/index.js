const randomstring = require('randomstring');
const colors = require('colors/safe');
const Runner = require('../runner');
const config = require('../../config');

class Backtester extends Runner {

    constructor(data) {
        super(data);

        this.long_funds   = parseFloat(config.get('T_long_fund')); // data.funds;
        this.short_funds  = parseFloat(config.get('T_short_fund'));
        this.allocation   = parseFloat(config.get('T_allocation'));
    }

    async start() {

        console.log('Starting Backtester');

        if (!this.strategy.canBeBacktested || !this.strategy.requireHistory) {
            console.log('Backtesting not applicable for this strategy');
            return;
        }

        try {
            const history = await this.historical.getData();

            // run logic on all the candlesticks sequentially after 
            // setting strategytype in 'runner.js'
            await Promise.all(history.map((stick, index) => {
                const sticks = history.slice(0, index+1);
                return this.strategy.run({
                    sticks, time: stick.startTime
                });
            }));

            this.printPositions();
            this.printProfit();
        }
        catch (error) {
            console.log(error);
        }
    }

    async onBuySignal({ price, time, position }) {          
        
        console.log('BUY SIGNAL');

        if (position && this.strategy.getPosition(position.id)) {
            // already in a short position (strategy.getPosition(id)), close the 
            // position with a 'BUY' transaction
            console.log('Already in a SHORT position, close the position')
            // this.strategy.positionClosed({
            //     price, time, size, id: position.id
            // });
        }
        else {
            // not in a position, open a new LONG position with a BUY transaction
            const id = randomstring.generate(20);
            const exec_fund = this.long_funds * this.allocation;
            const exec_size = exec_fund / price;
            this.strategy.positionOpened({
                price, time, size: exec_size, id
            });
        } 
    }

    async onSellSignal({ price, size, time, position }) {   
        
        console.log('SELL SIGNAL');

        if (position && this.strategy.getPosition(position.id)) {
            // already in a long position (strategy.getPosition(id)), close the  
            // position with a 'SELL' transaction
            this.strategy.positionClosed({
                price, time, size, id: position.id
            });
        }
        else {
            // not in a position, open a new SHORT position with a SELL transaction
            console.log('Not in any position, open a SHORT position with a SELL transaction')

            // const id = randomstring.generate(20);
            // this.strategy.positionOpened({
            //     price, time, size: parseFloat(config.get('test_size')), id
            // });
        } 

        
        
    }
}

module.exports = Backtester;