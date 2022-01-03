// Stock market bot for bitburner
// buys and sells stock, hopefully for a profit...

export async function main(ns) {
    ns.print("Starting script here");

    ns.disableLog('sleep');
    ns.disableLog('getServerMoneyAvailable');

    let stockSymbols = ns.stock.getSymbols(); // all symbols
    let portfolio = []; // init portfolio
    const forecastThresh = 0.65; // Buy above this 
    const minimumCash = 10000000; // Minimum cash in the bank
    let cycle = 0;

    ns.print("Starting run - Do we own any stocks?"); //Finds and adds any stocks we already own
    for(const stock of stockSymbols){
        let pos = ns.stock.getPosition(stock);

        if(pos[0] > 0){
            portfolio.push({sym: stock, value: pos[1], shares: pos[0]})
            ns.print('Detected: '+ stock + ' quant: '+ pos[0] +' @ '+ pos[1]);
        };
    };

    while(true){
        for(const stock of stockSymbols){ // for each stock symbol
            if (portfolio.findIndex(obj => obj.sym === stock) !== -1){ //if we already have this stock
                let i = portfolio.findIndex(obj => obj.sym === stock); // log index of symbol as i
                if(ns.stock.getAskPrice(stock) >= portfolio[i].value*1.1){ // if the price is higher than what we bought it at +10% then we SELL
                    sellStock(stock);
                }
                else if(ns.stock.getForecast(stock) < 0.4){
                    sellStock(stock);
                }
            }

            else if (ns.stock.getForecast(stock) >= forecastThresh){ // if the forecast is better than threshold and we don't own then BUY
                buyStock(stock);
            }
        } // end of for loop (iterating stockSymbols)
        cycle++;
        ns.print('Cycle '+ cycle + ' Complete');
        await ns.sleep(6000);
    } // end of while true loop

    function buyStock(stock) {
        let stockPrice = ns.stock.getAskPrice(stock); // Get the stockprice
        let shares = stockBuyQuantCalc(stockPrice); // calculate the shares using StockBuyQuantCalc
        if (ns.stock.getVolatility(stock) <= 0.05){ // if volatility is < 5%, buy the stock
            ns.stock.buy(stock, shares);
            ns.print('Bought: '+ stock + ' quant: '+ Math.round(shares) +' @ '+ Math.round(stockPrice));

            portfolio.push({sym: stock, value: stockPrice, shares: shares}); //store the purchase info in portfolio
        }
    }

    function sellStock(stock) {
        let position = ns.stock.getPosition(stock);
        var forecast = ns.stock.getForecast(stock);
        if (forecast < 0.55) {
            let i = portfolio.findIndex(obj => obj.sym === stock);
            ns.print('SOLD: '+ stock + 'quant: '+ portfolio[i].shares +'@ '+ portfolio[i].value);
            portfolio.splice(i, 1);
            ns.stock.sell(stock, position[0]);
            
        }
    };

    function stockBuyQuantCalc(stockPrice){ // Calculates how many shares to buy
        let playerMoney = ns.getServerMoneyAvailable('home') - minimumCash;
        let maxSpend = playerMoney * 0.1;
        return maxSpend/stockPrice
    }
}