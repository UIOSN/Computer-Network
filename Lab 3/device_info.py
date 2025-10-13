from datetime import datetime

switch1 = {"device_type": "huawei", "host": "172.16.2.201", "username": "user", "password": "b402b402"}
switch2 = {"device_type": "huawei", "host": "172.16.2.202", "username": "user", "password": "b402b402"}
router1 = {"device_type": "huawei", "host": "172.16.2.203", "username": "user", "password": "b402b402", "session_log": f"router1_{datetime.now().strftime("%Y%m%d-%H%M%S")}.log"}
router2 = {"device_type": "huawei", "host": "172.16.2.204", "username": "user", "password": "b402b402", "session_log": f"router2_{datetime.now().strftime("%Y%m%d-%H%M%S")}.log"}
