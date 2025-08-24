#pragma once
#include <string>
#include<vector>

using namespace std;

struct Tick{
    string timestamp;
    double price;
    int volume;
};

struct Order{
    string id;
    string timestamp;
    string side;
    double price;
    int quantity;
    bool isMarket;
};


struct Trade{
    string timestamp;
    string order_id;
    string side;
    double price;
    int quantity;
};