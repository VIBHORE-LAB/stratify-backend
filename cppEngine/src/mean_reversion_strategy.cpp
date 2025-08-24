#include "mean_reversion_strategy.h"
#include <numeric>
#include <cmath>

using namespace std;

static double mean(const deque<double>& d) {
    if (d.empty()) return 0.0;
    double s = 0.0;
    for (double v : d) s += v;
    return s / d.size();
}
static double stddev(const deque<double>& d, double mu) {
    if (d.size() < 2) return 0.0;
    double s = 0.0;
    for (double v : d) s += (v - mu) * (v - mu);
    return sqrt(s / (d.size() - 1));
}

void MeanReversionStrategy::onTick(const Tick& tick) {
    window.push_back(tick.price);
    if ((int)window.size() > lookback) window.pop_front();
    if ((int)window.size() < lookback) return;

    double mu = mean(window);
    double sd = stddev(window, mu);
    if (sd == 0.0) return;
    double z = (tick.price - mu) / sd;
    // if price is high relative to mean -> short; if low -> long
    if (z > kSigma) {
        engine->submitOrder("SELL", tick.price, size, tick.timestamp, true);
    } else if (z < -kSigma) {
        engine->submitOrder("BUY", tick.price, size, tick.timestamp, true);
    }
}
