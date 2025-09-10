#include <iostream>
#include <string>
#include <map>
#include <thread>
#include <chrono>
#include "data_loader.h"
#include "engine.h"
#include "momentum_strategy.h"
#include "mean_reversion_strategy.h"
#include "moving_crossover_strategy.h"
#include "rsi_strategy.h"
#include "bollinger_strategy.h"
#include "breakout_strategy.h"
#include "macd_strategy.h"
#include "vwap_strategy.h"

using namespace std;

map<string,string> parseArgs(int argc, char** argv) {
    map<string,string> params;
    for(int i=3;i<argc;++i){
        string arg = argv[i];
        if(arg.rfind("--",0)==0 && i+1<argc){
            params[arg.substr(2)] = argv[i+1];
            ++i;
        }
    }
    return params;
}

int main(int argc, char** argv){
    try{
        cout << "Program started\n" << flush;

        if(argc<3){
            cerr << "Usage: " << argv[0] << " <datafile_path> <strategy_name> [optional_params...]\n";
            return 1;
        }

        string filepath = argv[1];
        string strat = argv[2];
        map<string,string> params = parseArgs(argc,argv);

        auto ticks = DataLoader::loadCSV(filepath);
        if(ticks.empty()){ cerr << "No data loaded.\n"; return 1; }

        Engine engine;
        unique_ptr<Strategy> strategy;

        if(strat=="meanrev"){
            int window = params.count("window")? stoi(params["window"]) : 4;
            double stddev_mult = params.count("stddev")? stod(params["stddev"]) : 1.0;
            int qty = params.count("qty")? stoi(params["qty"]) : 10;
            strategy = make_unique<MeanReversionStrategy>(&engine, window, stddev_mult, qty);
        } else if(strat=="momentum"){
            double threshold = params.count("threshold")? stod(params["threshold"]) : 0.01;
            int qty = params.count("qty")? stoi(params["qty"]) : 10;
            strategy = make_unique<MomentumStrategy>(&engine, threshold, qty);
        }
        
        else if(strat == "crossover"){
            int shortWindow = params.count("short") ? stoi(params["short"]) : 5;
            int longWindow = params.count("long") ? stoi(params["long"]) : 20;
            int qty = params.count("qty") ? stoi(params["qty"]) : 10;
            strategy = make_unique<MovingAverageCrossoverStrategy>(&engine, shortWindow, longWindow,qty);
        }

        else if(strat == "rsi"){
            int lb = params.count("lb") ? stoi(params["lb"]) : 14;
            double low = params.count("low") ? stod(params["low"]) : 30.0;
            double high = params.count("high") ? stod(params["high"]) : 70.0;
            int qty = params.count("qty") ? stoi(params["qty"]) : 10;

            strategy = make_unique<RSIStrategy>(&engine, lb, low, high, qty);
        } 

        else if(strat == "bollinger"){
            int lb = params.count("lb") ? stoi(params["lb"]) : 20;
            double sd = params.count("sd") ? stod(params["sd"]) : 2.0;
            int sz = params.count("sz") ? stoi(params["sz"]) : 10;

            strategy = make_unique<BollingerStrategy>(&engine, lb, sd, sz);
        }

        else if(strat == "breakout"){
            int lb = params.count("lb") ? stoi(params["lb"]) : 20;
            int sz = params.count("sz") ? stoi(params["sz"]) : 10;

            strategy = make_unique<BreakoutStrategy>(&engine, lb,sz);
        }
        
        else if(strat == "mcad"){
            int fast = params.count("fast") ? stoi(params["fast"]) : 12;
            int slow = params.count("slow") ? stoi(params["slow"]) : 20;
            int signal = params.count("signal") ? stoi(params["signal"]) : 0;
            int sz = params.count("sz") ? stoi(params["sz"]) : 10;

            strategy = make_unique<MACDStrategy>(&engine, fast, slow, signal, sz);
        }

        else if(strat == "vwap"){
            int sz = params.count("sz") ? stoi(params["sz"]) :10;
            
            strategy = make_unique<VWAPStrategy>(&engine, sz);
        }


        
        else { cerr << "Unknown strategy\n"; return 1; }

        cout << "Loaded " << ticks.size() << " ticks from " << filepath << "\n" << flush;

        engine.start(move(strategy), ticks);

        while(engine.isRunning()){
            this_thread::sleep_for(chrono::milliseconds(50));
        }

        engine.saveResults("out_trades.csv","out_nav.csv");
        cout << "Backtest finished.\n";

        return 0;
    } catch(const exception& e){
        cerr << "Exception: " << e.what() << endl;
        return 1;
    } catch(...){
        cerr << "Unknown exception caught\n";
        return 1;
    }
}
