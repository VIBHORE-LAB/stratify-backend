#pragma once
#include <string>

struct Tick {
    std::string timestamp;
    double price;
    int volume = 0; // optional
};

struct Order {
    std::string id;
    std::string timestamp;
    std::string side;
    double price;
    int quantity;
    bool isMarket = true;
};

struct Trade {
    std::string timestamp;
    std::string order_id;
    std::string side;
    double price;
    int quantity;
};
