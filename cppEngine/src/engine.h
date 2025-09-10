#pragma once
#include <vector>
#include <string>
#include <queue>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <atomic>
#include <memory>
#include "recorder.h"
#include "types.h"  

class Strategy;

class Engine {
private:
    std::unique_ptr<Strategy> strategyPtr;
    std::vector<Tick> ticks;
    size_t tickIndex;
    std::atomic<bool> running;

    int position;
    double cash;
    double nav;
    double lastPriceSeen;
    double executionLatencyMs;
    double feePerTrade;

    std::thread tickThread;
    std::thread execThread;
    std::mutex tickMutex;
    std::mutex orderMutex;
    std::condition_variable orderCv;
    std::queue<Order> orderQueue;

    Recorder recorder;

    void tickWorker();
    void executionWorker();
    std::string genOrderId();

public:
    Engine();
    ~Engine();
    void start(std::unique_ptr<Strategy> strat, const std::vector<Tick>& inTicks);
    void stop();
    bool isRunning() const;
    void submitOrder(const std::string& side, double price, int qty,
                     const std::string& timestamp, bool isMarket = true);
    void saveResults(const std::string& tradesFile, const std::string& navFile);




    int getPosition() const {return position;}
    double getCash() const {return cash;}
    double getNav() const {return nav;}
    double getLastPrice() const {return lastPriceSeen;}
};
