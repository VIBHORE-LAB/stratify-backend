set -e

cp cppEngine
mkdir -p build
cd build
cmake ..
make -j$(nproc)

chmod +x backtester
