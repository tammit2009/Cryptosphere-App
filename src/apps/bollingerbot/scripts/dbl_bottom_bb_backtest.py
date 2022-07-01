import pandas as pd

from classes.trading_env_dbl import TradingEnvDoubleBottom

# pd.set_option('display.max_rows', None) # list the complete not abbreviated dataframe

# Load data from csv file
df = pd.read_csv('../data/BTC_ETH_LTC_01Jan22_30Mar22_1h.csv')

def sma(data, window):
    return data.rolling(window = window).mean()

def bollinger_band(data, sma, window, nstd):
    std = data.rolling(window = window).std()
    upper_band = sma + std * nstd 
    lower_band = sma - std * nstd 
    return upper_band, lower_band

# print(list(sma(df['LTC-USD_Open'], 20)))

symbols = ['BTC', 'ETH', 'LTC']

nstd = 3  # standard deviations (default is 2)

for symbol in symbols:
    df[f'{symbol}_sma'] = sma(df[f'{symbol}-USD_Open'], 20)
    df[f'{symbol}_upper_band'], df[f'{symbol}_lower_band'] \
            = bollinger_band(df[f'{symbol}-USD_Open'], df[f'{symbol}_sma'], 20, nstd)

# drop the first 20 NaN frames
df.dropna(inplace=True)

# print(df)

############# Run the strategy ########################################################################

env = TradingEnvDoubleBottom( balance_amount=100, 
                              balance_unit='USDT', 
                              trading_fee_multiplier=0.99925, 
                              symbols=symbols)
print(env.bottoms)

'''
Bottoms & Tops:
Initially when price is within channel = 'none'
As soon as we cross first bottom = 'hit'
As soon as we cross above bottom = 'release'
'''

for i in range(len(df)):
    if env.balance_unit == 'USDT':
        for symbol in symbols:
            if env.bottoms[symbol] == 'hit' and df[f'{symbol}-USD_Low'].iloc[i] > df[f'{symbol}_lower_band'].iloc[i]:
                env.bottoms[symbol] = 'released'

            # check if low price crosses the lower band
            if df[f'{symbol}-USD_Low'].iloc[i] < df[f'{symbol}_lower_band'].iloc[i]: # buy signal
                if env.bottoms[symbol] == 'released':
                    env.buy(symbol, df[f'{symbol}_lower_band'].iloc[i], df['OpenTime'].iloc[i])
                    env.reset_bottoms()
                    break
                else:
                    env.bottoms[symbol] = 'hit';

    if env.balance_unit != 'USDT':
        if env.tops[env.balance_unit] == 'hit' and (df[f'{env.balance_unit}-USD_High'].iloc[i] < df[f'{env.balance_unit}_upper_band'].iloc[i]):
            env.tops[env.balance_unit] = 'released'

        if df[f'{env.balance_unit}-USD_High'].iloc[i] > df[f'{env.balance_unit}_upper_band'].iloc[i]: # sell signal
            if env.tops[env.balance_unit] == 'released':
                env.sell(df[f'{env.balance_unit}_upper_band'].iloc[i], df['OpenTime'].iloc[i])
                env.reset_tops()
            else:
                env.tops[env.balance_unit] == 'hit';

if env.balance_unit != 'USDT':
    # env.sell(df[f'{env.balance_unit}-USD_Close'].iloc[-1], df['OpenTime'].iloc[-1])
    env.sell(df[f'{env.balance_unit}_upper_band'].iloc[-1], df['OpenTime'].iloc[-1])

#########################################################################################################

print(f'num buys: {len(env.buys)}')
print(f'num sells: {len(env.sells)}')
print(f'ending balance: {env.balance_amount} {env.balance_unit}')