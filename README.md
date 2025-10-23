# Computer-Network
计网实验

## 路由器配置包安装及使用

使用以下命令安装路由器配置包：

```bash
cd Computer-Network
pip install -e .
```

使用示例：

```python
from huawei.device import HuaweiRouter
from huawei.device_info import router1, router2
from pathlib import Path

if __name__ == "__main__":
    script_dir = Path(__file__).parent
    log_directory = script_dir / "logs"
    config_file_path = script_dir / "huawei_config.txt"

    with HuaweiRouter(router1, log_dir=log_directory) as router:
        router.display_routing_table()
        router.clear_route_static()
        router.display_routing_table()
        router.configure(config_file_path)
```

## lab2 编译命令

基础实验

```bash
gcc .\UDPsender.c -o .\UDPsender.exe -lws2_32
gcc .\UDPreceiver.c -o .\UDPreceiver.exe -lws2_32
```