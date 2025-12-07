from netmiko import ConnectHandler
from rich import print as rprint
from datetime import datetime
from pathlib import Path
from typing import TypedDict


class Device(TypedDict):
    alias: str
    device_type: str
    host: str
    username: str
    password: str


class HuaweiRouter:
    def __init__(self, device: Device, log_dir: str | Path = None):
        self.device_type = device["device_type"]
        self.host = device["host"]
        self.username = device["username"]
        self.password = device["password"]
        self.name = device["alias"]
        self.log_dir = Path(log_dir) if log_dir else None
        if self.log_dir:
            self.log_dir.mkdir(parents=True, exist_ok=True)
        self._net_connect = None

    def __enter__(self):
        try:
            log_file = None
            if self.log_dir:
                timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
                log_file = str(self.log_dir / f"{self.name}_{timestamp}.log")
            rprint(f"[green][INFO] Log file: {log_file}[/green]")
            self._net_connect = ConnectHandler(device_type=self.device_type, host=self.host, username=self.username, password=self.password, session_log=log_file)
            rprint(f"[green][INFO] Connected to {self.name} ({self.host})[/green]")
            return self
        except Exception as e:
            rprint(f"[red][ERROR] Failed to connect to {self.name} ({self.host}): {e}[/red]")
            raise ConnectionError(f"Failed to connect to {self.name} ({self.host}): {e}")

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._net_connect:
            self._net_connect.disconnect()
            rprint(f"[green][INFO] Disconnected from {self.name} ({self.host})[/green]")

    def reboot(self):
        if not self._net_connect:
            rprint(f"[red][ERROR] Not connected to {self.name} ({self.host})[/red]")
            raise RuntimeError("Not connected to the device. Use 'with' statement to manage connection.")
        output = self._net_connect.send_command("reboot fast", expect_string=r"\[[yY]/[nN]\]:")
        output += self._net_connect.send_command_timing("y")
        print(output)

    def clear_route_static(self):
        if not self._net_connect:
            rprint(f"[red][ERROR] Not connected to {self.name} ({self.host})[/red]")
            raise RuntimeError("Not connected to the device. Use 'with' statement to manage connection.")
        self._net_connect.config_mode()
        output = self._net_connect.send_command("undo ip route-static all", expect_string=r"\[[yY]/[nN]\]:")
        output += self._net_connect.send_command_timing("Y")
        print(output)

    def display_routing_table(self):
        if not self._net_connect:
            rprint(f"[red][ERROR] Not connected to {self.name} ({self.host})[/red]")
            raise RuntimeError("Not connected to the device. Use 'with' statement to manage connection.")
        output = self._net_connect.send_command("display ip routing-table")
        print(output)

    def sysname(self, name: str):
        if not self._net_connect:
            rprint(f"[red][ERROR] Not connected to {self.name} ({self.host})[/red]")
            raise RuntimeError("Not connected to the device. Use 'with' statement to manage connection.")
        self._net_connect.send_config_set([f"sysname {name}"])
        self._net_connect.set_base_prompt()
        rprint(f"[green]Hostname changed to {name}[/green]")

    def configure(self, config_file: str | Path):
        if not self._net_connect:
            rprint(f"[red][ERROR] Not connected to {self.name} ({self.host})[/red]")
            raise RuntimeError("Not connected to the device. Use 'with' statement to manage connection.")
        output = self._net_connect.send_config_from_file(config_file)
        print(output)

    def send_commands(self, command: str | list[str]):
        if not self._net_connect:
            rprint(f"[red][ERROR] Not connected to {self.name} ({self.host})[/red]")
            raise RuntimeError("Not connected to the device. Use 'with' statement to manage connection.")
        output = self._net_connect.send_config_set(command)
        print(output)

    def send_command_y(self, command: str):
        if not self._net_connect:
            rprint(f"[red][ERROR] Not connected to {self.name} ({self.host})[/red]")
            raise RuntimeError("Not connected to the device. Use 'with' statement to manage connection.")
        self._net_connect.config_mode()
        output = self._net_connect.send_command(command, expect_string=r"\[[yY]/[nN]\]")
        output += self._net_connect.send_command_timing("y")
        print(output)


class HuaweiSwitch:
    def __init__(self, device: Device, log_dir: str | Path = None):
        self.device_type = device["device_type"]
        self.host = device["host"]
        self.username = device["username"]
        self.password = device["password"]
        self.name = device["alias"]
        self.log_dir = Path(log_dir) if log_dir else None
        if self.log_dir:
            self.log_dir.mkdir(parents=True, exist_ok=True)
        self._net_connect = None

    def __enter__(self):
        try:
            log_file = None
            if self.log_dir:
                timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
                log_file = str(self.log_dir / f"{self.name}_{timestamp}.log")
            rprint(f"[green][INFO] Log file: {log_file}[/green]")
            self._net_connect = ConnectHandler(device_type=self.device_type, host=self.host, username=self.username, password=self.password, session_log=log_file)
            rprint(f"[green][INFO] Connected to {self.name} ({self.host})[/green]")
            return self
        except Exception as e:
            rprint(f"[red][ERROR] Failed to connect to {self.name} ({self.host}): {e}[/red]")
            raise ConnectionError(f"Failed to connect to {self.name} ({self.host}): {e}")

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._net_connect:
            self._net_connect.disconnect()
            rprint(f"[green][INFO] Disconnected from {self.name} ({self.host})[/green]")

    def configure(self, config_file: str | Path):
        if not self._net_connect:
            rprint(f"[red][ERROR] Not connected to {self.name} ({self.host})[/red]")
            raise RuntimeError("Not connected to the device. Use 'with' statement to manage connection.")
        output = self._net_connect.send_config_from_file(config_file)
        print(output)

    def sysname(self, name: str):
        if not self._net_connect:
            rprint(f"[red][ERROR] Not connected to {self.name} ({self.host})[/red]")
            raise RuntimeError("Not connected to the device. Use 'with' statement to manage connection.")
        self._net_connect.send_config_set([f"sysname {name}"])
        self._net_connect.set_base_prompt()
        rprint(f"[green]Hostname changed to {name}[/green]")

    def display_vlan(self, id: int):
        if not self._net_connect:
            rprint(f"[red][ERROR] Not connected to {self.name} ({self.host})[/red]")
            raise RuntimeError("Not connected to the device. Use 'with' statement to manage connection.")
        output = self._net_connect.send_command(f"display vlan {id}")
        print(output)

    def display_port_vlan(self):
        if not self._net_connect:
            rprint(f"[red][ERROR] Not connected to {self.name} ({self.host})[/red]")
            raise RuntimeError("Not connected to the device. Use 'with' statement to manage connection.")
        output = self._net_connect.send_command(f"display port vlan")
        print(output)

    def send_commands(self, command: str | list[str]):
        if not self._net_connect:
            rprint(f"[red][ERROR] Not connected to {self.name} ({self.host})[/red]")
            raise RuntimeError("Not connected to the device. Use 'with' statement to manage connection.")
        output = self._net_connect.send_config_set(command)
        print(output)

    def send_command_y(self, command: str):
        if not self._net_connect:
            rprint(f"[red][ERROR] Not connected to {self.name} ({self.host})[/red]")
            raise RuntimeError("Not connected to the device. Use 'with' statement to manage connection.")
        self._net_connect.config_mode()
        output = self._net_connect.send_command(command, expect_string=r"\[[yY]/[nN]\]")
        output += self._net_connect.send_command_timing("y")
        print(output)
