#include "bollinger_strategy.h"
#include <cmath>
using namespace  std;


double BollingerStrategy::mean(){
    double sum = 0.0;
    for(double p : prices) sum += p;
    return sum / prices.size();

}


double BollingerStrategy::stdev(double meanVal){
    double sum = 0.0;
    for(double p: prices) sum += (p-meanVal) * (p-meanVal);
    return sqrt(sum/prices.size());
}



void BollingerStrategy::onTick(const Tick& tick){
    prices.push_back(tick.price);
    if((int)prices.size() > lookback) prices.pop_front();
    if((int)prices.size() < lookback) return;

    double m = mean();
    double sd = stdev(m);
    double upper = m + stdDevMult * sd;
    double lower = m - stdDevMult * sd;

    if(tick.price <= lower && engine->getPosition()<=0){
        engine->submitOrder("BUY", tick.price, size, tick.timestamp, true);
    }
    else if(tick.price >= upper && engine->getPosition() >= 0){
        engine->submitOrder("SELL", tick.price, size, tick.timestamp, true);
    }

}