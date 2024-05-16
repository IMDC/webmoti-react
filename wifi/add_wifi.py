import configparser
import hashlib
import logging
import os
from pathlib import Path

CONFIG_NAME = "wifi.ini"
CONFIG_SECTION = "WIFI"
WPA_PATH = Path("/etc/wpa_supplicant/wpa_supplicant.conf")
USB_PATH = Path("D:\\")
# SECURE: WPA-EAP + PEAP
# REGULAR: WPA-PSK
# OPEN: No password
TYPES = ["SECURE", "REGULAR", "OPEN"]


def md4_hash(input_str):
    h = hashlib.new("md4")
    h.update(input_str.encode())
    return h.hexdigest()


def get_peap_config(ssid, username, password):
    return f"""
        network={{
            ssid="{ssid}"
            priority=1
            proto=RSN
            key_mgmt=WPA-EAP
            pairwise=CCMP
            auth_alg=OPEN
            eap=PEAP
            identity={username}
            password=hash:{md4_hash(password)}
            phase1="peaplabel=0"
            phase2="auth=MSCHAPV2"
            }}
    """


def get_psk_config(ssid, password):
    return f"""
        network={{
            ssid="{ssid}"
            psk="{password}"
            key_mgmt=WPA-PSK
        }}
    """


def get_open_config(ssid):
    return f"""
        network={{
            ssid="{ssid}"
            key_mgmt=NONE
        }}
    """


def stop(msg):
    logging.error(f"{msg}\n")
    exit(1)


def get_value(config, key):
    value = config.get(CONFIG_SECTION, key, fallback=None).upper()
    # allow for empty/none values in config file
    if value in ("", "NONE"):
        return None
    return value


def write_config(config_path):
    logging.info("Reading wifi config file")
    config = configparser.ConfigParser()
    config.read(config_path)

    wifi_type = get_value(config, "type")
    logging.info(f"Wifi type: {wifi_type}")
    if wifi_type not in TYPES:
        stop("Invalid wifi type")

    wifi_ssid = get_value(config, "name")
    logging.info(f"Wifi name: {wifi_ssid}")
    if wifi_ssid is None:
        stop("Wifi name not found")

    wifi_username = get_value(config, "username")
    logging.info(f"Wifi username: {wifi_username}")

    wifi_password = get_value(config, "password")
    logging.info(f"Wifi password: {wifi_password}")

    config_str = ""
    if wifi_type == "SECURE":
        if wifi_username is None:
            stop("Wifi username not found")
        if wifi_password is None:
            stop("Wifi password not found")

        config_str = get_peap_config(wifi_ssid, wifi_username, wifi_password)
    elif wifi_type == "REGULAR":
        if wifi_password is None:
            stop("Wifi password not found")

        config_str = get_psk_config(wifi_ssid, wifi_password)
    else:
        config_str = get_open_config(wifi_ssid)

    wpa_conf_path = Path(WPA_PATH)
    if not wpa_conf_path.is_file():
        stop("wpa_supplicant.conf not found")

    # write config_str to wpa_supplicant.conf
    with wpa_conf_path.open("a") as f:
        f.write(config_str)


def main():
    if not USB_PATH.is_dir():
        stop("USB not found")
    logging.info("Found USB drive")

    # setup logging (logs are saved on usb key)
    log_format = "%(asctime)s - %(levelname)s - %(message)s"
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        filename=USB_PATH / "wifi_debug.log",
        filemode="a",
    )

    # also allow it to log to console
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(log_format))
    logging.getLogger().addHandler(console_handler)

    # make sure root access
    # if os.geteuid() != 0:
    #     stop("Couldn't write to file, script doesn't have root")

    config_path = USB_PATH / CONFIG_NAME
    if not config_path.is_file():
        stop("Wifi config not found")
    logging.info("Found wifi config file")

    write_config(config_path)


if __name__ == "__main__":
    main()
