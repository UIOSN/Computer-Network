from pathlib import Path
from netmiko import ConnectHandler
from device_info import router3, router4

config_dir = Path(__file__).resolve().parent


def reboot(device):
    with ConnectHandler(**device) as net_connect:
        output = net_connect.send_command("reboot fast", expect_string="System will reboot! Continue ? [y/n]:")
        output += net_connect.send_command_timing("y")
        print(output)


def clear_route_static(device):
    with ConnectHandler(**device) as net_connect:
        net_connect.config_mode()
        output = net_connect.send_command(
            "undo ip route-static all", expect_string="Warning: This operation may lead to the deletion of all the public IPv4 static routes and their configurations. Continue? [Y/N]:"
        )
        output += net_connect.send_command_timing("Y")
        print(output)


def display_routing_table(device):
    with ConnectHandler(**device) as net_connect:
        output = net_connect.send_command("display ip routing-table")
        print(output)


def configure_router3():
    with ConnectHandler(**router3) as net_connect:
        net_connect.find_prompt()
        print("------------------ Configuring Router 3 ------------------")
        output = net_connect.send_config_from_file(str(config_dir / "router3.txt"))
        print(output)


def configure_router4():
    with ConnectHandler(**router4) as net_connect:
        net_connect.find_prompt()
        print("------------------ Configuring Router 4 ------------------")
        output = net_connect.send_config_from_file(str(config_dir / "router4.txt"))
        print(output)


if __name__ == "__main__":
    # clear_route_static(router3)
    # clear_route_static(router4)
    configure_router3()
    configure_router4()
