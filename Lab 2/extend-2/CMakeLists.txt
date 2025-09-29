cmake_minimum_required(VERSION 3.14)
project(TCPChatApp)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_COLOR_DIAGNOSTICS ON)

if(WIN32)
    if(CMAKE_CXX_COMPILER_ID STREQUAL "GNU")
        add_compile_options(-Wall -Wextra -pedantic)
        set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -static")
    endif()

    if(CMAKE_CXX_COMPILER_ID STREQUAL "MSVC")
        add_compile_options(/W4)
        set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
    endif()
endif()

include_directories(${CMAKE_CURRENT_SOURCE_DIR})

add_executable(TCPserver
    TCPserver.cc
    chat.cc
    chat.hpp
    json.hpp
)

add_executable(TCPclient
    TCPclient.cc
    chat.cc
    chat.hpp
    json.hpp
)

if(WIN32)
    target_link_libraries(TCPserver ws2_32)
    target_link_libraries(TCPclient ws2_32)
endif()

# 设置输出目录
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})