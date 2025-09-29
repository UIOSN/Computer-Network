#include <winsock2.h>
#include <stdio.h>

#define PACKET_SIZE 64

int main(int argc, char *argv[])
{
    if (argc < 2 || argc > 3)
    {
        fprintf(stderr, "Usage: %s <receiver Port>\n       %s <receiver IP> <receiver Port>\n", argv[0], argv[0]);
        return 1;
    }

    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData))
    {
        fprintf(stderr, "WSAStartup failed\n");
        return 1;
    }

    SOCKET receiverSocket = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
    if (receiverSocket == INVALID_SOCKET)
    {
        fprintf(stderr, "receiverSocket failed: %d\n", WSAGetLastError());
        WSACleanup();
        return 1;
    }

    struct sockaddr_in senderAddr, receiverAddr;
    int senderAddrSize = sizeof(senderAddr);
    receiverAddr.sin_family = AF_INET;
    receiverAddr.sin_port = htons(argc == 3 ? atoi(argv[2]) : atoi(argv[1]));
    if (argc == 3)
    {
        receiverAddr.sin_addr.s_addr = inet_addr(argv[1]);
        if (receiverAddr.sin_addr.s_addr == INADDR_NONE)
        {
            fprintf(stderr, "Invalid IP address\n");
            WSACleanup();
            return 1;
        }
    }
    else
    {
        receiverAddr.sin_addr.s_addr = INADDR_ANY;
    }

    if (bind(receiverSocket, (const struct sockaddr *)&receiverAddr, sizeof(receiverAddr)) == SOCKET_ERROR)
    {
        fprintf(stderr, "bind failed: %d\n", WSAGetLastError());
        WSACleanup();
        return 1;
    }

    char buffer[PACKET_SIZE];
    int cnt = 0;

    while (1)
    {
        int receiveSize = recvfrom(receiverSocket, buffer, PACKET_SIZE, 0, (struct sockaddr *)&senderAddr, &senderAddrSize);
        if (receiveSize == SOCKET_ERROR)
        {
            fprintf(stderr, "recvfrom failed: %d\n", WSAGetLastError());
            WSACleanup();
            return 1;
        }
        receiveSize = min(receiveSize, PACKET_SIZE);

        printf("Receiving %3d/100: ", ++cnt);
        for (int i = 0; i < receiveSize; ++i)
            putchar(buffer[i]);
        putchar('\n');
        if (cnt == 100)
            break;
    }

    if (closesocket(receiverSocket) == SOCKET_ERROR)
    {
        fprintf(stderr, "closesocket failed: %d\n", WSAGetLastError());
        WSACleanup();
        return 1;
    }

    WSACleanup();
    return 0;
}