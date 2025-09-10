#pragma once
#include "strategy.h"
#include "engine.h"
using namespace std;

class VWAPStrategy : public Strategy {
private:
    Engine* engine;
    int size;
    double cumPV = 0.0;
    double cumVolume = 0.0;

public:
    VWAPStrategy(Engine* eng, int sz = 10) : engine(eng), size(sz) {}
    void onTick(const Tick& tick) override;
};
