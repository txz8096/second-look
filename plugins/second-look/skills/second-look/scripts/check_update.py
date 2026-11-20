"""Check the installed skill against its public distribution channel."""
import argparse
import json
from pathlib import Path
from urllib.parse import quote
from urllib.request import urlopen

REPO = "txz8096/second-look"
SKILL = "plugins/second-look/skills/second-look"
ROOT = Path(__file__).resolve().parents[1]


def fetch(url):
    with urlopen(url, timeout=5) as response:
        return json.load(response)


def check(channel):
    installed = json.loads((ROOT / "revision.json").read_text())["revision"]
    ref = "main"
    if channel == "release":
        release = fetch(f"https://api.github.com/repos/{REPO}/releases/latest")
        if not any(a["name"] == "second-look.zip" for a in release["assets"]):
            return {"status": "unavailable"}
        ref = release["tag_name"]
    latest = fetch(f"https://raw.githubusercontent.com/{REPO}/{quote(ref, safe='')}/{SKILL}/revision.json")
    if type(latest["revision"]) is not int or type(installed) is not int:
        raise ValueError("Invalid revision")
    if latest["revision"] > installed:
        return {"status": "available", "revision": latest["revision"], "benefit": latest["benefit"]}
    return {"status": "current"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("channel", choices=("main", "release"))
    args = parser.parse_args()
    try:
        result = check(args.channel)
    except (OSError, ValueError, KeyError, TypeError):
        result = {"status": "unavailable"}
    print(json.dumps(result))
