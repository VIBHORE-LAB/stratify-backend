#pragma once
#include "types.h"
#include "recorder.h"
#include <queue>
#include <mutex>
#include <condition_variable>
#include <thread>
#include <atomic>
#include <functional>

using namespace std;

class Strategy;
class Engine {
    public:
    Engine();
    ~Engine();

    void start(Strategy* strategy, const vector<Tick>& ticks);
    void stop();
    bool isRunning(); // Added this missing method

    void submitOrder(const string& side, double price, int quantity, const string& timestamp, bool isMarket);
    void saveResults(const string& tradesFile = "out_trades.csv", const string& navFile = "out_nav.csv");

    private:
    void tickWorker();
    void executionWorker();

    string genOrderId();

    Strategy* strategyPtr;
    vector<Tick> ticks;
    size_t tickIndex;

    queue<Order> orderQueue;
    mutex orderMutex;
    condition_variable orderCv;

    mutex tickMutex;
    condition_variable tickCv;
    atomic<bool> running;
    atomic<bool> ticksLoaded;

    thread tickThread;
    thread execThread;

    Recorder recorder;

    int position;
    double cash;
    double nav;
    double lastPriceSeen;

    int executionLatencyMs;
    double feePerTrade;
};