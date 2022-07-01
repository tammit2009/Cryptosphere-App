/*
 * Helpers for various tasks
 *
 */

// Dependencies
var crypto = require('crypto');
var https = require('https');
var querystring = require('querystring');
var path = require('path');
var fs = require('fs');
// var config = require('./config');

// Container for all the helpers
var helpers = {};

// Sample for testing that simply returns a number
helpers.getANumber = function() {
    return 1;
};

// Create a SHA256 hash
helpers.hash = function(str) {
    if (typeof(str) == 'string' && str.length > 0) {
        var hash = crypto.createHmac('sha256', process.env.HASHING_SECRET).update(str).digest('hex');
        return hash;
    }
    else {
        return false;
    }
};

// Encrypt a string (generate a 16 digit initialization vector with crypto: 'crypto.randomBytes(16);')
helpers.encryptString = function({ data, iv }) {

    // Private Key
    const key = crypto.createHash('sha256')
                    .update(String(process.env.ENCRYPT_SECRET))
                    .digest('base64');

    // Encrypt the string using encryption algorithm, private key and initialization vector
    const cipher = crypto.createCipheriv( String(process.env.ENCRYPT_ALG), Buffer.from(key, 'base64'), iv);

    let encryptedData = cipher.update(data, "utf-8", "hex");
    encryptedData += cipher.final("hex");

    // Convert the initialization vector to base64 string
    const base64data = Buffer.from(iv, 'binary').toString('base64');

    const dataSet = {
        iv: base64data,
        encryptedData
    }

    return dataSet;
};

// Decrypt a string (supply the original iv)
helpers.decryptString = function({encryptedData, iv}) {

    // Convert initialize vector from base64 to buffer
    const org_iv = Buffer.from(iv, 'base64');

    // Private Key
    const key = crypto.createHash('sha256')
                    .update(String(process.env.ENCRYPT_SECRET))
                    .digest('base64');

    // Decrypt the string using encryption algorithm and private key
    const decipher =crypto.createDecipheriv(String(process.env.ENCRYPT_ALG), Buffer.from(key, 'base64'), org_iv);

    let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
    decryptedData += decipher.final("utf-8");

    return decryptedData;
};

// Generate API Key
helpers.generateApiKey = function() {
    //create a base-36 string that is always 30 chars long a-z0-9
    // 'an0qrr5i9u0q4km27hv2hue3ywx3uu'
    return [...Array(30)]
        .map((e) => ((Math.random() * 36) | 0).toString(36))
        .join('');
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str) {
    try {
        var obj = JSON.parse(str);
        return obj;
    }
    catch (e) {
        return {};
    }
};

// Create a string of random alphanumeric characters of a given length
helpers.createRandomString = function(strLength) {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;

    if (strLength) {
        // Define all the possible characters that could go into a string
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // Start the final string
        var str = '';
        for (i=0; i < strLength; i++) {
            // Get a random character from the possible character string
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            // Append this character to the final string
            str += randomCharacter;
        }

        // Return the final string
        return str;
    }
}

// Get the string contents of a template
helpers.getTemplate = function(templateName, data, callback) {
    templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
    data = typeof(data) == 'object' && data !== null ? data : {};
    if (templateName) {
        var templatesDir = path.join(__dirname, '../templates/');
        fs.readFile(templatesDir + templateName + '.html', 'utf-8', function(err, str) {
            if (!err && str && str.length > 0) {
                // Do interpolation on the string before return
                var finalString = helpers.interpolate(str, data);
                callback(false, finalString);
            }
            else {
                callback('No template could be found');
            }
        });
    }
    else {
        callback('A valid template name was not specified');
    }
};

// Add the universal header and footer to a string, and pass provided data object to interpolation
helpers.addUniversalTemplates = function(str, data, callback) {
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data !== null ? data : {};

    // Get the header
    helpers.getTemplate('_header', data, function(err, headerString) {
        if (!err && headerString) {
            // Get the footer
            helpers.getTemplate('_footer', data, function(err, footerString) {
                if (!err && footerString) {
                    // Add them all together
                    var fullString = headerString + str + footerString;
                    callback(false, fullString);
                }
                else {
                    callback('Could not find the footer template');
                }
            });
        }
        else {
            callback('Could not find the header template');
        }
    });
};

// Take a given string and a data object and find/replace all the keys within it
helpers.interpolate = function(str, data) {
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data !== null ? data : {};

    // Add the templateGlobals to the data objects, prepending their key name with global
    for (var keyName in config.templateGlobals) {
        if (config.templateGlobals.hasOwnProperty(keyName)) {
            data['global.' + keyName] = config.templateGlobals[keyName];
        }
    }

    // For each key in the data object, insert its value into the string at the corresponding placeholder
    for (var key in data) {
        if (data.hasOwnProperty(key) && typeof(data[key]) == 'string') {
            var replace = data[key];
            var find = '{' + key + '}';
            str = str.replace(find, replace);
        }
    }

    return str;
};


// Get the contents of a static (public) asset
helpers.getStaticAsset = function(fileName, callback) {
    fileName = typeof(fileName) == 'string' && fileName.length > 0 ? fileName : false;
    if (fileName) {
        var publicDir = path.join(__dirname, '../public/');
        fs.readFile(publicDir + fileName, function(err, data) {
            if (!err && data) {
                callback(false, data);
            }
            else {
                callback('No file could be found');
            }
        });
    }
    else {
        callback('A valid filename was not specified');
    }
};

const COUNT_ABBRS = [ '', 'K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y' ];

helpers.formatCount = function(count, withAbbr = false, decimals = 2) {
    const i     = 0 === count ? count : Math.floor(Math.log(count) / Math.log(1000));
    let result  = parseFloat((count / Math.pow(1000, i)).toFixed(decimals));
    if(withAbbr) {
        result += `${COUNT_ABBRS[i]}`; 
    }
    return result;
}

helpers.numberWithCommas = function(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


// Export the module
module.exports = helpers;