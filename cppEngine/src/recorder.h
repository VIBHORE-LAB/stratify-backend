#pragma once
#include <vector>
#include <string>
#include <mutex>
#include <utility>
#include "types.h"  // include Trade here

class Recorder {
private:
    std::vector<Trade> trades;
    std::vector<std::pair<std::string, double>> nav_points;
    mutable std::mutex mtx;

public:
    void recordTrade(const Trade& t);
    void recordNav(const std::string& timestamp, double nav);
    void saveTrades(const std::string& filepath) const;
    void saveNav(const std::string& filepath) const;
};
