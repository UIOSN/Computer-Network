from huawei.device import HuaweiRouter
from huawei.device_info import router1, router2

if __name__ == "__main__":
    log_directory = "logs"
    config_file_path = "huawei_config.txt"

    with HuaweiRouter(router1, log_dir=log_directory) as router:
        router.display_routing_table()
        router.clear_route_static()
        router.display_routing_table()
        router.configure(config_file_path)
