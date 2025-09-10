#include "engine.h"
#include "strategy.h"
#include <iostream>
#include <iomanip>
#include <chrono>

using namespace std;
using namespace std::chrono;

Engine::Engine()
    : tickIndex(0), running(false), position(0),
      cash(100000.0), nav(100000.0), lastPriceSeen(0.0),
      executionLatencyMs(50), feePerTrade(1.0) {}

Engine::~Engine() {
    stop();
}

string Engine::genOrderId() {
    static atomic<uint64_t> counter{0};
    return "ORD" + to_string(++counter);
}

bool Engine::isRunning() const { return running; }

void Engine::start(unique_ptr<Strategy> strat, const vector<Tick>& inTicks) {
    if (running) return;
    strategyPtr = move(strat);
    ticks = inTicks;
    tickIndex = 0;
    running = true;

    if (strategyPtr) strategyPtr->onStart();

    tickThread = thread([this](){ tickWorker(); });
    execThread = thread([this](){ executionWorker(); });
}

void Engine::stop() {
    running = false;
    orderCv.notify_all();

    if (tickThread.joinable()) tickThread.join();
    if (execThread.joinable()) execThread.join();

    if (strategyPtr) strategyPtr->onStop();
}

void Engine::submitOrder(const string& side, double price, int qty,
                         const string& timestamp, bool isMarket) {
    Order o{genOrderId(), timestamp, side, price, qty, isMarket};
    {
        lock_guard<mutex> lk(orderMutex);
        orderQueue.push(o);
    }
    orderCv.notify_one();

    cout << "{\"event\":\"order_submitted\",\"order_id\":\"" << o.id
         << "\",\"side\":\"" << o.side
         << "\",\"qty\":" << o.quantity
         << ",\"price\":" << fixed << setprecision(4) << o.price
         << ",\"timestamp\":\"" << o.timestamp << "\"}" << endl;
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

        if (strategyPtr) strategyPtr->onTick(t);

        this_thread::sleep_for(milliseconds(1));
    }
}

void Engine::executionWorker() {
    while (running || !orderQueue.empty()) {
        Order o;
        {
            unique_lock<mutex> lk(orderMutex);
            orderCv.wait(lk, [this](){ return !running || !orderQueue.empty(); });
            if (orderQueue.empty()) continue;
            o = orderQueue.front(); orderQueue.pop();
        }

        this_thread::sleep_for(milliseconds((int)executionLatencyMs));

        double fillPrice = lastPriceSeen;
        int filled = o.quantity;

        if (o.isMarket) {
            double slippagePct = 0.001 * double(filled)/500.0*100.0;
            fillPrice = (o.side=="BUY") ? fillPrice*(1+slippagePct) : fillPrice*(1-slippagePct);
        } else {
            if ((o.side=="BUY" && o.price>=lastPriceSeen) || (o.side=="SELL" && o.price<=lastPriceSeen))
                fillPrice = o.price;
            else continue;
        }

        if (o.side=="BUY") { position += filled; cash -= fillPrice*filled + feePerTrade; }
        else { position -= filled; cash += fillPrice*filled - feePerTrade; }

        nav = cash + position*lastPriceSeen;
        Trade tr{o.timestamp, o.id, o.side, fillPrice, filled};
        recorder.recordTrade(tr);
        recorder.recordNav(o.timestamp, nav);

        cout << "{\"event\":\"trade_executed\",\"order_id\":\"" << tr.order_id
             << "\",\"side\":\"" << tr.side
             << "\",\"price\":" << fixed << setprecision(4) << tr.price
             << ",\"qty\":" << tr.quantity
             << ",\"timestamp\":\"" << tr.timestamp << "\"}" << endl;
    }
}

void Engine::saveResults(const string& tradesFile, const string& navFile) {
    recorder.saveTrades(tradesFile);
    recorder.saveNav(navFile);

    cout << "{\"event\":\"run_complete\",\"final_nav\":" << fixed << setprecision(4) << nav
         << ",\"cash\":" << cash
         << ",\"position\":" << position << "}" << endl;
}
