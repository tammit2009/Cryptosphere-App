
class TradingEnvDoubleBottom:
    def __init__(self, balance_amount, balance_unit, trading_fee_multiplier, symbols):
        self.balance_amount = balance_amount
        self.balance_unit = balance_unit
        self.buys = []
        self.sells = []
        self.trading_fee_multiplier = trading_fee_multiplier # 0.99925  # VIP level 0, paying fees with BNB (0.075% trading fee)
        self.symbols = symbols

        self.bottoms = {}
        self.reset_bottoms()

        self.tops = {}
        self.reset_tops()

    def buy(self, symbol, buy_price, time):
        self.balance_amount = (self.balance_amount / buy_price) * self.trading_fee_multiplier
        self.balance_unit = symbol
        self.buys.append([symbol, time, buy_price])
        
    def sell(self, sell_price, time): 
        self.balance_amount = (self.balance_amount * sell_price) * self.trading_fee_multiplier
        self.sells.append([self.balance_unit, time, sell_price])
        self.balance_unit = 'USDT'

    def reset_bottoms(self):
        for symbol in self.symbols:
            self.bottoms[symbol] = 'none'

    def reset_tops(self):
        for symbol in self.symbols:
            self.tops[symbol] = 'none'