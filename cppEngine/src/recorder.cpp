#include "recorder.h"
#include <fstream>
using namespace std;

void Recorder::recordTrade(const Trade& t){
    trades.push_back(t);
}


void Recorder::recordNav(const string& timestamp, double nav){
    nav_points.emplace_back(timestamp, nav);

}

void Recorder::saveTrades(const string& filepath) const {
    ofstream f(filepath);
    f << "timestamp, order_id, side, price, quantity\n";
    for(auto &t : trades){
        f << t.timestamp << "," << t.order_id << "," << t.side << "," << t.price << "," << t.quantity << "\n";
    }
}


void Recorder::saveNav(const string& filepath) const {
    ofstream f(filepath);
    f << "timestamp, nav\n";
    for(auto &p : nav_points){
        f << p.first << "," << p.second << "\n";
    }
}
