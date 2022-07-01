
const COUNT_ABBRS = [ '', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y' ];

function formatCount(count, withAbbr = false, decimals = 2) {
    const i     = 0 === count ? count : Math.floor(Math.log(count) / Math.log(1000));
    let result  = parseFloat((count / Math.pow(1000, i)).toFixed(decimals));
    if(withAbbr) {
        result += `${COUNT_ABBRS[i]}`; 
    }
    return result;
}

// Examples:
// formatCount(1000, true);        // => '1k'
// formatCount(100, true);         // => '100'
// formatCount(10000, true);       // => '10k'
// formatCount(10241, true);       // => '10.24k'
// formatCount(10241, true, 0);    // => '10k'
// formatCount(10241, true, 1);    // => '10.2k'
// formatCount(1024111, true, 1);  // => '1M'
// formatCount(1024111, true, 2);  // => '1.02M'