from netmiko import ConnectHandler
from datetime import datetime
from pathlib import Path


class HuaweiRouter:
    def __init__(self, device: dict, log_dir: str | Path = None):
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
                log_file = self.log_dir / f"{self.name}_{timestamp}.log"
            self._net_connect = ConnectHandler(device_type=self.device_type, host=self.host, username=self.username, password=self.password, session_log=log_file)
            print(f"[INFO] Connected to {self.name} ({self.host})")
            return self
        except Exception as e:
            raise ConnectionError(f"Failed to connect to {self.name} ({self.host}): {e}")

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._net_connect:
            self._net_connect.disconnect()
            print(f"[INFO] Disconnected from {self.name} ({self.host})")

    def reboot(self):
        if not self._net_connect:
            raise RuntimeError("Not connected to the device. Use 'with' statement to manage connection.")
        output = self._net_connect.send_command("reboot fast", expect_string="System will reboot! Continue \\? \\[y/n\\]:")
        output += self._net_connect.send_command_timing("y")
        print(output)

    def clear_route_static(self):
        if not self._net_connect:
            raise RuntimeError("Not connected to the device. Use 'with' statement to manage connection.")
        self._net_connect.config_mode()
        output = self._net_connect.send_command(
            "undo ip route-static all", expect_string="Warning: This operation may lead to the deletion of all the public IPv4 static routes and their configurations. Continue\\? \\[Y/N\\]:"
        )
        output += self._net_connect.send_command_timing("Y")
        print(output)

    def display_routing_table(self):
        if not self._net_connect:
            raise RuntimeError("Not connected to the device. Use 'with' statement to manage connection.")
        output = self._net_connect.send_command("display ip routing-table")
        print(output)

    def configure(self, config_file: str | Path):
        if not self._net_connect:
            raise RuntimeError("Not connected to the device. Use 'with' statement to manage connection.")
        print(f"[INFO] Applying configuration from {config_file} to {self.name} ({self.host})")
        output = self._net_connect.send_config_from_file(config_file)
        print(output)
