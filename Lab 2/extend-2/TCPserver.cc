#include <winsock2.h>
#include <iostream>
#include <optional>
#include <fstream>
#include <string>
#include <cstring>
#include <format>
#include <vector>
#include <thread>
#include <unordered_map>
#include <unordered_set>
#include "json.hpp"
#include "chat.hpp"

#define BUF_SIZE 65536

using json = nlohmann::json;

std::unordered_map<std::string, SOCKET> onlineUsers;
std::unordered_set<std::string> allUsers;
std::unordered_map<std::string, std::vector<std::string>> groups;
std::unordered_map<std::string, bool> status;

void handleClient(SOCKET clientSocket)
{
    std::string loginUser;
    std::optional<clientMessage> msgOpt;

    while ((msgOpt = receiveClientMessage(clientSocket)))
    {
        clientMessage &msg = *msgOpt;

        if (msg.command == "sendfile")
        {
            std::cout << std::format("Receiving file: {} ({} bytes) from {}\n", msg.filename, msg.filesize, msg.sender);
            bool recvOK = receiveFile(clientSocket, msg.filename, msg.filesize);
            if (recvOK)
            {
                std::cout << "File saved: " << msg.filename << std::endl;
                if (onlineUsers.find(msg.receiver) != onlineUsers.end())
                {
                    SOCKET targetSock = onlineUsers[msg.receiver];
                    serverMessage notifyMsg(SENDFILE, msg.sender, "", msg.filename, msg.filesize);
                    sendServerMessage(targetSock, notifyMsg);
                    if (sendFile(targetSock, msg.filename))
                    {
                        std::cout << std::format("File {} forwarded to {}\n", msg.filename, msg.receiver);
                        serverMessage response(SUCCESS, "server", "File sent to " + msg.receiver, "", 0);
                        sendServerMessage(clientSocket, response);
                    }
                    else
                    {
                        std::cerr << std::format("Failed to forward file {} to {}\n", msg.filename, msg.receiver);
                        serverMessage response(FAIL, "server", "Failed to send file to " + msg.receiver, "", 0);
                        sendServerMessage(clientSocket, response);
                    }
                }
            }
            else
            {
                std::cerr << "Failed to receive file: " << msg.filename << std::endl;
                serverMessage response(FAIL, "server", "Failed to receive file: " + msg.filename, "", 0);
                sendServerMessage(clientSocket, response);
            }
        }
        else if (msg.command == "login")
        {
            std::cout << std::format("User {} logged in.\n", msg.sender);
            loginUser = msg.sender;
            onlineUsers[loginUser] = clientSocket;
            status[loginUser] = true;
            allUsers.insert(loginUser);
            serverMessage response(SUCCESS, "server", "Login successful.", "", 0);
            sendServerMessage(clientSocket, response);
        }
        else if (msg.command == "logout")
        {
            std::cout << std::format("User {} logged out.\n", msg.sender);
            onlineUsers.erase(msg.sender);
            status[msg.sender] = false;
            loginUser.clear();
        }
        else if (msg.command == "list")
        {
            std::string userList;
            for (const auto &user : allUsers)
            {
                userList += user + (status[user] ? " (online)\n" : " (offline)\n");
            }
            serverMessage response(SUCCESS, "server", userList, "", 0);
            sendServerMessage(clientSocket, response);
        }
        else if (msg.command == "creategroup")
        {
            if (groups.find(msg.receiver) == groups.end())
            {
                groups[msg.receiver] = {msg.sender};
                std::cout << std::format("Group {} created by {}\n", msg.receiver, msg.sender);
            }
        }
        else if (msg.command == "joingroup")
        {
            if (groups.find(msg.receiver) != groups.end())
            {
                groups[msg.receiver].push_back(msg.sender);
                std::cout << std::format("User {} joined group {}\n", msg.sender, msg.receiver);
            }
        }
        else if (msg.command == "listgroup")
        {
            if (groups.find(msg.receiver) != groups.end())
            {
                std::string memberList;
                for (const auto &member : groups[msg.receiver])
                {
                    memberList += member + (status[member] ? " (online)\n" : " (offline)\n");
                }
                serverMessage response(SUCCESS, "server", memberList, "", 0);
                sendServerMessage(clientSocket, response);
            }
            else
            {
                serverMessage response(BAD_REQUEST, "server", "Group not found.", "", 0);
                sendServerMessage(clientSocket, response);
            }
        }
        else if (msg.command == "call")
        {
            if (onlineUsers.find(msg.receiver) != onlineUsers.end())
            {
                serverMessage callMsg(BAD_REQUEST, msg.sender, "Incoming call from " + msg.sender, "", 0);
                sendServerMessage(onlineUsers[msg.receiver], callMsg);
                serverMessage response(SUCCESS, "server", "Call request sent to " + msg.receiver, "", 0);
                sendServerMessage(clientSocket, response);
                std::cout << std::format("User {} is calling {}\n", msg.sender, msg.receiver);
            }
            else
            {
                serverMessage response(BAD_REQUEST, "server", msg.receiver + " is not online.", "", 0);
                sendServerMessage(clientSocket, response);
            }
        }
        else if (msg.command == "send")
        {
            if (onlineUsers.find(msg.receiver) != onlineUsers.end())
            {
                serverMessage chatMsg(SUCCESS, msg.sender, msg.content, "", 0);
                sendServerMessage(onlineUsers[msg.receiver], chatMsg);
                std::cout << std::format("Message from {} to {}: {}\n", msg.sender, msg.receiver, msg.content);
            }
            else
            {
                serverMessage response(BAD_REQUEST, "server", msg.receiver + " is not online.", "", 0);
                sendServerMessage(clientSocket, response);
            }
        }
    }

    std::cout << "Client disconnected." << std::endl;
    if (!loginUser.empty())
    {
        onlineUsers.erase(loginUser);
        status[loginUser] = false;
    }
    closesocket(clientSocket);
}

