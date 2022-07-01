const { resolve } = require('path');
const Cron0Service = require(resolve('src/scheduler/services/cron0_service'));

module.exports = () => {

    Cron0Service.process((err, result) => {  // cb implemented as (err, result)
        // error handling
        if (err) {
            if (process.env.NODE_ENV === 'production') {
                // RequestService.sendToSlack({
                //     // Fancy slack message formatting
                // });
                console.error('Error:', err);
            }
        }
        else {
            // LogService.logError(err);
            // console.log('result:', result);
            // console.log('cron0 jobs processed.')
        }
    });
}


