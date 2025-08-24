#pragma once
#include "types.h"
#include <memory>

using namespace std;
class Engine;
class Strategy{
    public:
    virtual void onTick(const Tick& tick) = 0;
    virtual void onStart(){};
    virtual void onStop() {};
    virtual ~Strategy() =default;

};