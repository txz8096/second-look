#!/usr/bin/env python3
"""Find a claude.ai, ChatGPT or Gemini data export and file it where reviews read it.

Usage: python3 add_export.py [PATH] [--app claude|chatgpt|gemini] [--days 60]

With PATH (a zip, a .json file or an unzipped folder, for example one dragged into the chat),
it reads that. Without it, it looks in ~/Downloads and ~/Desktop for exports from the last
--days days. It decides which app an export came from by what's inside, not by its name,
keeps the newest one per app, and copies the one file reviews need to
~/.second-look/exports/<app>/. The copy keeps the download's date, so reminders about old
exports stay right. Nothing else in the zip is unpacked.
"""
import argparse, datetime as dt, json, os, sys, zipfile

HOME = os.path.expanduser("~")
EXPORTS = os.path.join(HOME, ".second-look", "exports")
APPS = {"claude": ("claude.ai", "conversations.json"), "chatgpt": ("ChatGPT", "conversations.json"),
        "gemini": ("Gemini", "MyActivity.json")}
HOW = {"claude": "claude.ai: Settings > Privacy > Export data",
       "chatgpt": "ChatGPT: Settings > Data controls > Export data",
       "gemini": "Gemini: takeout.google.com > My Activity > Gemini Apps only, format JSON"}
HEAD = 256 * 1024


def kind(name, head):
    """Which app a JSON file belongs to, from its path and first bytes, or None."""
    name = name.replace("\\", "/")
    base = os.path.basename(name)
    if base == "MyActivity.json" and ("Gemini Apps/" in name or b'"Gemini Apps"' in head):
        return "gemini"
    if base.startswith("conversations") and base.endswith(".json"):
        if b'"chat_messages"' in head:
            return "claude"
        if b'"mapping"' in head:
            return "chatgpt"
    return None


def gemini_html(name):
    return name.replace("\\", "/").endswith("Gemini Apps/MyActivity.html")


def scan_zip(path):
    found, notes = [], []
    try:
        with zipfile.ZipFile(path) as z:
            for info in z.infolist():
                if gemini_html(info.filename):
                    notes.append(f"{path}: Gemini activity is in HTML. Export again with format JSON.")
                if not info.filename.endswith(".json"):
                    continue
                with z.open(info) as f:
                    k = kind(info.filename, f.read(HEAD))
                if k:
                    found.append((k, path, info.filename))
    except (zipfile.BadZipFile, OSError):
        pass
    return found, notes


def scan_file(path):
    try:
        with open(path, "rb") as f:
            k = kind(path, f.read(HEAD))
    except OSError:
        return []
    return [(k, path, None)] if k else []


def scan_dir(path, depth=5):
    found, notes = [], []
    root_depth = path.rstrip("/").count("/")
    for d, subdirs, files in os.walk(path):
        if d.count("/") - root_depth >= depth:
            subdirs[:] = []
        for name in files:
            full = os.path.join(d, name)
            if gemini_html(full):
                notes.append(f"{full}: Gemini activity is in HTML. Export again with format JSON.")
            elif name.endswith(".json"):
                found += scan_file(full)
    return found, notes


def scan(path):
    if os.path.isdir(path):
        return scan_dir(path)
    if zipfile.is_zipfile(path):
        return scan_zip(path)
    return scan_file(path), []


def candidates(days):
    """Recent zips, JSON files and unzipped Takeout folders in Downloads and Desktop."""
    cutoff = dt.datetime.now().timestamp() - days * 86400
    out = []
    for folder in ("Downloads", "Desktop"):
        root = os.path.join(HOME, folder)
        try:
            names = os.listdir(root)
        except OSError:
            continue
        for name in names:
            path = os.path.join(root, name)
            try:
                if os.path.getmtime(path) < cutoff:
                    continue
            except OSError:
                continue
            lower = name.lower()
            if lower.endswith((".zip", ".json")) or (os.path.isdir(path) and lower.startswith("takeout")):
                out.append(path)
    return out


def read_member(source, member):
    if member is None:
        with open(source, "rb") as f:
            return f.read()
    with zipfile.ZipFile(source) as z:
        return z.read(member)


def load_all(app, items):
    """Parse and merge every file for one app from one source (ChatGPT may split conversations)."""
    merged = []
    for _, source, member in items:
        data = json.loads(read_member(source, member))
        if not isinstance(data, list):
            raise ValueError("expected a list of records")
        merged += data
    return merged


def summarize(app, records):
    stamps = []
    if app == "gemini":
        records = [r for r in records if isinstance(r, dict) and str(r.get("title", "")).startswith("Prompted ")]
        unit = "prompts"
        for r in records:
            try:
                stamps.append(dt.datetime.fromisoformat(str(r.get("time")).replace("Z", "+00:00")).date())
            except ValueError:
                pass
    else:
        unit = "chats"
        for r in records:
            v = r.get("created_at") if app == "claude" else r.get("create_time")
            try:
                d = (dt.datetime.fromtimestamp(v) if isinstance(v, (int, float))
                     else dt.datetime.fromisoformat(str(v).replace("Z", "+00:00")))
                stamps.append(d.date())
            except (ValueError, TypeError, OSError):
                pass
    span = f", {min(stamps):%b %Y} to {max(stamps):%b %Y}" if stamps else ""
    return f"{len(records):,} {unit}{span}"


def add(app, items, force):
    label, filename = APPS[app]
    source = items[0][1]
    when = os.path.getmtime(source)
    dest = os.path.join(EXPORTS, app, filename)
    if not force and os.path.exists(dest) and os.path.getmtime(dest) >= when:
        return f"{label}: already added. The export you have is as new as {os.path.basename(source)}."
    try:
        records = load_all(app, items)
    except (ValueError, OSError, zipfile.BadZipFile) as ex:
        return f"{label}: couldn't read {source} ({ex}). Download the export again."
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    tmp = dest + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(records, f)
    os.utime(tmp, (when, when))
    os.replace(tmp, dest)
    return f"{label}: added {summarize(app, records)} from {source}."


def main():
    ap = argparse.ArgumentParser(description="File a claude.ai, ChatGPT or Gemini export for reviews.")
    ap.add_argument("path", nargs="?", help="a zip, .json file or folder; default: search Downloads and Desktop")
    ap.add_argument("--app", choices=sorted(APPS), help="only add this app's export")
    ap.add_argument("--days", type=int, default=60, help="without PATH: how far back to look")
    ap.add_argument("--force", action="store_true", help="replace an export even if it's newer")
    a = ap.parse_args()

    paths = [os.path.abspath(os.path.expanduser(a.path))] if a.path else candidates(a.days)
    if a.path and not os.path.exists(paths[0]):
        sys.exit(f"{paths[0]} doesn't exist")
    found, notes = [], []
    for p in paths:
        f, n = scan(p)
        found += f
        notes += n

    # newest source per app; keep every file from that source (split ChatGPT exports)
    by_app = {}
    for k, source, member in found:
        if a.app and k != a.app:
            continue
        best = by_app.get(k)
        if not best or os.path.getmtime(source) > os.path.getmtime(best[0][1]):
            by_app[k] = [(k, source, member)]
        elif best[0][1] == source:
            best.append((k, source, member))

    for app in sorted(by_app):
        print(add(app, by_app[app], a.force))
    for n in notes:
        print(n)
    if not by_app:
        where = a.path or f"Downloads or Desktop from the last {a.days} days"
        wanted = [a.app] if a.app else sorted(APPS)
        print(f"No export found in {where}. To get one:")
        for app in wanted:
            print("  " + HOW[app])
        sys.exit(1)


if __name__ == "__main__":
    main()
