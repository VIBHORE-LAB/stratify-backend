#include "data_loader.h"
#include <fstream>
#include <sstream>
#include <iostream>
using namespace std;

vector<Tick> DataLoader::loadCSV(const string& filepath){
    vector<Tick> data;
    ifstream file(filepath);
    if(!file.is_open()){
        cerr << "Error opening this file" << filepath <<endl;
        return data;
    }

    string line;
    if(!getline(file,line)) {
        return data;
    }

    while(getline(file,line)){
    if(line.empty()){
        continue;
    }

    stringstream ss(line);
    string timestamp,priceStr, volumeStr;
    getline(ss,timestamp, ',');
    getline(ss,priceStr, ',');
    getline(ss, volumeStr, ',');
    try{
        double price = stod(priceStr);
        int volume = stoi(volumeStr);
        data.push_back(Tick{timestamp, price, volume});

    }
    catch(...){
        continue;
    }
    }
return data;

}
