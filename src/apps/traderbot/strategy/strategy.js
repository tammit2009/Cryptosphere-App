const Trade    = require('../models/trade');
const Position = require('../models/position');

const config = require('../config');

class Strategy {
    
    constructor({ onBuySignal, onSellSignal }) {
        this.onBuySignal = onBuySignal;
        this.onSellSignal = onSellSignal;
        this.positions = {};

        this.canBeBacktested = true;
        this.canBeLive = true;
        this.requireHistory = true;

        console.log('Run Strategy');
    }

    // override
    async run({ sticks, time }) { }

    getPosition(id) {
        return this.getPositions().find(p => p.id == id);
    }

    getPositions() {
        return Object.keys(this.positions).map((k) => this.positions[k]);
    }

    getOpenPositions() {
        return this.getPositions().filter(p => p.state == 'open');
    }

    async positionOpened({ price, time, size, id, direction }) {
        const trade = new Trade({ price, time, size });
        const fee = parseFloat(config.get('txn_fee')); // Fee extracted from trade config (same for trader / tester)
        
        // console.log('position opened; Fee: ' + fee + '; size: ' + size)

        const position = new Position({ trade, id, fee, direction });
        this.positions[id] = position;
    }

    async positionClosed({ price, time, size, id }) {
        const trade = new Trade({ price, time, size });
        const position = this.positions[id]

        if (position) {
            position.close({ trade });
        }
    }
}

module.exports = Strategy;