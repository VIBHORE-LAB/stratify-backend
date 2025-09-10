#pragma once
#include "strategy.h"
#include "engine.h"
#include <deque>
using namespace std;

class MovingAverageCrossoverStrategy : public Strategy {
private:
    Engine* engine;
    int shortWindow;
    int longWindow;
    int size;
    deque<double> prices;

    double computeMA(int window);

public:
    MovingAverageCrossoverStrategy(Engine* eng, int shortW = 10, int longW = 50, int sz = 10)
        : engine(eng), shortWindow(shortW), longWindow(longW), size(sz) {}
    void onTick(const Tick& tick) override;
};
