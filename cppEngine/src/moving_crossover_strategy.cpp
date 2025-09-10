#include "moving_crossover_strategy.h"
#include <numeric>
using namespace std;


double MovingAverageCrossoverStrategy::computeMA(int window){
    if(prices.size()<window) return 0.0;

    double sum = 0.0;
    for(int i=prices.size() - window; i< (int)prices.size(); i++){
        sum += prices[i];
    }

    return sum/window;
}


void MovingAverageCrossoverStrategy::onTick(const Tick& tick){
    prices.push_back(tick.price);
    if((int)prices.size()>longWindow){
        prices.pop_front();
    }

    if((int)prices.size()<longWindow){
        return;
    }

    double shortMA = computeMA(shortWindow);
    double longMA = computeMA(longWindow);

    if(shortMA > longMA && engine->getPosition()<=0){
        engine->submitOrder("BUY", tick.price, size, tick.timestamp, true);
    }

    else if(shortMA < longMA && engine->getPosition()>=0){
        engine->submitOrder("SELL", tick.price, size, tick.timestamp, true);
    }
}