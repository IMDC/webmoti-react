#!/usr/bin/env python3

import configparser
import hashlib
import logging
import os
import subprocess
import textwrap
import time
from pathlib import Path

# imdc1 or imdc2
USERNAME = "imdc1"
# usb must be named "Webmoti"
USB_PATH = Path(f"/media/{USERNAME}/Webmoti")


CONFIG_NAME = "wifi.ini"
CONFIG_SECTION = "WIFI"
WPA_PATH = Path("/etc/wpa_supplicant/wpa_supplicant.conf")
# SECURE: WPA-EAP + PEAP
# REGULAR: WPA-PSK
# OPEN: No password
# CUSTOM: From file
TYPES = ["SECURE", "REGULAR", "OPEN", "CUSTOM"]


def md4_hash(input_str):
    h = hashlib.new("md4")
    h.update(input_str.encode("utf-16le"))
    return h.hexdigest()


def get_peap_config(ssid, username, password):
    config = f"""
                network={{
                    ssid="{ssid}"
                    priority=1
                    proto=RSN
                    key_mgmt=WPA-EAP
                    pairwise=CCMP
                    auth_alg=OPEN
                    eap=PEAP
                    identity="{username}"
                    password=hash:{md4_hash(password)}
                    phase1="peaplabel=0"
                    phase2="auth=MSCHAPV2"
                    }}
    """
    return textwrap.dedent(config)


def get_psk_config(ssid, password):
    config = f"""
                network={{
                    ssid="{ssid}"
                    psk="{password}"
                    key_mgmt=WPA-PSK
                }}
    """
    return textwrap.dedent(config)


def get_open_config(ssid):
    config = f"""
                network={{
                    ssid="{ssid}"
                    key_mgmt=NONE
                }}
    """
    return textwrap.dedent(config)


def validate_config(lines):
    # empty list means any value is allowed
    valid_keys = {
        "ssid": {"type": str, "values": []},
        "psk": {"type": str, "values": []},
        "key_mgmt": {
            "type": str,
            "values": ["NONE", "WPA-PSK", "WPA-EAP", "IEEE8021X", "WPA-NONE"],
        },
        "proto": {"type": str, "values": ["WPA", "RSN", "WPA RSN"]},
        "pairwise": {"type": str, "values": ["CCMP", "TKIP", "GTK_NOT_USED"]},
        "group": {"type": str, "values": ["CCMP", "TKIP", "WEP40", "WEP104"]},
        "priority": {"type": int, "values": []},
        "scan_ssid": {"type": int, "values": [1, 0]},
        "eap": {
            "type": str,
            "values": [
                "PEAP",
                "TLS",
                "TTLS",
                "PWD",
                "SIM",
                "AKA",
                "AKA'",
                "FAST",
                "LEAP",
            ],
        },
        "identity": {"type": str, "values": []},
        "anonymous_identity": {"type": str, "values": []},
        "password": {"type": str, "values": []},
        "ca_cert": {"type": str, "values": []},
        "client_cert": {"type": str, "values": []},
        "private_key": {"type": str, "values": []},
        "private_key_passwd": {"type": str, "values": []},
        "phase1": {"type": str, "values": []},
        "phase2": {"type": str, "values": []},
        "bssid": {"type": str, "values": []},
        "disabled": {"type": int, "values": [0, 1]},
        "mode": {"type": int, "values": [0, 1, 2]},
        "frequency": {"type": int, "values": []},
        "proactive_key_caching": {"type": int, "values": [0, 1]},
        "wep_key0": {"type": str, "values": []},
        "wep_key1": {"type": str, "values": []},
        "wep_key2": {"type": str, "values": []},
        "wep_key3": {"type": str, "values": []},
        "wep_tx_keyidx": {"type": int, "values": [0, 1, 2, 3]},
        "auth_alg": {
            "type": str,
            "values": ["OPEN", "SHARED", "LEAP"],
        },
    }

    config = ""

    if lines[0].strip() != "network={":
        stop("Invalid config start")
    config += lines[0]
    del lines[0]

    if lines[-1].strip() != "}":
        stop("Invalid config end")
    del lines[-1]

    for line in lines:
        # only split on first =
        try:
            key, value = line.strip().split("=", maxsplit=1)
        except Exception as e:
            stop(f"Error while reading config line {line}: {e}")
        key = key.strip()
        # remove quotes around values
        value = value.strip().strip('"')

        if key not in valid_keys:
            stop(f"Invalid key found: {key}")

        if not value:
            stop(f"Value is empty for key: {key}")

        expected_type = valid_keys[key]["type"]
        try:
            if expected_type == int:
                value = int(value)
            elif expected_type == str:
                value = str(value)
        except ValueError:
            stop(
                f"Wrong type for key {key}: expected {expected_type}, got {type(value)}"
            )

        # if value can't be anything and is invalid
        if valid_keys[key]["values"] and value not in valid_keys[key]["values"]:
            stop(f"Invalid value for key {key}: {value}")

        # add line after validating
        config += line

    config += "}"
    return config


def get_custom_config(filename):
    path = USB_PATH / filename

    if not path.is_file():
        stop("Wifi config file not found")

    lines = []
    try:
        with path.open("r") as f:
            lines = f.readlines()
    except Exception as e:
        stop(f"Error reading custom config file: {e}")

    config = validate_config(lines)

    return config


def stop(msg):
    logging.error(f"{msg}")
    eject_usb()
    exit(2)


def get_value(config, key):
    value = config.get(CONFIG_SECTION, key, fallback=None)
    if value is None:
        return None

    # allow for empty/none values in config file
    if value.upper() in ("", "NONE"):
        return None
    return value


