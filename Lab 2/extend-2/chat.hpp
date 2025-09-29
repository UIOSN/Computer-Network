#pragma once
#include "json.hpp"
#include <optional>
#include <winsock2.h>

using json = nlohmann::json;

struct clientMessage
{
    std::string command;
    std::string sender;
    std::string receiver;
    std::string content;
    std::string filename;
    size_t filesize;
};

struct serverMessage
{
    int statusCode;
    std::string sender;
    std::string message;
    std::string filename;
    size_t filesize;
};

enum StatusCode
{
    CHAT = 101,
    SENDFILE = 102,
    SYSTEM = 103,
    SUCCESS = 200,
    FAIL = 201,
    BAD_REQUEST = 400
};

// clientMessage parseClientJson(const std::string &jsonStr);
// serverMessage parseServerJson(const std::string &jsonStr);
std::optional<clientMessage> receiveClientMessage(SOCKET sock);
std::optional<serverMessage> receiveServerMessage(SOCKET sock);
void sendClientMessage(SOCKET sock, const clientMessage &msg);
void sendServerMessage(SOCKET sock, const serverMessage &msg);
bool sendFile(SOCKET sock, const std::string &filePath);
bool receiveFile(SOCKET sock, const std::string &filename, size_t fileSize);