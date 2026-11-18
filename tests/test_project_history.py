"""Project identity, conservative migration and all-history collection fixtures."""
import datetime as dt
import json
import os
from pathlib import Path
import sqlite3
import subprocess
import sys
import tempfile
import unittest
from test_report_data import collect, check, SCRIPTS
import test_report_data as fixtures
from projects import ProjectStore, folder_identity
from history import HistoryStore


class ProjectHistoryTests(unittest.TestCase):
    def session(self, sid, date, member='', source='codex'):
        row = fixtures.ReportDataTests().session(date, source=source)
        return dict(row, session=sid, project_member=member)

    def test_automatic_names_overrides_rename_and_redirects(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = str(Path(tmp)/'projects.json'); store = ProjectStore(path)
            a = store.register('codex','id-a','Second Look')
            b = store.register('claude_code','id-b',' second-look ')
            c = store.register('cursor','id-c','SECOND  LOOK')
            original = store.project_for(a)
            self.assertEqual({store.project_for(m) for m in [a,b,c]}, {original})
            separated = store.separate(b, 'Unrelated client')
            store.save(); store = ProjectStore(path)
            store.register('claude_code','id-b','second look')
            self.assertEqual(store.project_for(b), separated)
            store.register('codex','id-a','New name')
            self.assertEqual(store.project_for(a), original)
            store.merge(original,[separated])
            self.assertEqual(store.project_for(b), original)
            self.assertEqual(store.resolve(separated),original)

    def test_plain_workspace_subfolder_rename_deleted_and_private_mapping(self):
        with tempfile.TemporaryDirectory() as home:
            # A user-selected folder in a simulated home, outside generated temp paths.
            root = Path(home)/'Design'; root.mkdir(); (root/'assets').mkdir()
            store = ProjectStore()
            # explicit workspace roots are intentional even inside a test temp directory
            a = store.folder('codex',str(root/'assets'),[str(root)],home=home)
            self.assertTrue(a)
            first = store.project_for(a)
            moved = root.rename(Path(home)/'New Design')
            b = store.folder('codex',str(moved),[str(moved)],home=home)
            self.assertEqual(a,b); self.assertEqual(first,store.project_for(b))
            (moved/'assets').rmdir(); moved.rmdir()
            self.assertEqual(store.folder('codex',str(moved),home=home),a)
            self.assertNotIn(home,json.dumps(store.data))
            self.assertIsNone(folder_identity(home,home=home))
            self.assertIsNone(folder_identity(str(Path(home)/'.codex/scratch/chat-1'),home=home))

    def test_old_kind_of_work_ids_are_renamed_on_load(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp)/'history.json'
            path.write_text(json.dumps({"version": 2, "cube": [],
                "sessions": {"k": {"member": "", "row": {"week": "2026-10-05", "source": "codex", "category": "prototyping", "sessions": 1}}},
                "legacy": [{"week": "2026-01-05", "source": "chatgpt", "category": "career", "sessions": 2},
                           {"week": "2026-01-05", "source": "chatgpt", "category": "consultation", "sessions": 3},
                           {"week": "2026-01-05", "source": "chatgpt", "category": "creating", "sessions": 4}]}))
            store = HistoryStore(str(path))
            self.assertEqual(store.data["sessions"]["k"]["row"]["category"], "coding")
            self.assertEqual({r["category"]: r["sessions"] for r in store.data["legacy"]}, {"advice": 5, "writing": 4})

    def test_ledger_survives_deleted_logs_and_regroups_old_sessions(self):
        with tempfile.TemporaryDirectory() as tmp:
            store=ProjectStore(); a=store.register('codex','a','Atlas'); b=store.register('claude_code','b','atlas')
            history=HistoryStore(str(Path(tmp)/'history.json'))
            sessions=[self.session('a','2023-01-02T12:00:00',a),self.session('b','2026-01-05T12:00:00',b,'claude_code')]
            cube=history.update(sessions,store,collect.session_cube)
            self.assertEqual(sum(r['sessions'] for r in cube),2)
            self.assertEqual(check.cube_problems(cube,dt.date(2026,10,19)),[])
            history.save(); history=HistoryStore(history.path)
            separated=store.separate(b,'Different Atlas')
            cube=history.update(sessions[:1],store,collect.session_cube)
            self.assertEqual(sum(r['sessions'] for r in cube),2)
            self.assertEqual(cube[-1]['project'],separated)
            self.assertNotIn('first',json.dumps(history.data))
            self.assertEqual(history.update([],store,collect.session_cube),cube)

    def test_legacy_partial_backfill_preserves_and_full_replaces(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'history.json'; store=ProjectStore()
            member=store.register('codex','a','Atlas')
            sessions=[self.session('a','2023-01-02T12:00:00',member),self.session('b','2023-01-03T12:00:00',member)]
            old=collect.session_cube(sessions); path.write_text(json.dumps(old))
            history=HistoryStore(str(path))
            partial=history.update(sessions[:1],store,collect.session_cube)
            self.assertEqual(sum(r['sessions'] for r in partial),2)
            self.assertTrue(history.notes)
            full=history.update(sessions,store,collect.session_cube)
            self.assertEqual(sum(r['sessions'] for r in full),2)
            self.assertEqual(full[0]['project'],store.project_for(member))
            self.assertEqual(history.update(sessions,store,collect.session_cube),full)

    def test_cli_three_year_history_is_repeatable(self):
        with tempfile.TemporaryDirectory() as home:
            repo=Path(home)/'Project'; (repo/'.git').mkdir(parents=True)
            logs=Path(home)/'.codex/sessions'; logs.mkdir(parents=True)
            for i,year in enumerate([2023,2024,2026]):
                events=[{'type':'session_meta','payload':{'cwd':str(repo)}},
                        {'timestamp':f'{year}-01-02T12:00:00+00:00','payload':{'type':'user_message','message':'Research a user request'}}]
                (logs/f'session-{i}.jsonl').write_text('\n'.join(map(json.dumps,events)))
            state=Path(home)/'.second-look'
            command=[sys.executable,str(SCRIPTS/'collect.py'),'--home',home,'--all-history','--trend','--state-dir',str(state)]
            first=json.loads(subprocess.check_output(command,text=True))
            (logs/'session-0.jsonl').unlink()
            second=json.loads(subprocess.check_output(command,text=True))
            self.assertEqual(first['cube'],second['cube'])
            self.assertEqual(sum(r['sessions'] for r in second['cube']),3)
            self.assertTrue(second['cube'][0]['week'].startswith('2023'))
            self.assertNotIn(home,json.dumps(second['cube']))

    def test_cursor_verified_workspace_schema(self):
        with tempfile.TemporaryDirectory() as home:
            root=Path(home)/'Work';root.mkdir()
            db=Path(home)/'.config/Cursor/User/globalStorage/state.vscdb';db.parent.mkdir(parents=True)
            con=sqlite3.connect(db);con.execute('create table cursorDiskKV (key text, value text)')
            composer={'composerId':'a','workspaceIdentifier':{'id':'workspace-a','uri':{'scheme':'file','fsPath':str(root)}}}
            bubble={'type':1,'createdAt':'2026-01-01T12:00:00+00:00','text':'Research this project'}
            con.executemany('insert into cursorDiskKV values (?,?)',[('composerData:a',json.dumps(composer)),('bubbleId:a:b',json.dumps(bubble))]);con.commit();con.close()
            a=collect.cursor(home,dt.datetime(2020,1,1,tzinfo=dt.timezone.utc))
            self.assertEqual(a.project_metadata['a']['roots'],[str(root)])

    def test_empty_and_old_cube_valid(self):
        self.assertEqual(check.cube_problems([],dt.date(2026,10,19)),[])
        cube=collect.session_cube([self.session('a','2023-01-02T12:00:00')])
        self.assertEqual(check.cube_problems(cube,dt.date(2026,10,19)),[])

if __name__=='__main__':unittest.main()