def write_config(config_path):
    logging.info("Reading wifi config file")
    config = configparser.ConfigParser()
    config.read(config_path)

    wifi_type = get_value(config, "type")
    logging.info(f"Wifi type: {wifi_type}")
    if wifi_type is None:
        stop("Wifi type not found")

    # wifi type is case insensitive
    wifi_type = wifi_type.upper()

    wifi_ssid = get_value(config, "name")
    logging.info(f"Wifi name: {wifi_ssid}")
    if wifi_ssid is None:
        stop("Wifi name not found")

    wifi_username = get_value(config, "username")
    logging.info(f"Wifi username: {wifi_username}")

    wifi_password = get_value(config, "password")
    logging.info(f"Wifi password: {'*' * len(wifi_password)}")

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
    elif wifi_type == "OPEN":
        config_str = get_open_config(wifi_ssid)
    elif wifi_type == "CUSTOM":
        wifi_config_name = get_value(config, "filename")
        logging.info(f"Wifi custom config: {wifi_config_name}")
        if wifi_config_name is None:
            stop("Custom config filename not found")
    else:
        stop("Invalid wifi type")

        config_str = get_custom_config(wifi_config_name)

    wpa_conf_path = Path(WPA_PATH)
    if not wpa_conf_path.is_file():
        stop("wpa_supplicant.conf not found")

    logging.info("Writing to wpa_supplicant.conf")

    with wpa_conf_path.open("a+") as f:
        # check if config already in wpa_supplicant.conf
        f.seek(0)
        contents = f.read()
        if config_str in contents:
            logging.info("Config is already in wpa_supplicant.conf")
            # don't write config, but still continue to restart wifi
            return

        # write config_str to wpa_supplicant.conf with empty line before
        f.write("\n")
        f.write(config_str)

    logging.info("Successfully added wifi network")


def poll(interval, timeout, poll_func, fail_msg, poll_msg, is_silent=False):
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            success = poll_func()
            if success:
                return True
        except Exception as e:
            if not is_silent:
                stop(f"Error: {e}")

        if not is_silent:
            logging.info(poll_msg)
        time.sleep(interval)

    if not is_silent:
        logging.error(fail_msg)
        stop(f"{timeout} seconds passed, exiting now")

    return False


def connect_to_wifi():
    # restart wpa_supplicant so rasp pi connects to the new network
    try:
        # close old wpa_supplicant
        # if wpa_supplicant isn't running, this has a non 0 exit code, so check=False
        subprocess.run(["sudo", "killall", "-q", "wpa_supplicant"])

        def check_wpa():
            response = subprocess.run(["pgrep", "-x", "wpa_supplicant"])
            # pgrep returns 0 if found process
            return response.returncode != 0

        WPA_INTERVAL = 2.5
        WPA_TIMEOUT = 15
        poll_msg = "Restarting wpa_supplicant..."
        fail_msg = "Couldn't stop old wpa_supplicant process"

        # allow previous wpa_supplicant time to exit gracefully
        poll(WPA_INTERVAL, WPA_TIMEOUT, check_wpa, fail_msg, poll_msg)

        # run wpa_supplicant in background
        subprocess.run(
            [
                "sudo",
                "wpa_supplicant",
                "-B",
                "-i",
                "wlan0",
                "-c",
                "/etc/wpa_supplicant/wpa_supplicant.conf",
                "-D",
                "nl80211",
            ],
            check=True,
        )
    except subprocess.CalledProcessError as e:
        stop(f"Failed to restart wpa_supplicant: {e}")

    logging.info("Restarted wpa_supplicant")

    def check_wifi():
        # check google's server
        response = subprocess.run(["ping", "-c", "1", "google.com"])
        return response.returncode == 0

    # keep checking until wifi connects or timeout
    CONNECTION_TIMEOUT = 30
    CHECK_INTERVAL = 2.5
    poll_msg = "Connecting..."
    fail_msg = "Couldn't connect to wifi"
    poll(CHECK_INTERVAL, CONNECTION_TIMEOUT, check_wifi, fail_msg, poll_msg)

    logging.info("Connected to wifi")


def eject_usb():
    logging.info(f"Ejecting {USB_PATH}...")

    # check if in desktop mode (can eject manually in desktop mode)
    try:
        # check for hdmi connection
        output = subprocess.check_output(["kmsprint"], text=True)
        if "HDMI" in output and "(connected)" in output:
            logging.info("HDMI connection detected, not ejecting USB\n")
            return
    except subprocess.CalledProcessError as e:
        # if error, still try to eject usb
        logging.error(f"Error running kmsprint: {e}")

    try:
        subprocess.run(["sync"])
        # -l makes it try to unmount as soon as not busy
        subprocess.run(["umount", "-l", str(USB_PATH)], check=True)
        logging.info("Successfully ejected usb\n")
    except subprocess.CalledProcessError as e:
        logging.error(f"Failed to eject the usb: {e}\n")


def main():
    def check_usb():
        return USB_PATH.is_dir()

    # wait for usb to mount for 20 seconds
    USB_INTERVAL = 2.5
    USB_TIMEOUT = 20
    success = poll(USB_INTERVAL, USB_TIMEOUT, check_usb, "", "", is_silent=True)

    if not success:
        print("Webmoti USB not found")
        exit(3)

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

    logging.info("Found USB drive")

    try:
        # make sure root access
        if os.geteuid() != 0:
            stop("Couldn't write to file, script doesn't have root")

        config_path = USB_PATH / CONFIG_NAME
        if not config_path.is_file():
            stop("Wifi config not found")
        logging.info("Found wifi config file")

        write_config(config_path)

        connect_to_wifi()

    except Exception as e:
        logging.exception("Error in main")
        stop(f"Unknown error: {e}")

    eject_usb()


if __name__ == "__main__":
    main()
