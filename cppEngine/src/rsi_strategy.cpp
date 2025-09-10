#include "rsi_strategy.h"
using namespace std;

double RSIStrategy::computeRSI(){
    if((int)gains.size()<lookback) return 50.0;


    double avgGain = 0.0, avgLoss = 0.0;

    for (double g : gains) avgGain += g;
    for (double l : losses) avgGain += l;
    avgGain /= lookback;
    avgLoss /= lookback;


    if(avgLoss == 0) return 100.0;
    double rs = avgGain/avgLoss;
    return 100.0 - (100.0 / (1.0 + rs));

}



void RSIStrategy::onTick(const Tick& tick){
    if(lastPrice != 0.0){
        double change = tick.price - lastPrice;
        gains.push_back(change > 0 ? change : 0);
        losses.push_back(change < 0 ? -change : 0);

        if((int)gains.size() > lookback) gains.pop_front();
        if((int)losses.size() > lookback) gains.pop_front();

        double rsi = computeRSI();
        if(rsi<lowerBound && engine->getPosition() <= 0){
            engine->submitOrder("BUY", tick.price, size, tick.timestamp, true);
        }

        else if(rsi > upperBound && engine->getPosition() >= 0){
            engine->submitOrder("SELL", tick.price, size, tick.timestamp, true);
        }
    }

    lastPrice = tick.price;
}