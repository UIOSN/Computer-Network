from huawei.device import HuaweiRouter
from huawei.device_info import router1, router2
from pathlib import Path

if __name__ == "__main__":
    script_dir = Path(__file__).parent
    log_directory = script_dir / "logs"
    config_router1 = script_dir / "router1.txt"
    config_router2 = script_dir / "router2.txt"

    with HuaweiRouter(router1, log_dir=log_directory) as R1:
        R1.configure(config_router1)
        R1.display_routing_table()

    with HuaweiRouter(router2, log_dir=log_directory) as R2:
        R2.configure(config_router2)
        R2.display_routing_table()
