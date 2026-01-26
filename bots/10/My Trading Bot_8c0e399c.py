# Basic Trading Bot Template
# Implement your trading strategy here

class TradingBot:
    def __init__(self):
        self.position = 0
        self.cash = 10000
    
    def trade(self, state):
        """
        Called each tick with market state.
        Return your trading action.
        
        Args:
            state: dict with market data
                - price: current market price
                - history: list of past prices
                - tick: current time step
        
        Returns:
            action: 'BUY', 'SELL', or 'HOLD'
            amount: quantity to trade (optional)
        """
        # Example: Simple moving average strategy
        if len(state.get('history', [])) < 5:
            return 'HOLD', 0
        
        avg = sum(state['history'][-5:]) / 5
        current_price = state['price']
        
        if current_price < avg * 0.98:
            return 'BUY', 10
        elif current_price > avg * 1.02:
            return 'SELL', 10
        
        return 'HOLD', 0

# Required: Create bot instance
bot = TradingBot()
Lets go 

def trade(state):
    """Main entry point called by the engine."""
    return bot.trade(state)
