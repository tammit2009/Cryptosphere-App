const colors = require('colors/safe');
const moment = require('moment');

// Position will have a state, entry trade, exit trade and an ID

class Position {
    constructor({ trade, id, fee, direction }) {
        this.state = 'open';
        this.enter = trade;
        this.fee = fee;
        this.id = id;
        this.direction = direction  // long, short

        // console.log('position created with id: ', id);
    }

    close({ trade }) {
        this.state = 'closed';
        this.exit = trade;
    }

    print() {
        const enter = `Enter | ${this.enter.price} | ${moment(this.enter.time).format('DD-MM-YYYY HH:mm:ss')}`;
        const exit = this.exit ? `Exit: | ${this.exit.price} | ${moment(this.exit.time).format('DD-MM-YYYY HH:mm:ss')}` : '';

        var profit = '';
        if (this.state === 'closed') {
            const prof = `${this.profitString()}`;
            const colored = this.profit() > 0 ? colors.green(prof) : colors.red(prof);
            profit = `Profit: ${colored}`;
        }

        console.log(`${enter} - ${exit} - ${profit}`);
    }

    profit() {
        // const fee = 0.0025; - now set in 'config/trade.json'
        const entrance = (this.enter.price) * (this.enter.size) * (1 + this.fee);
        if (this.exit) {
            const exit = (this.exit.price) * (this.exit.size) * (1 - this.fee);
            return (exit - entrance);
        }
        else {
            return 0;
        }
    }

    profitString() {
        return this.profit().toFixed(2);
    }
}

module.exports = Position;