const colors = require('colors/safe');
const { Factory } = require('../strategy');
const HistoricalService = require('../services/historical');

class Runner {

    constructor(data) {

        const { start, end, interval, asset, base, strategy, ticksrc } = data;

        this.startTime      = start;
        this.endTime        = end;
        this.interval       = interval;
        this.asset          = asset;
        this.base           = base;
        this.strategy       = strategy;
        this.ticksrc        = ticksrc;

        // factory args: ( type, data ) => the default type = 'simple' (yargs)
        this.strategy = Factory.create(this.strategy, { 
            onBuySignal: (x) => { this.onBuySignal(x) },
            onSellSignal: (x) => { this.onSellSignal(x) }
        });

        this.historical = new HistoricalService({
            start, end, interval, asset, base
        });

        console.log('Base Class "Runner" Constructed');
    }

    printPositions() {
        const positions = this.strategy.getPositions();
        positions.forEach((p) => {
            p.print();
        });
    }

    printProfit() {
        const positions = this.strategy.getPositions();

        const total = positions.reduce((r, p) => {  // r => accumulator
            return r + parseFloat(p.profit());
        }, 0);

        const prof = `${total}`;

        const colored = total > 0 ? colors.green(prof) : colors.red(prof);
        console.log(`Total: ${colored}`);
    }

    // override
    async start() { }

    // override
    async onBuySignal() {}

    // override
    async onSellSignal() {}
}

module.exports = Runner;