"""Persistent, prompt-free per-session metrics with conservative legacy migration."""
from collections import defaultdict
import json
from pathlib import Path
from projects import atomic_json, digest


def aggregate(rows):
    grouped = {}
    for row in rows:
        key = (row["week"], row["source"], row["category"], row.get("project", ""))
        if key not in grouped:
            grouped[key] = {k: row[k] for k in ("week", "source", "category")}
            grouped[key]["project"] = key[-1]
        target = grouped[key]
        for field, value in row.items():
            if isinstance(value, (int, float)):
                target[field] = target.get(field, 0) + value
        if "days" in row:
            target.setdefault("days", []).extend(row["days"])
    for row in grouped.values():
        if "days" in row:
            days = {}
            for item in row["days"]:
                day = days.setdefault(item["date"], {"date": item["date"]})
                for field, value in item.items():
                    if isinstance(value, (int, float)):
                        day[field] = day.get(field, 0) + value
            row["days"] = [days[d] for d in sorted(days)]
    return [grouped[k] for k in sorted(grouped)]


class HistoryStore:
    def __init__(self, path):
        self.path = path
        self.notes = []
        self.data = {"version": 2, "sessions": {}, "legacy": [], "cube": []}
        if Path(path).exists():
            old = json.loads(Path(path).read_text())
            if isinstance(old, dict) and old.get("version") == 2:
                if not isinstance(old.get("sessions"), dict) or not isinstance(old.get("legacy"), list):
                    raise ValueError("Invalid history.json; left unchanged")
                self.data = old
            elif isinstance(old, list) or isinstance(old, dict) and isinstance(old.get("cube"), list):
                self.data["legacy"] = old if isinstance(old, list) else old["cube"]
            else:
                raise ValueError("Unknown history.json format; left unchanged")

    def update(self, sessions, projects, cube_fn):
        for session in sessions:
            key = digest(session["source"] + ":" + session["session"])
            previous = self.data["sessions"].get(key)
            row = cube_fn([session])[0]
            if previous and previous["row"].get("prompts", 0) > row.get("prompts", 0):
                row = previous["row"]  # a truncated raw log must not erase a fuller saved session
            self.data["sessions"][key] = {"member": session.get("project_member") or (previous or {}).get("member", ""),
                "row": row}
        rows = []
        for record in self.data["sessions"].values():
            row = dict(record["row"])
            row["project"] = projects.project_for(record["member"])
            rows.append(row)
        fresh = aggregate(rows)
        # Legacy totals have no session IDs. Never pretend that a partial reread covers
        # the missing sessions. Retain that entire app/week until coverage is complete.
        legacy_groups, fresh_groups = defaultdict(list), defaultdict(list)
        for row in self.data["legacy"]:
            legacy_groups[(row["week"], row["source"])].append(row)
        for row in fresh:
            fresh_groups[(row["week"], row["source"])].append(row)
        retained = []
        for key, old in legacy_groups.items():
            new = fresh_groups.get(key, [])
            # Counts alone cannot prove identity. Only replace legacy rows when every
            # numeric total is reproduced; otherwise keep the original bucket intact.
            fields = {k for r in old for k, v in r.items() if isinstance(v, (int, float))}
            complete = new and all(abs(sum(r.get(k, 0) for r in old) - sum(r.get(k, 0) for r in new)) < 1e-6 for k in fields)
            if not complete:
                fresh_groups[key] = old
                retained.extend(old)
                self.notes.append({"week": key[0], "source": key[1], "reason": "Kept legacy totals: original session coverage could not be verified."})
        self.data["legacy"] = retained
        self.data["cube"] = sorted([r for group in fresh_groups.values() for r in group], key=lambda r: (r["week"], r["source"], r["category"], r.get("project", "")))
        return self.data["cube"]

    def save(self):
        atomic_json(self.path, self.data)
