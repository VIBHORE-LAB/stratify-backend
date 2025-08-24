#pragma once
#include "strategy.h"
#include "engine.h"
#include <deque>

using namespace std;

class MeanReversionStrategy : public Strategy{
private:
    Engine* engine;
    deque<double> window;
    int lookback;
    double kSigma;
    int size;

public:
    MeanReversionStrategy(Engine* eng, int look = 5, double k= 1.0, int sz = 10):
        engine(eng), lookback(look), kSigma(k), size(sz) {}
    void onTick(const Tick& tick) override;
};