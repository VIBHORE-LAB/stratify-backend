#pragma once
#include "strategy.h"
#include "engine.h"

using namespace std;

class MomentumStrategy : public Strategy {
private:
    Engine* engine;
    double lastPrice = 0.0;
    double threshold; // fraction, e.g., 0.01 = 1%
    int size;
public:
    MomentumStrategy(Engine* eng, double th = 0.01, int sz = 10) : engine(eng), threshold(th), size(sz) {}
    void onTick(const Tick& tick) override;
};
