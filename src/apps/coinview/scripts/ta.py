import numpy  as np
import talib 
from numpy import genfromtxt
import os
from pathlib import Path

# np.set_printoptions(suppress=True, formatter={'float_kind':'{:f}'.format})

close = np.random.random(100)
# print(close)

# moving_average = talib.SMA(close, timeperiod=10)
# print(moving_average)

# rsi = talib.RSI(close)
# print(rsi)

# Import data from file
# ---
# old method
# dirname = os.path.dirname(__file__)
# file_path = os.path.join(dirname, '../data/15minutes.csv')
# ---
# python 3.4+
base_path = Path(__file__).parent
file_path = (base_path / "../data/15minutes.csv").resolve()
my_data = genfromtxt(file_path, delimiter=',')
# print(my_data)

# get just the closing value
close = my_data[:, 4]
# print(close)

rsi = talib.RSI(close)
print(rsi)