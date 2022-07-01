
// exports.getMarketPriceCoinGecko = async (asset, base, fiat) => {

//     const results = await Promise.all([
//         axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${fiat}`),
//         axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=${fiat}`)
//     ]);

//     const marketPrice = results[0].data[asset][fiat] / results[1].data[base][fiat]
//     console.log(marketPrice);

//     return marketPrice;
// }