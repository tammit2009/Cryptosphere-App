const { PythonShell } = require('python-shell');
let options = {
    scriptPath: "./src/apps/coinview/scripts",
};

const getAccountInfo = () => {

    options.args = ["accountInfo"];

    return new Promise((resolve, reject) => {
        PythonShell.run('funcs.py', options, (err, res) => {
            if (err) reject(err);
            if (res) {
                // console.log(res);
                resolve(res)
            };        
        });
    }); 
};

const buyCrypto = (symbol, quantity) => {

    options.args = ["buy", symbol, quantity];

    return new Promise((resolve, reject) => {
        PythonShell.run('funcs.py', options, (err, res) => {
            if (err) reject(err);
            if (res) {
                // console.log(res);
                resolve(res)
            };        
        });
    }); 
};

const sellCrypto = (symbol, quantity) => {

    options.args = ["sell", symbol, quantity];

    return new Promise((resolve, reject) => {
        PythonShell.run('funcs.py', options, (err, res) => {
            if (err) reject(err);
            if (res) {
                // console.log(res);
                resolve(res)
            };        
        });
    }); 
};

const getCryptoHistory = () => {

    options.args = ["history"];

    return new Promise((resolve, reject) => {
        PythonShell.run('funcs.py', options, (err, res) => {
            if (err) reject(err);
            if (res) {
                // console.log(res);
                resolve(res)
            };        
        });
    }); 
};


module.exports = {
    getAccountInfo, 
    buyCrypto,
    sellCrypto,
    getCryptoHistory
}