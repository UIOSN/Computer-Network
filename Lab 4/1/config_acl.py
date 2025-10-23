from huawei.device import HuaweiRouter
from huawei.device_info import router2
from pathlib import Path

if __name__ == "__main__":
    script_dir = Path(__file__).parent
    log_directory = script_dir / "logs"
    config_router2 = script_dir / "acl.txt"

    with HuaweiRouter(router2, log_dir=log_directory) as R2:
        R2.configure(config_router2)
