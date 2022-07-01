const Strategy = require('../strategy');

class SimpleStrategy extends Strategy {

    async run({ sticks, time }) {
        const len = sticks.length;
        if (len < 20) { return }

        // console.log('simple strategy')

        const penu = sticks[len-2].close;
        const last = sticks[len-1].close;
        const price = last;

        // console.log(sticks.length)
        // console.log(penu)
        // console.log(last)

        const open = this.getOpenPositions();

        if (open.length == 0) {   // limit to only 1 trade
            if (last < penu) {
                this.onBuySignal({ price, time });  
            }
        }
        else {
            if (last > penu) {
                open.forEach(p => {
                    // if (p.enter.price * 1.01 < price) {
                        this.onSellSignal({ price, size: p.enter.size, time, position: p }); 
                    // }
                });
            }
        }
    }
}

module.exports = SimpleStrategy;