#include "vwap_strategy.h"
using namespace std;

void VWAPStrategy::onTick(const Tick& tick) {
    cumPV += tick.price * tick.volume;
    cumVolume += tick.volume;

    if (cumVolume == 0) return;

    double vwap = cumPV / cumVolume;

    if (tick.price < vwap && engine->getPosition() <= 0) {
        engine->submitOrder("BUY", tick.price, size, tick.timestamp, true);
    } else if (tick.price > vwap && engine->getPosition() >= 0) {
        engine->submitOrder("SELL", tick.price, size, tick.timestamp, true);
    }
}
