#include <winsock2.h>
#include <iostream>
#include <fstream>
#include <string>
#include <cstring>
#include <format>
#include <vector>
#include <sstream>
#include <thread>
#include "json.hpp"
#include "chat.hpp"

using json = nlohmann::json;

#define BUF_SIZE 65536

class TCPclient
{
public:
    SOCKET clientSocket;
    TCPclient(const char *IP, u_short port);
    ~TCPclient();
};

TCPclient::TCPclient(const char *IP, u_short port) : clientSocket(INVALID_SOCKET)
{
    clientSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (clientSocket == INVALID_SOCKET)
        throw std::runtime_error("clientSocket failed: " + std::to_string(WSAGetLastError()));

    sockaddr_in serverAddr;
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_port = htons(port);
    serverAddr.sin_addr.s_addr = inet_addr(IP);

    if (serverAddr.sin_addr.s_addr == INADDR_NONE)
        throw std::runtime_error("Invalid IP address.");

    if (connect(clientSocket, (sockaddr *)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR)
        throw std::runtime_error("connect failed: " + std::to_string(WSAGetLastError()));
}

TCPclient::~TCPclient()
{
    if (clientSocket != INVALID_SOCKET)
    {
        closesocket(clientSocket);
        clientSocket = INVALID_SOCKET;
    }
}

std::string loginUser;
bool loggedIn = false;

// 接收线程函数
void receiveLoop(SOCKET sock, std::atomic<bool> &running)
{
    while (running)
    {
        auto msgOpt = receiveServerMessage(sock);
        if (!msgOpt)
        {
            // 连接关闭或出错
            std::cerr << "\n[Server] Connection closed." << std::endl;
            running = false;
            break;
        }

        serverMessage msg = *msgOpt;
        std::cout << std::format("\n[Debug] Received message: statusCode={}, sender={}, message={}, filename={}, filesize={}\n",
                                 msg.statusCode, msg.sender, msg.message, msg.filename, msg.filesize);

        // 处理不同类型的服务器消息
        if (msg.statusCode == CHAT)
        {
            std::cout << "\n[Message from " << msg.sender << "] " << msg.message << std::endl;
        }
        else if (msg.statusCode == SENDFILE && !msg.filename.empty())
        {
            std::cout << "\n[File] " << msg.sender << " sent file: " << msg.filename
                      << " (" << msg.filesize << " bytes). Receiving..." << std::endl;

            if (receiveFile(sock, msg.filename, msg.filesize))
            {
                std::cout << "[File] Saved as: " << msg.filename << std::endl;
            }
            else
            {
                std::cerr << "[File] Failed to receive: " << msg.filename << std::endl;
            }
            continue;
        }
        else
        {
            std::cout << "\n[System] " << msg.message << std::endl;
        }

        if (!loggedIn)
            std::cout << "> ";
        else
            std::cout << "[" << loginUser << "]> ";
        std::cout.flush();
    }
}

int main(int argc, char *argv[])
{
    if (argc != 3)
    {
        std::cerr << std::format("Usage: {} <server IP> <server Port>", argv[0]) << std::endl;
        return 1;
    }

    WSADATA wsaData;
    int errCode = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (errCode != NO_ERROR)
    {
        std::cerr << std::format("WSAStartup failed: {}", errCode) << std::endl;
        return 1;
    }

    std::atomic<bool> running = true;

    try
    {
        TCPclient client(argv[1], atoi(argv[2]));
        std::thread receive_thread(receiveLoop, client.clientSocket, std::ref(running));
        while (running)
        {
            if (!loggedIn)
                std::cout << "> ";
            else
                std::cout << "[" << loginUser << "]> ";
            std::cout.flush();
            std::string s;
            std::getline(std::cin, s);
            std::istringstream iss(s);
            std::string token;
            if (iss >> token)
            {
                if (token == "help")
                {
                    std::cout << "Available commands:\n"
                              << "  help                        - Show this help\n"
                              << "  login <username>            - Login to server\n"
                              << "  logout                      - Logout from server\n"
                              << "  send <receiver> <msg>       - Send private message\n"
                              << "  sendfile <receiver> <path>  - Send file\n"
                              << "  joingroup <group>           - Join a group\n"
                              << "  creategroup <group>         - Create a new group\n"
                              << "  list                        - List all users and groups\n"
                              << "  listgroup <group>           - List members of a group\n"
                              << "  call <username>             - Call user (notify if online)\n"
                              << "  exit                        - Exit client\n"
                              << std::endl;
                    continue;
                }
                else if (token == "login")
                {
                    if (loggedIn)
                    {
                        std::cout << "Already logged in as " << loginUser << std::endl;
                        continue;
                    }
                    std::string username;
                    if (iss >> username)
                    {
                        clientMessage msg("login", username, "", "", "", 0);
                        sendClientMessage(client.clientSocket, msg);
                        loggedIn = true;
                        loginUser = username;
                    }
                    else
                    {
                        std::cout << "Usage: login <username>" << std::endl;
                    }
                }
                else if (token == "logout")
                {
                    if (!loggedIn)
                    {
                        std::cout << "Not logged in." << std::endl;
                        continue;
                    }
                    clientMessage msg("logout", loginUser, "", "", "", 0);
                    sendClientMessage(client.clientSocket, msg);
                    loggedIn = false;
                    loginUser.clear();
                    std::cout << "Logged out." << std::endl;
                }
                else if (token == "send")
                {
                    if (!loggedIn)
                    {
                        std::cout << "Please login first." << std::endl;
                        continue;
                    }
                    std::string receiver;
                    if (iss >> receiver)
                    {
                        std::string content;
                        std::getline(iss, content);
                        if (!content.empty() && content[0] == ' ')
                            content.erase(0, 1); // Remove leading space
                        clientMessage msg("send", loginUser, receiver, content, "", 0);
                        sendClientMessage(client.clientSocket, msg);
                        std::cout << "Message sent to " << receiver << std::endl;
                    }
                    else
                    {
                        std::cout << "Usage: send <receiver> <msg>" << std::endl;
                    }
                }
                else if (token == "sendfile")
                {
                    if (!loggedIn)
                    {
                        std::cout << "Please login first." << std::endl;
                        continue;
                    }
                    std::string receiver, filePath;
                    if (iss >> receiver >> filePath)
                    {
                        std::ifstream file(filePath, std::ios::binary | std::ios::ate);
                        if (!file)
                        {
                            std::cout << "Failed to open file: " << filePath << std::endl;
                            continue;
                        }
                        size_t fileSize = file.tellg();
                        file.close();

                        std::string filename = filePath.substr(filePath.find_last_of("/\\") + 1);
                        clientMessage msg("sendfile", loginUser, receiver, "", filename, fileSize);
                        sendClientMessage(client.clientSocket, msg);
                        sendFile(client.clientSocket, filePath);
                        std::cout << "File sent to " << receiver << ": " << filename << " (" << fileSize << " bytes)" << std::endl;
                    }
                    else
                    {
                        std::cout << "Usage: sendfile <receiver> <path>" << std::endl;
                    }
                }
                else if (token == "joingroup")
                {
                    if (!loggedIn)
                    {
                        std::cout << "Please login first." << std::endl;
                        continue;
                    }
                    std::string group;
                    if (iss >> group)
                    {
                        clientMessage msg("joingroup", loginUser, group, "", "", 0);
                        sendClientMessage(client.clientSocket, msg);
                        std::cout << "Join group request sent: " << group << std::endl;
                    }
                    else
                    {
                        std::cout << "Usage: joingroup <group>" << std::endl;
                    }
                }
                else if (token == "creategroup")
                {
                    if (!loggedIn)
                    {
                        std::cout << "Please login first." << std::endl;
                        continue;
                    }
                    std::string group;
                    if (iss >> group)
                    {
                        clientMessage msg("creategroup", loginUser, group, "", "", 0);
                        sendClientMessage(client.clientSocket, msg);
                        std::cout << "Create group request sent: " << group << std::endl;
                    }
                    else
                    {
                        std::cout << "Usage: creategroup <group>" << std::endl;
                    }
                }
                else if (token == "list")
                {
                    if (!loggedIn)
                    {
                        std::cout << "Please login first." << std::endl;
                        continue;
                    }
                    clientMessage msg("list", loginUser, "", "", "", 0);
                    sendClientMessage(client.clientSocket, msg);
                }
                else if (token == "listgroup")
                {
                    if (!loggedIn)
                    {
                        std::cout << "Please login first." << std::endl;
                        continue;
                    }
                    std::string group;
                    if (iss >> group)
                    {
                        clientMessage msg("listgroup", loginUser, group, "", "", 0);
                        sendClientMessage(client.clientSocket, msg);
                    }
                    else
                    {
                        std::cout << "Usage: listgroup <group>" << std::endl;
                    }
                }
                else if (token == "call")
                {
                    if (!loggedIn)
                    {
                        std::cout << "Please login first." << std::endl;
                        continue;
                    }
                    std::string callee;
                    if (iss >> callee)
                    {
                        clientMessage msg("call", loginUser, callee, "", "", 0);
                        sendClientMessage(client.clientSocket, msg);
                    }
                    else
                    {
                        std::cout << "Usage: call <username>" << std::endl;
                    }
                }
                else if (token == "exit")
                {
                    std::cout << "Exiting client." << std::endl;
                    running = false;
                    break;
                }
                else
                {
                    std::cout << "Unknown command. Type 'help' for a list of commands." << std::endl;
                }
            }
        }
        if (receive_thread.joinable())
        {
            receive_thread.join();
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