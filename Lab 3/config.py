from netmiko import ConnectHandler
from device_info import router1, router2

with ConnectHandler(**router1) as net_connect:
    net_connect.find_prompt()
    print("------------------ Configuring Router 1 ------------------")
    config_commands = [
        "sysname R1",
        "interface Ethernet0/0/1",
        "ip address 192.168.1.1 24",
        "undo shutdown",
        "quit",
        "interface Ethernet0/0/2",
        "ip address 192.168.2.1 24",
        "undo shutdown",
        "quit",
        "ip route-static 192.168.3.0 24 192.168.2.2",
    ]
    output = net_connect.send_config_set(config_commands)
    print(output)

    routing_table = net_connect.send_command("display ip routing-table")
    print(routing_table)

with ConnectHandler(**router2) as net_connect:
    print("------------------ Configuring Router 2 ------------------")
    config_commands = [
        "sysname R2",
        "interface Ethernet0/0/1",
        "ip address 192.168.3.1 24",
        "undo shutdown",
        "quit",
        "interface Ethernet0/0/2",
        "ip address 192.168.2.2 24",
        "undo shutdown",
        "quit",
        "ip route-static 192.168.1.0 24 192.168.2.1",
    ]
    output = net_connect.send_config_set(config_commands)
    print(output)

    routing_table = net_connect.send_command("display ip routing-table")
    print(routing_table)


def reboot(device):
    with ConnectHandler(**device) as net_connect:
        output = net_connect.send_command("reboot fast", expect_string=r"System will reboot! Continue ?")
        output += net_connect.send_command_timing("y")
        print(output)


def display(device):
    with ConnectHandler(**device) as net_connect:
        routing_table = net_connect.send_command("display ip routing-table")
        arp_table = net_connect.send_command("display arp")
        interface = net_connect.send_command("display ip interface brief")
        print(routing_table)


if __name__ == "__main__":
    display(router1)
    display(router2)
