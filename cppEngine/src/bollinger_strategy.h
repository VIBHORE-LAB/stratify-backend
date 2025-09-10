#pragma once
#include "strategy.h"
#include "engine.h"
#include <deque>

using namespace std;


class BollingerStrategy : public Strategy {
    private:
        Engine* engine;
        int lookback;
        double stdDevMult;
        int size;
        deque<double> prices;

        double mean();
        double stdev(double meanVal);

    public:
        BollingerStrategy(Engine* eng, int lb = 20, double sd = 2.0, int sz = 10) :
            engine(eng), lookback(lb), stdDevMult(sd), size(sz) {}

            void onTick(const Tick& tick) override;
        
};