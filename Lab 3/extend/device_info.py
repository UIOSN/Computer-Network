from pathlib import Path
from datetime import datetime

log_dir = Path(__file__).resolve().parent / "log"
log_dir.mkdir(parents=True, exist_ok=True)

switch1 = {"device_type": "huawei", "host": "172.16.2.201", "username": "user", "password": "b402b402"}
switch2 = {"device_type": "huawei", "host": "172.16.2.202", "username": "user", "password": "b402b402"}
router1 = {"device_type": "huawei", "host": "172.16.2.203", "username": "user", "password": "b402b402", "session_log": str(log_dir / f"router1_{datetime.now().strftime('%Y%m%d-%H%M%S')}.log")}
router2 = {"device_type": "huawei", "host": "172.16.2.204", "username": "user", "password": "b402b402", "session_log": str(log_dir / f"router2_{datetime.now().strftime('%Y%m%d-%H%M%S')}.log")}
router3 = {"device_type": "huawei", "host": "172.16.4.203", "username": "user", "password": "b402b402", "session_log": str(log_dir / f"router3_{datetime.now().strftime('%Y%m%d-%H%M%S')}.log")}
router4 = {"device_type": "huawei", "host": "172.16.4.204", "username": "user", "password": "b402b402", "session_log": str(log_dir / f"router4_{datetime.now().strftime('%Y%m%d-%H%M%S')}.log")}
