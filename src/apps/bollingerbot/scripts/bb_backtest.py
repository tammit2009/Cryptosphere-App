import pandas as pd

from classes.trading_env import TradingEnv

# pd.set_option('display.max_rows', None) # list the complete not abbreviated dataframe if required

# Load data from csv file
df = pd.read_csv('../data/BTC_ETH_LTC_01Jan22_14Jun22_1h.csv')
# df = pd.read_csv('../data/BTC_ETH_LTC_01Jan22_30Mar22_1h.csv')
# print( df.head(10) )
# print( list(df.head(10)) )   # list of all the data columns

def sma(dataframe, window):
    return dataframe.rolling(window = window).mean()

# print(list(sma(df['LTC-USD_Open'], 20)))

def bollinger_band(data, sma, window, nstd):
    std = data.rolling(window = window).std()
    upper_band = sma + std * nstd 
    lower_band = sma - std * nstd 
    return upper_band, lower_band


nstd = 3  # no. of standard deviations (default is 2)

symbols = ['BTC', 'ETH', 'LTC']

for symbol in symbols:
    df[f'{symbol}_sma'] = sma(df[f'{symbol}-USD_Open'], 10)
    df[f'{symbol}_upper_band'], df[f'{symbol}_lower_band'] \
            = bollinger_band(df[f'{symbol}-USD_Open'], df[f'{symbol}_sma'], 10, nstd)

# drop the first 20 NaN frames
df.dropna(inplace=True)
# print(df)

env = TradingEnv(balance_amount=100, balance_unit='USDT', trading_fee_multiplier=0.99925) # i.e. 0.075 trading fee

############# Run the strategy (Backtest) #########################################################

for i in range(len(df)):
    if env.balance_unit == 'USDT':
        for symbol in symbols:
            # check if low price crosses the lower band
            if df[f'{symbol}-USD_Low'].iloc[i] < df[f'{symbol}_lower_band'].iloc[i]: # buy signal
                env.buy(symbol, df[f'{symbol}_lower_band'].iloc[i], df['OpenTime'].iloc[i])
                break

    if env.balance_unit != 'USDT':
        if df[f'{env.balance_unit}-USD_High'].iloc[i] > df[f'{env.balance_unit}_upper_band'].iloc[i]: # sell signal
            env.sell( df[f'{env.balance_unit}_upper_band'].iloc[i], df['OpenTime'].iloc[i] )

if env.balance_amount != 'USDT':
    env.sell(df[f'{env.balance_unit}-USD_Close'].iloc[-1], df['OpenTime'].iloc[-1])

###################################################################################################

# Generate the report
print(f'num buys: {len(env.buys)}')
print(f'num sells: {len(env.sells)}')
print(f'ending balance: {env.balance_amount} {env.balance_unit}')

# print(list(zip(env.buys, env.sells)))

