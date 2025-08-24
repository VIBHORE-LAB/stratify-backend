cmake_minimum_required(VERSION 3.10)
project(Backtester)


set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)


file(GLOB SOURCES "src/*.cpp")
add_executable(backtester ${SOURCES})


