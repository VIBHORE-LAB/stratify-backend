#pragma once
#include <vector>
#include <string>
#include "types.h"


using namespace std;

class DataLoader{
    public:
        static vector<Tick> loadCSV(const string& filePath);
};
