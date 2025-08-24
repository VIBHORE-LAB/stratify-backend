#include <iostream>
#include <string>
#include <map>
#include "data_loader.h"
#include "engine.h"
#include "momentum_strategy.h"
#include "mean_reversion_strategy.h"

using namespace std;

map<string, string> parseArgs(int argc, char** argv) {
    map<string, string> params;
    for (int i = 3; i < argc; ++i) {
        string arg = argv[i];
        if (arg.rfind("--", 0) == 0) {
            string key = arg.substr(2);
            if (i + 1 < argc) {
                params[key] = argv[i+1];
                i++;
            }
        }
    }
    return params;
}

int main(int argc, char** argv) {
    std::cout << "Program started" << std::endl;

    if (argc < 3) {
        cerr << "Usage: " << argv[0] << " <datafile_path> <strategy_name> [optional_params...]\n";
        return 1;
    }

    string filepath = argv[1];
    string strat = argv[2];
    map<string, string> params = parseArgs(argc, argv);

    auto ticks = DataLoader::loadCSV(filepath);
    if (ticks.empty()) {
        cerr << "No data loaded. Exiting.\n";
        return 1;
    }

    Engine engine;
    Strategy* strategy = nullptr;

    if (strat == "meanrev") {
        int window = params.count("window") ? stoi(params["window"]) : 4;
        double stddev_mult = params.count("stddev") ? stod(params["stddev"]) : 1.0;
        int position_size = params.count("qty") ? stoi(params["qty"]) : 10;
        
        strategy = new MeanReversionStrategy(&engine, window, stddev_mult, position_size);
    } else if (strat == "momentum") {
        double threshold = params.count("threshold") ? stod(params["threshold"]) : 0.01;
        int position_size = params.count("qty") ? stoi(params["qty"]) : 10;

        strategy = new MomentumStrategy(&engine, threshold, position_size);
    } else {
        cerr << "Unknown strategy: " << strat << ". Exiting.\n";
        return 1;
    }

    cout << "Loaded " << ticks.size() << " ticks from " << filepath << "\n";
    for (size_t i = 0; i < std::min<size_t>(ticks.size(), 5); ++i) {
        cout << ticks[i].timestamp << " " << ticks[i].price << " " << ticks[i].volume << "\n";
    }

    engine.start(strategy, ticks);

    while (engine.isRunning()) {
        this_thread::sleep_for(chrono::milliseconds(200));
    }

    engine.saveResults("out_trades.csv", "out_nav.csv");
    cout << "Backtest finished. Trades -> out_trades.csv, NAV -> out_nav.csv\n";
    delete strategy;
    return 0;
}