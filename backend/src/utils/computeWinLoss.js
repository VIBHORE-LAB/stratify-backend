export function computeWinLoss(trades){
    let position = 0;
    let avgPrice = 0;
    let wins = 0;
    let losses = 0;

    for (const trade of trades){
        if(trade.side === "BUY"){
            avgPrice = (avgPrice * position + trade.price * trade.qty) / (position + trade.qty);
            position += trade.qty;
        }

        else if(trade.side === "SELL"){
            const pnl = (trade.price - avgPrice) * trade.qty;
            if(pnl > 0) wins +=1;
            else losses +=1;
            position -= trade.qty;
    }
}

const totalTrades = wins + losses;
const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

return { wins, losses, winRate };
}


