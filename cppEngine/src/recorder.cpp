#include "recorder.h"
#include <fstream>
#include <iostream>

void Recorder::recordTrade(const Trade& t){
    std::lock_guard<std::mutex> lk(mtx);
    trades.push_back(t);
}

void Recorder::recordNav(const std::string& timestamp, double nav){
    std::lock_guard<std::mutex> lk(mtx);
    nav_points.emplace_back(timestamp, nav);
}

void Recorder::saveTrades(const std::string& filepath) const {
    std::lock_guard<std::mutex> lk(mtx);
    std::ofstream f(filepath);
    f << "timestamp,order_id,side,price,quantity\n";
    for (auto &t : trades) {
        f << t.timestamp << "," << t.order_id << "," << t.side << "," << t.price << "," << t.quantity << "\n";
    }
}

void Recorder::saveNav(const std::string& filepath) const {
    std::lock_guard<std::mutex> lk(mtx);
    std::ofstream f(filepath);
    f << "timestamp,nav\n";
    for (auto &p : nav_points) {
        f << p.first << "," << p.second << "\n";
    }
}
