#pragma once
#include "strategy.h"
#include "engine.h"
#include <deque>


using namespace std;

class BreakoutStrategy : public Strategy {
    private:
    Engine* engine;
    int lookback;
    int size;
    deque<double> prices;

    public: 
        BreakoutStrategy(Engine* eng, int lb = 20, int sz = 10) : engine(eng), lookback(lb), size(sz) {}

        void onTick(const Tick&  tick) override;


};