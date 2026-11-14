"""Synthetic data only: custom-date totals and coverage date provenance."""
import datetime as dt
import importlib.util
import json
import subprocess
import sys
from pathlib import Path
import tempfile
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / 'plugins/second-look/skills/second-look/scripts'

def module(name):
    spec = importlib.util.spec_from_file_location(name, SCRIPTS / (name + '.py'))
    value = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(value)
    return value

collect = module('collect')
check = module('check_report')

class ReportDataTests(unittest.TestCase):
    def session(self, date, source='codex', category='research'):
        return dict(start=dt.datetime.fromisoformat(date).astimezone(), source=source, category=category,
                    prompts=3, briefable=1, briefed=1, corrections=1, refinements=2, build=1,
                    checked=True, restart=False, retyped=0, skilled=1, edited=1, agent_checked=1,
                    unchecked_ships=0, delegations={'research': 2}, read_heavy=0, unattended=0,
                    setups=0, parallel=0, repeat_of=0, usage=10.4, long=False, start_tokens=6)

    def test_daily_totals_preserve_weekly_metrics_and_boundaries(self):
        rows = collect.session_cube([self.session('2026-10-12T12:00:00'),
                                     self.session('2026-10-18T12:00:00'),
                                     self.session('2026-10-19T12:00:00')])
        self.assertEqual([(r['week'],r['sessions']) for r in rows], [('2026-10-12',2),('2026-10-19',1)])
        self.assertEqual([d['date'] for d in rows[0]['days']], ['2026-10-12','2026-10-18'])
        self.assertEqual(rows[0]['usage'],20)
        self.assertEqual(rows[0]['delegated_research'],4)
        self.assertEqual(check.cube_problems(rows,dt.date(2026,10,19)),[])
        for row in rows:
            for key,value in row.items():
                if isinstance(value,(int,float)):
                    self.assertEqual(sum(d[key] for d in row['days']),value)

    def test_checker_rejects_bad_daily_payload(self):
        row = collect.session_cube([self.session('2026-10-12T12:00:00')])[0]
        row['days'][0]['sessions'] += 1
        self.assertTrue(any('daily sessions' in p for p in check.cube_problems([row],dt.date(2026,10,19))))
        row['days'][0]['date'] = '2026-10-19'
        self.assertTrue(any('parent week' in p for p in check.cube_problems([row],dt.date(2026,10,19))))

    def test_export_file_timestamp_is_not_latest_session(self):
        with tempfile.TemporaryDirectory() as home:
            path = Path(home)/'export.json'; path.write_text('{}')
            scope = collect.data_scope(home,[],{'chatgpt':str(path)})
            row = next(s for s in scope['sources'] if s['id']=='chatgpt')
            self.assertEqual(row['state'],'export')
            self.assertIsNone(row['latest_session'])
            self.assertIn('through',scope)

    def test_no_evidence_preflight_has_no_skills_promise(self):
        with tempfile.TemporaryDirectory() as home:
            result = subprocess.run([sys.executable,str(SCRIPTS/'collect.py'),'--home',home,'--days','14','--trend'],capture_output=True,text=True,check=True)
            data = json.loads(result.stdout)
            self.assertEqual(data['preflight']['status'],'no_session_evidence')
            self.assertEqual(data['preflight']['available_skill_files'],0)
            self.assertEqual(data['cube'],[])

    def test_weekly_only_history_remains_valid(self):
        row = collect.session_cube([self.session('2026-10-12T12:00:00')])[0]
        del row['days']
        self.assertEqual(check.cube_problems([row],dt.date(2026,10,19)),[])

    def test_projects_keep_separate_daily_and_weekly_totals(self):
        sessions = [self.session('2026-10-12T12:00:00') for _ in range(3)]
        sessions[0]['project'] = 'Atlas'
        sessions[1]['project'] = 'Streak'
        rows = collect.session_cube(sessions)
        self.assertEqual({r['project']: r['sessions'] for r in rows}, {'': 1, 'Atlas': 1, 'Streak': 1})
        self.assertEqual(check.cube_problems(rows, dt.date(2026,10,19)), [])
        self.assertTrue(any('repeats' in p for p in check.cube_problems(rows + rows[:1], dt.date(2026,10,19))))
        rows[0]['project'] = '/private/project'
        self.assertTrue(any('never a path' in p for p in check.cube_problems(rows, dt.date(2026,10,19))))

    def test_worktree_and_subfolder_resolve_to_main_repository(self):
        with tempfile.TemporaryDirectory() as root:
            repo = Path(root)/'Atlas'
            (repo/'.git/worktrees/branch').mkdir(parents=True)
            (repo/'src').mkdir()
            worktree = Path(root)/'branch'
            worktree.mkdir()
            (worktree/'.git').write_text(f'gitdir: {repo}/.git/worktrees/branch\n')
            (repo/'.git/worktrees/branch/commondir').write_text('../..\n')
            self.assertEqual(collect.project_name(str(repo/'src')), 'Atlas')
            self.assertEqual(collect.project_name(str(worktree)), 'Atlas')
            self.assertEqual(collect.project_name(root), '')
            self.assertEqual(collect.project_name('relative/project'), '')

    def test_collectors_take_project_from_metadata_even_before_date_window(self):
        with tempfile.TemporaryDirectory() as home:
            repo = Path(home)/'Atlas'
            (repo/'.git').mkdir(parents=True)
            claude = Path(home)/'.claude/projects/test/session.jsonl'
            codex = Path(home)/'.codex/sessions/session.jsonl'
            claude.parent.mkdir(parents=True)
            codex.parent.mkdir(parents=True)
            old = '2026-10-01T12:00:00+00:00'
            new = '2026-10-12T12:00:00+00:00'
            claude.write_text('\n'.join(json.dumps(e) for e in [
                {'timestamp': old, 'cwd': str(repo)},
                {'timestamp': new, 'type': 'user', 'message': {'role': 'user', 'content': 'Please research this feature'}}]))
            codex.write_text('\n'.join(json.dumps(e) for e in [
                {'timestamp': old, 'type': 'session_meta', 'payload': {'cwd': str(repo)}},
                {'timestamp': new, 'payload': {'type': 'user_message', 'message': 'Please research this feature'}}]))
            since = dt.datetime.fromisoformat('2026-10-10T00:00:00+00:00')
            sessions = collect.sessions_of([collect.claude_code(home, since), collect.codex(home, since)])
            self.assertEqual(len(sessions), 2)
            self.assertEqual({s['project'] for s in sessions}, {'Atlas'})
            self.assertNotIn(str(repo), json.dumps(collect.session_cube(sessions)))

if __name__ == '__main__':
    unittest.main()
