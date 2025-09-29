#include "chat.hpp"
#include <fstream>
#include <iostream>

clientMessage parseClientJson(const std::string &jsonStr)
{
    try
    {
        json j = json::parse(jsonStr);
        clientMessage msg;
        msg.command = j.value("command", "");
        msg.sender = j.value("sender", "");
        msg.receiver = j.value("receiver", "");
        msg.content = j.value("content", "");
        msg.filename = j.value("filename", "");
        msg.filesize = j.value("filesize", 0);
        return msg;
    }
    catch (const json::parse_error &e)
    {
        throw std::invalid_argument("JSON parse error: " + std::string(e.what()));
    }
    catch (const std::exception &e)
    {
        throw std::invalid_argument("Error parsing JSON: " + std::string(e.what()));
    }
}

serverMessage parseServerJson(const std::string &jsonStr)
{
    try
    {
        json j = json::parse(jsonStr);
        serverMessage msg;
        msg.statusCode = j.value("statusCode", 0);
        msg.sender = j.value("sender", "");
        msg.message = j.value("message", "");
        msg.filename = j.value("filename", "");
        msg.filesize = j.value("filesize", 0);
        return msg;
    }
    catch (const json::parse_error &e)
    {
        throw std::invalid_argument("JSON parse error: " + std::string(e.what()));
    }
    catch (const std::exception &e)
    {
        throw std::invalid_argument("Error parsing JSON: " + std::string(e.what()));
    }
}

std::optional<clientMessage> receiveClientMessage(SOCKET sock)
{
    static std::string buffer;
    char temp[4096];
    int n;

    while (true)
    {
        size_t pos = buffer.find('\n');
        if (pos != std::string::npos)
        {
            std::string jsonStr = buffer.substr(0, pos);
            buffer.erase(0, pos + 1);

            try
            {
                return parseClientJson(jsonStr);
            }
            catch (const std::exception &e)
            {
                std::cerr << "Parse error: " << e.what() << std::endl;
                continue;
            }
        }

        n = recv(sock, temp, sizeof(temp), 0);
        if (n > 0)
        {
            buffer.append(temp, n);
        }
        else
        {
            return std::nullopt;
        }
    }
}

std::optional<serverMessage> receiveServerMessage(SOCKET sock)
{
    char temp[4096];
    static std::string buffer;
    int n;

    while (true)
    {
        size_t pos = buffer.find('\n');
        if (pos != std::string::npos)
        {
            std::string jsonStr = buffer.substr(0, pos);
            buffer.erase(0, pos + 1);

            try
            {
                return parseServerJson(jsonStr);
            }
            catch (const std::exception &e)
            {
                std::cerr << "Parse error: " << e.what() << std::endl;
                continue;
            }
        }

        n = recv(sock, temp, sizeof(temp), 0);
        if (n > 0)
        {
            buffer.append(temp, n);
        }
        else
        {
            return std::nullopt;
        }
    }
}

void sendClientMessage(SOCKET sock, const clientMessage &msg)
{
    json j;
    j["command"] = msg.command;
    j["sender"] = msg.sender;
    j["receiver"] = msg.receiver;
    j["content"] = msg.content;
    j["filename"] = msg.filename;
    j["filesize"] = msg.filesize;

    std::string jsonStr = j.dump() + "\n";
    send(sock, jsonStr.c_str(), static_cast<int>(jsonStr.size()), 0);
}

void sendServerMessage(SOCKET sock, const serverMessage &msg)
{
    json j;
    j["statusCode"] = msg.statusCode;
    j["sender"] = msg.sender;
    j["message"] = msg.message;
    j["filename"] = msg.filename;
    j["filesize"] = msg.filesize;

    std::string jsonStr = j.dump() + "\n";
    send(sock, jsonStr.c_str(), static_cast<int>(jsonStr.size()), 0);
}

bool sendFile(SOCKET sock, const std::string &filePath)
{
    std::ifstream file(filePath, std::ios::binary);
    if (!file)
    {
        std::cerr << "Cannot open file: " << filePath << std::endl;
        return false;
    }

    char buffer[4096];
    while (file.read(buffer, sizeof(buffer)) || file.gcount() > 0)
    {
        if (send(sock, buffer, static_cast<int>(file.gcount()), 0) == SOCKET_ERROR)
        {
            std::cerr << "Error sending file data." << std::endl;
            file.close();
            return false;
        }
    }

    file.close();
    std::cout << "File sent: " << filePath << std::endl;
    return true;
}

bool receiveFile(SOCKET sock, const std::string &filename, size_t fileSize)
{
    std::ofstream file(filename, std::ios::binary);
    if (!file)
    {
        std::cerr << "Cannot create file: " << filename << std::endl;
        return false;
    }

    char buffer[4096];
    size_t totalReceived = 0;

    while (totalReceived < fileSize)
    {
        size_t bytesToRecv = std::min(sizeof(buffer), fileSize - totalReceived);
        int bytes = recv(sock, buffer, bytesToRecv, 0);

        if (bytes <= 0)
        {
            std::cerr << "Connection closed during file transfer." << std::endl;
            file.close();
            return false;
        }

        file.write(buffer, bytes);
        totalReceived += bytes;
    }

    file.close();
    std::cout << "File received: " << filename << " (" << totalReceived << " bytes)" << std::endl;
    return true;
}