
const Keystore = require('../models/keystore');
const helpers  = require('../utils/helpers');

async function getKeystoreEntries(userId) {
    // Extract keys from db
    const keystore = await Keystore.findOne({ owner: userId });
    if (!keystore) return false;

    const initv = Buffer.from(keystore.initVector, 'hex');
    const keystoreEntries = keystore.data.map((entry) => {
        return {
            key: helpers.decryptString({ encryptedData: entry.key, iv: initv }),
            val: helpers.decryptString({ encryptedData: entry.val, iv: initv }),
            description: helpers.decryptString({ encryptedData: entry.description, iv: initv }),
            addInfo: helpers.decryptString({ encryptedData: entry.addInfo, iv: initv }),
        };
    });

    return keystoreEntries;
}

function getKeyFromKeystore(keystoreEntry, key) {
    const keyEntry = keystoreEntry.find((entry) => entry.key === key);
    if (!keyEntry) return false;

    return keyEntry.val;
}

module.exports = { getKeystoreEntries, getKeyFromKeystore };
