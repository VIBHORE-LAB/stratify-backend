#include "macd_strategy.h"
using namespace std;

static double prevFastEMA = 0.0, prevSlowEMA = 0.0, prevSignal = 0.0;
static bool first = true;

double MACDStrategy::computeEMA(int window, double prevEMA, double price, double alpha){
return alpha * price + (1-alpha) * prevEMA;
}


void MACDStrategy::onTick(const Tick& tick){
    prices.push_back(tick.price);

    if((int)prices.size()<slowWindow) return;
    double alphaFast = 2.0 / (fastWindow + 1);
    double alphaSlow = 2.0/ (slowWindow + 1);
    double alphaSignal = 2.0 / (signalWindow +1);


    if(first){
        prevFastEMA = tick.price;
        prevSlowEMA = tick.price;
        prevSignal = 0.0;
        first = false;
    }


    prevFastEMA = computeEMA(fastWindow, prevFastEMA, tick.price, alphaFast);
    prevSlowEMA = computeEMA(slowWindow, prevSlowEMA, tick.price, alphaSlow);

    double macd = prevFastEMA - prevSlowEMA;
    
    prevSignal = computeEMA(signalWindow, prevSignal, macd, alphaSignal);

    if(macd > prevSignal && engine->getPosition() <= 0){
        engine->submitOrder("BUY", tick.price, size, tick.timestamp, true);
    }
    else if(macd < prevSignal && engine->getPosition() >= 0){
        engine->submitOrder("SELL", tick.price, size, tick.timestamp, true);
    }

};
     
