from huawei.device_info import switch1, switch2
from huawei.device import HuaweiSwitch
from pathlib import Path

if __name__ == "__main__":
    script_dir = Path(__file__).parent
    log_dir = script_dir / "log"
    config_switch1 = script_dir / "switch1.txt"
    config_switch2 = script_dir / "switch2.txt"

    with HuaweiSwitch(switch1, log_dir=log_dir) as S1:
        S1.configure(config_switch1)

    with HuaweiSwitch(switch2, log_dir=log_dir) as S2:
        S2.configure(config_switch2)