int main(int argc, char *argv[])
{
    if (argc < 2 || argc > 3)
    {
        std::cerr << std::format("Usage: {} <server Port>", argv[0]) << std::endl
                  << std::format("       {} <receiver IP> <server Port>", argv[0]) << std::endl;
        return 1;
    }

    WSADATA wsaData;
    int errCode = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (errCode != NO_ERROR)
    {
        std::cerr << std::format("WSAStartup failed: {}", errCode) << std::endl;
        return 1;
    }

    try
    {
        auto port = argc == 3 ? atoi(argv[2]) : atoi(argv[1]);
        const char *IP = argc == 3 ? argv[1] : nullptr;

        SOCKET serverSocket;
        std::vector<SOCKET> connSockets;

        serverSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
        if (serverSocket == INVALID_SOCKET)
            throw std::runtime_error("serverSocket failed: " + std::to_string(WSAGetLastError()));

        sockaddr_in serverAddr;
        serverAddr.sin_family = AF_INET;
        serverAddr.sin_port = htons(port);
        serverAddr.sin_addr.s_addr = IP == nullptr ? INADDR_ANY : inet_addr(IP);

        if (serverAddr.sin_addr.s_addr == INADDR_NONE)
            throw std::runtime_error("Invalid IP address.");

        if (bind(serverSocket, (sockaddr *)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR)
            throw std::runtime_error("bind failed: " + std::to_string(WSAGetLastError()));

        if (listen(serverSocket, SOMAXCONN) == SOCKET_ERROR)
            throw std::runtime_error("listen failed: " + std::to_string(WSAGetLastError()));

        while (true)
        {
            sockaddr_in clientAddr;
            int clientAddrSize = sizeof(clientAddr);
            SOCKET connectionSocket = accept(serverSocket, (sockaddr *)&clientAddr, &clientAddrSize);

            if (connectionSocket == INVALID_SOCKET)
                throw std::runtime_error("accept failed: " + std::to_string(WSAGetLastError()));

            std::thread thread(handleClient, connectionSocket);
            thread.detach();
        }
    }
    catch (const std::exception &e)
    {
        std::cerr << "Error: " << e.what() << std::endl;
        WSACleanup();
        return 1;
    }

    WSACleanup();
    return 0;
}