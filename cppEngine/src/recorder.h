#pragma once
#include "types.h"
#include <vector>
#include <string>

using namespace std;

class Recorder {
private:
    vector<Trade> trades;
    // NAV points: timestamp, nav
    vector<pair<string,double>> nav_points;
public:
    void recordTrade(const Trade& t);
    void recordNav(const string& timestamp, double nav);
    void saveTrades(const string& filepath) const;
    void saveNav(const string& filepath) const;
    vector<Trade> getTrades() const { return trades; }
};
