#include "engine.h"
#include "strategy.h"
#include <iostream>
#include <chrono>
#include <sstream>
#include <iomanip>

using namespace std;
using namespace std::chrono;

Engine::Engine()
    : strategyPtr(nullptr),
      tickIndex(0),
      running(false),
      ticksLoaded(false),
      position(0),
      cash(100000.0), 
      nav(100000.0),
      lastPriceSeen(0.0),
      executionLatencyMs(50), 
      feePerTrade(1.0) 
{}

Engine::~Engine() {
    stop();
}

string Engine::genOrderId() {
    static atomic<uint64_t> counter{0};
    uint64_t id = ++counter;
    stringstream ss;
    ss << "ORD" << id;
    return ss.str();
}

bool Engine::isRunning() {
    return running;
}

void Engine::start(Strategy* strategy, const vector<Tick>& inTicks) {
    if (running) return;
    strategyPtr = strategy;
    ticks = inTicks;
    tickIndex = 0;
    running = true;
    ticksLoaded = !ticks.empty();
    
    if (strategyPtr) strategyPtr->onStart();
    
    tickThread = thread(&Engine::tickWorker, this);
    execThread = thread(&Engine::executionWorker, this);
}

void Engine::stop() {
    if (!running) return;
    running = false;
    orderCv.notify_all();
    tickCv.notify_all();
    if (tickThread.joinable()) tickThread.join();
    if (execThread.joinable()) execThread.join();
    if (strategyPtr) strategyPtr->onStop();
}

void Engine::submitOrder(const string& side, double price, int qty, const string& timestamp, bool isMarket) {
    Order o;
    o.id = genOrderId();
    o.timestamp = timestamp;
    o.side = side;
    o.price = price;
    o.quantity = qty;
    o.isMarket = isMarket;

    {
        lock_guard<mutex> lk(orderMutex);
        orderQueue.push(o);
    }
    orderCv.notify_one();

    stringstream ss;
    ss << "{";
    ss << "\"event\":\"order_submitted\",";
    ss << "\"order_id\":\"" << o.id << "\",";
    ss << "\"side\":\"" << o.side << "\",";
    ss << "\"qty\":" << o.quantity << ",";
    ss << "\"price\":" << fixed << setprecision(4) << o.price << ",";
    ss << "\"timestamp\":\"" << o.timestamp << "\"";
    ss << "}\n";
    cout << ss.str() << flush;
}

void Engine::tickWorker() {
    while (running) {
        Tick t;
        {
            lock_guard<mutex> lk(tickMutex);
            if (tickIndex >= ticks.size()) {
                running = false;
                orderCv.notify_all();
                break;
            }
            t = ticks[tickIndex++];
        }

        lastPriceSeen = t.price;
        nav = cash + position * lastPriceSeen;
        recorder.recordNav(t.timestamp, nav);

        if (strategyPtr) {
            strategyPtr->onTick(t);
        }

    }
}

void Engine::executionWorker() {
    while (running || !orderQueue.empty()) {
        Order o;
        {
            unique_lock<mutex> lk(orderMutex);
            orderCv.wait(lk, [this](){ return !running || !orderQueue.empty(); });
            if (orderQueue.empty()) {
                if (!running) break;
                else continue;
            }
            o = orderQueue.front();
            orderQueue.pop();
        }

        this_thread::sleep_for(milliseconds(executionLatencyMs));

        double fillPrice = lastPriceSeen;
        int filled = o.quantity;

        double nominalLiquidity = 500.0; 
        double sizeImpact = double(o.quantity) / nominalLiquidity;
        double slippagePct = 0.0;
        if (o.isMarket) {
            slippagePct = 0.001 * sizeImpact * 100.0; 
            if (o.side == "BUY") fillPrice = fillPrice * (1.0 + slippagePct);
            else fillPrice = fillPrice * (1.0 - slippagePct);
        } else {
            if ((o.side == "BUY" && o.price >= lastPriceSeen) || (o.side == "SELL" && o.price <= lastPriceSeen)) {
                fillPrice = o.price;
            } else {
                stringstream ss;
                ss << "{";
                ss << "\"event\":\"order_not_filled\",";
                ss << "\"order_id\":\"" << o.id << "\",";
                ss << "\"side\":\"" << o.side << "\",";
                ss << "\"qty\":" << o.quantity << ",";
                ss << "\"timestamp\":\"" << o.timestamp << "\"";
                ss << "}\n";
                cout << ss.str() << flush;
                continue;
            }
        }

        double totalFee = feePerTrade;

        if (o.side == "BUY") {
            position += filled;
            cash -= (fillPrice * filled) + totalFee;
        } else {
            position -= filled;
            cash += (fillPrice * filled) - totalFee;
        }

        Trade tr{ o.timestamp, o.id, o.side, fillPrice, filled };
        recorder.recordTrade(tr);

        stringstream ss;
        ss << "{";
        ss << "\"event\":\"trade_executed\",";
        ss << "\"order_id\":\"" << tr.order_id << "\",";
        ss << "\"side\":\"" << tr.side << "\",";
        ss << "\"price\":" << fixed << setprecision(4) << tr.price << ",";
        ss << "\"qty\":" << tr.quantity << ",";
        ss << "\"timestamp\":\"" << tr.timestamp << "\"";
        ss << "}\n";
        cout << ss.str() << flush;

        nav = cash + position * lastPriceSeen;
        recorder.recordNav(o.timestamp, nav);
    }
}

void Engine::saveResults(const string& tradesFile, const string& navFile) {
    recorder.saveTrades(tradesFile);
    recorder.saveNav(navFile);
    stringstream ss;
    ss << "{";
    ss << "\"event\":\"run_complete\",";
    ss << "\"final_nav\":" << fixed << setprecision(4) << nav << ",";
    ss << "\"cash\":" << cash << ",";
    ss << "\"position\":" << position;
    ss << "}\n";
    cout << ss.str() << flush;
}
