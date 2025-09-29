#include <winsock2.h>
#include <stdio.h>
#include <string.h>

#define PACKET_SIZE 64

int main(int argc, char *argv[])
{
    if (argc != 3)
    {
        fprintf(stderr, "Usage: %s <receiver IP> <receiver Port>\n", argv[0]);
        return 1;
    }

    WSADATA wsaData;
    int errCode = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (errCode != NO_ERROR)
    {
        fprintf(stderr, "WSAStartup failed: %d\n", errCode);
        return 1;
    }

    SOCKET senderSocket = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
    if (senderSocket == INVALID_SOCKET)
    {
        fprintf(stderr, "senderSocket failed: %d\n", WSAGetLastError());
        WSACleanup();
        return 1;
    }

    char data[100][PACKET_SIZE];
    for (int i = 0; i < 100; ++i)
    {
        sprintf(data[i], "data %d", i + 1);
    }

    struct sockaddr_in receiverAddr;
    receiverAddr.sin_family = AF_INET;
    receiverAddr.sin_port = htons(atoi(argv[2]));
    receiverAddr.sin_addr.s_addr = inet_addr(argv[1]);

    if (receiverAddr.sin_addr.s_addr == INADDR_NONE)
    {
        fprintf(stderr, "Invalid IP address\n");
        WSACleanup();
        return 1;
    }

    for (int i = 0; i < 100; ++i)
    {
        if (sendto(senderSocket, data[i], strlen(data[i]), 0, (const struct sockaddr *)&receiverAddr, sizeof(receiverAddr)) == SOCKET_ERROR)
        {
            fprintf(stderr, "sendto failed: %d\n", WSAGetLastError());
            WSACleanup();
            return 1;
        }
    }

    if (closesocket(senderSocket) == SOCKET_ERROR)
    {
        fprintf(stderr, "closesocket failed: %d\n", WSAGetLastError());
        WSACleanup();
        return 1;
    }

    WSACleanup();
    return 0;
}