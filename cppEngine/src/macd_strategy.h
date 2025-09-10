#pragma once
#include "strategy.h"
#include "engine.h"
#include <deque>
using namespace std;

class MACDStrategy : public Strategy {
    private:
        Engine* engine;
        int fastWindow;
        int slowWindow;
        int signalWindow;
        int size;
        deque<double>prices;
        double computeEMA(int window, double prevEMA, double price, double alpha);

    public:
    MACDStrategy(Engine* eng, int fast = 12, int slow = 20, int signal = 0, int sz = 10) : engine(eng), fastWindow(fast), slowWindow(slow), signalWindow(signal), size(sz) {}

    void onTick(const Tick&  tick) override;
};