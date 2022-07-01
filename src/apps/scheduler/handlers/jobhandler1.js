const axios = require('axios');
const { logger } = require("../../libs/loggers");

const baseUrl = process.env.BASE_URL;

module.exports = async (data) => {
    try {
        const resp = await axios.get(`${baseUrl}/scheduler/state`);
        const { forkedState, uptimeTicks } = resp.data;
        logger.info(`['${data.jobLabel}'] scheduler state: ${forkedState} - uptimeTicks: ${uptimeTicks}.`);
    }
    catch(err) {
        if (err.code === 'ECONNREFUSED') {
            return logger.error(`Job Handler1 ('${data.jobLabel}'): Unable to connect to the service.`);
        }

        logger.error(err);
    };
}