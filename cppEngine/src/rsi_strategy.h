#pragma once
#include "strategy.h"
#include "engine.h"
#include <deque>

using namespace std;

class RSIStrategy : public Strategy {
    private: 
    Engine* engine;
    int lookback;
    int size;
    double lowerBound;
    double upperBound;
    deque<double>gains;
    deque<double>losses;
    double lastPrice = 0.0;

    double computeRSI();

    public: 
    RSIStrategy(Engine* eng, int lb=14, double low = 30.0, double high = 70.0, int sz = 10) : engine(eng), lookback(lb), lowerBound(low), upperBound(high), size(sz){}
    void onTick(const Tick& tick) override;
};
