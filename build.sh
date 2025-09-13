#!/usr/bin/env bash
set -e

# Navigate to cppEngine folder
cd cppEngine

# Create build folder if it doesn't exist
mkdir -p build
cd build

# Run cmake and build
cmake ..
make -j$(nproc)

# Make sure the binary is executable
chmod +x backtester
