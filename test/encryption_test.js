// environment config
require('dotenv').config({ path: '../.env' }); 

var crypto = require('crypto');

const helpers = require('../src/utils/helpers');

const str = 'Les Miserables';

// Random 16 digit initialization vector
const iv = crypto.randomBytes(16);

const encrypted = helpers.encryptString({ data: str, iv });
console.log('encrypted-data:', encrypted);

const decrypted = helpers.decryptString(encrypted);
console.log('decrypted-string:', decrypted);