#!/usr/bin/env python3
"""Local project identities and reversible grouping. No paths are persisted.

Usage: projects.py --state-dir ~/.second-look list
       projects.py --state-dir ~/.second-look merge TARGET_ID OTHER_ID...
       projects.py --state-dir ~/.second-look separate MEMBER_ID LABEL
       projects.py --state-dir ~/.second-look rename PROJECT_ID LABEL
       projects.py --state-dir ~/.second-look assign-folder APP FOLDER PROJECT_ID
"""
import argparse
import hashlib
import fcntl
import json
import os
from pathlib import Path
import re
import tempfile
import unicodedata


def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()[:24]


def normalize(name):
    return re.sub(r"[\s\-]+", " ", unicodedata.normalize("NFKC", name).strip().casefold())


def label(value):
    return re.sub(r"[\x00-\x1f/\\]", " ", str(value)).strip()[:120]


GENERATED_ID = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", re.I)


def generated_id(name):
    """Apps name per-document folders with random IDs (e.g. ~/.pencil/documents/<uuid>); nobody names a project that way."""
    return bool(GENERATED_ID.fullmatch(name or ""))


def in_generated_folder(path):
    return isinstance(path, str) and any(generated_id(part) for part in Path(os.path.realpath(path)).parts)


def lock_state(directory):
    directory = Path(directory)
    directory.mkdir(parents=True, exist_ok=True)
    lock = open(directory / ".state.lock", "a")
    fcntl.flock(lock, fcntl.LOCK_EX)
    return lock


def atomic_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=path.name + ".", dir=path.parent)
    try:
        with os.fdopen(fd, "w") as stream:
            json.dump(value, stream, ensure_ascii=False, indent=2)
            stream.write("\n")
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def folder_identity(cwd, roots=None, home=None):
    """Resolve recorded workspace metadata; generic/generated folders are not projects."""
    if not isinstance(cwd, str) or not os.path.isabs(cwd):
        return None
    home = os.path.realpath(home or os.path.expanduser("~"))
    cwd = os.path.realpath(cwd)
    generic = {home, os.path.dirname(home), "/", "/tmp", "/private/tmp", "/workspace"}
    generic.update(os.path.join(home, d) for d in ("Desktop", "Documents", "Downloads"))
    generated = bool(re.search(r"/(?:\.codex/(?:scratch|worktrees)|\.claude/(?:scratch|worktrees))/", cwd)) or (not cwd.startswith(home + os.sep) and bool(re.search(r"/(?:T/|tmp/|private/tmp/)", cwd))) or in_generated_folder(cwd)
    candidates = [os.path.realpath(r) for r in roots or [] if isinstance(r, str) and os.path.isabs(r)]
    candidates = [r for r in candidates if cwd == r or cwd.startswith(r + os.sep)]
    root = min(candidates, key=len) if candidates else cwd
    # A worktree's actual shared repository takes precedence over its generated location.
    folder = cwd
    while True:
        marker = os.path.join(folder, ".git")
        if os.path.isdir(marker):
            root = folder
            generated = False
            break
        if os.path.isfile(marker):
            try:
                raw = Path(marker).read_text().strip()
                if raw.startswith("gitdir: "):
                    gitdir = os.path.realpath(os.path.join(folder, raw[8:]))
                    common = Path(gitdir) / "commondir"
                    shared = os.path.realpath(os.path.join(gitdir, common.read_text().strip())) if common.is_file() else gitdir
                    if os.path.isdir(shared) and os.path.basename(shared) == ".git":
                        root = os.path.dirname(shared)
                        generated = False
                        break
            except OSError:
                pass
        parent = os.path.dirname(folder)
        if parent == folder:
            break
        folder = parent
    if root in generic or generated or not os.path.isdir(root):
        return None
    stat = os.stat(root)
    return {"name": label(os.path.basename(root)), "path_key": digest(root),
            "file_key": digest(f"{stat.st_dev}:{stat.st_ino}:{getattr(stat, 'st_birthtime', '')}")}


