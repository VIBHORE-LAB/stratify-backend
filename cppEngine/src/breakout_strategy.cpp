#include "breakout_strategy.h"
#include <algorithm>
using namespace std;

void BreakoutStrategy::onTick(const Tick& tick){
    prices.push_back(tick.price);
    if((int)prices.size() > lookback) prices.pop_front();
    if((int)prices.size()<lookback) return;

    double highest = *max_element(prices.begin(), prices.end());
    double lowest = *min_element(prices.begin(), prices.end());

    if(tick.price >= highest && engine->getPosition() <=0){
        engine->submitOrder("BUY", tick.price, size, tick.timestamp, true);
    }

    else if(tick.price <= lowest && engine->getPosition() >= 0){
        engine->submitOrder("SELL", tick.price, size, tick.timestamp, true);
    }
}