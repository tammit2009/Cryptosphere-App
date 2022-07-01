
/************************/
/*** Traderbot Routes ***/
/************************/

// Dependencies
const express = require('express');
const router = express.Router();

const { runTrader, runBacktester, checkTraderbotState } = require('../controllers/traderbotApiController');

router.route('/trader/:exestate').post(runTrader);
router.route('/backtester/:exestate').post(runBacktester);
router.route('/state').get(checkTraderbotState);

// router.route('/start').get(startScheduler);
// router.route('/activate').get(activateScheduler);
// router.route('/passivate').get(passivateScheduler);
// router.route('/stop').get(stopScheduler);
// router.route('/state').get(getSchedulerState);


// Exports
module.exports = router;