class ProjectStore:
    def __init__(self, path=None):
        self.path = path
        self.data = {"version": 1, "projects": {}, "members": {}, "paths": {}, "files": {}, "redirects": {}}
        if path and os.path.exists(path):
            data = json.loads(Path(path).read_text())
            if data.get("version") != 1 or any(not isinstance(data.get(k), dict) for k in self.data if k != "version"):
                raise ValueError("Invalid projects.json; left unchanged")
            self.data = data
        self.forget_generated()

    def forget_generated(self):
        """Drop ID-named folder projects saved before they were treated as generated, unless the user renamed or merged them."""
        def kept(member):
            project = self.data["projects"].get(self.project_for(member), {})
            return project.get("renamed") or not generated_id(project.get("label"))
        stale = {m for m, v in self.data["members"].items() if generated_id(v.get("name")) and not kept(m)}
        for member in stale:
            del self.data["members"][member]
        for table in ("paths", "files"):
            self.data[table] = {k: v for k, v in self.data[table].items() if v not in stale}
        used = {self.resolve(v["project"]) for v in self.data["members"].values()} | set(self.data["redirects"].values())
        for project, value in list(self.data["projects"].items()):
            if project not in used and project not in self.data["redirects"] and generated_id(value.get("label")) and not value.get("renamed"):
                del self.data["projects"][project]

    def resolve(self, project):
        seen = set()
        while project in self.data["redirects"]:
            if project in seen:
                raise ValueError("Project redirect cycle")
            seen.add(project)
            project = self.data["redirects"][project]
        return project

    def register(self, source, source_id, name):
        """Native adapters can use this only after verifying their source ID/name schema."""
        member = "member-" + digest(source + ":" + source_id)
        name = label(name)
        if not name:
            return ""
        existing = self.data["members"].get(member)
        if existing:
            existing["name"] = name
            project = self.data["projects"][self.resolve(existing["project"])]
            if not project.get("renamed"):
                project["label"] = name
            return member
        project = next((k for k, v in self.data["projects"].items() if k not in self.data["redirects"] and not v.get("separated") and normalize(v["label"]) == normalize(name)), self.resolve("project-" + digest(normalize(name))))
        self.data["projects"].setdefault(project, {"label": name})
        self.data["members"][member] = {"source": source, "name": name, "project": project}
        return member

    def folder(self, source, cwd, roots=None, home=None):
        if not isinstance(cwd, str) or not os.path.isabs(cwd):
            return ""
        path_key = source + ":" + digest(os.path.realpath(cwd))
        known = self.data["paths"].get(path_key)
        identity = folder_identity(cwd, roots, home)
        if not identity:
            # A deleted folder keeps its saved project; a generated one never had one.
            return "" if in_generated_folder(cwd) else known or ""
        file_key = source + ":" + identity["file_key"]
        root_key = source + ":" + identity["path_key"]
        member = known or self.data["paths"].get(root_key) or self.data["files"].get(file_key)
        if member:
            self.data["members"][member]["name"] = identity["name"]
            project = self.data["projects"][self.project_for(member)]
            if not project.get("renamed"):
                project["label"] = identity["name"]
        else:
            member = self.register(source, "folder:" + identity["path_key"], identity["name"])
        self.data["paths"][path_key] = self.data["paths"][root_key] = member
        self.data["files"][file_key] = member
        return member

    def project_for(self, member):
        return self.resolve(self.data["members"][member]["project"]) if member in self.data["members"] else ""

    def project_named(self, name):
        """The one project whose folders or label carry this name; rows saved before project IDs used names."""
        wanted = normalize(name)
        found = {self.project_for(m) for m, v in self.data["members"].items() if normalize(v.get("name", "")) == wanted}
        found |= {p for p, v in self.data["projects"].items() if p not in self.data["redirects"] and normalize(v.get("label", "")) == wanted}
        return found.pop() if len(found) == 1 else None

    def labels(self):
        return {k: v["label"] for k, v in self.data["projects"].items() if k not in self.data["redirects"]}

    def merge(self, target, others):
        target = self.resolve(target)
        if target not in self.data["projects"]:
            raise ValueError("Unknown target project")
        for other in others:
            other = self.resolve(other)
            if other not in self.data["projects"]:
                raise ValueError("Unknown project")
            if other != target:
                self.data["redirects"][other] = target

    def separate(self, member, name):
        if member not in self.data["members"]:
            raise ValueError("Unknown member")
        old = self.project_for(member)
        project = "project-" + digest("separate:" + member)
        self.data["redirects"].pop(project, None)
        self.data["projects"][project] = {"label": label(name), "renamed": True, "separated": True}
        self.data["members"][member]["project"] = project
        # Future saved-view support must clarify old references after a split.
        self.data["projects"][old]["split"] = True
        return project

    def save(self):
        if self.path:
            atomic_json(self.path, self.data)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--state-dir", required=True)
    parser.add_argument("action", choices=["list", "merge", "separate", "rename", "assign-folder"])
    parser.add_argument("values", nargs="*")
    args = parser.parse_args()
    state_lock = lock_state(os.path.expanduser(args.state_dir))
    store = ProjectStore(os.path.join(os.path.expanduser(args.state_dir), "projects.json"))
    values = args.values
    try:
        if args.action == "list":
            print(json.dumps(store.data, indent=2))
            return
        if args.action == "merge" and len(values) >= 2:
            store.merge(values[0], values[1:])
        elif args.action == "separate" and len(values) == 2:
            store.separate(*values)
        elif args.action == "rename" and len(values) == 2:
            store.data["projects"][store.resolve(values[0])].update(label=label(values[1]), renamed=True)
        elif args.action == "assign-folder" and len(values) == 3:
            source, folder, target = values
            target = store.resolve(target)
            if target not in store.data["projects"] or not os.path.isabs(folder):
                raise ValueError("Use an existing project ID and an absolute folder")
            member = store.register(source, "folder:" + digest(os.path.realpath(folder)), store.labels()[target])
            store.data["members"][member]["project"] = target
            store.data["paths"][source + ":" + digest(os.path.realpath(folder))] = member
        else:
            raise ValueError("Wrong number of arguments; see --help")
        store.save()
        print("Project mapping saved. Regenerate the report to apply it to history.")
    except (ValueError, KeyError) as error:
        parser.error(str(error))


if __name__ == "__main__":
    main()
