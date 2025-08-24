#include "momentum_strategy.h"
#include <iostream>
using namespace std;

void MomentumStrategy::onTick(const Tick& tick){
    if(lastPrice != 0.0){
        double change = (tick.price - lastPrice) / lastPrice;
        if(change > threshold){
            engine->submitOrder("SELL", tick.price, size, tick.timestamp, true);
        }
        else if (change < -threshold){
            engine->submitOrder("BUY", tick.price, size, tick.timestamp, true);
        }
    }
    lastPrice = tick.price;
}
