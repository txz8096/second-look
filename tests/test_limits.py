"""Synthetic data only: counting 5-hour limits and placing them in the week."""
import datetime as dt
import importlib.util
import json
import os
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
WEEK = '2026-10-19'
EPOCH = dt.datetime(1970, 1, 1, tzinfo=dt.timezone.utc)


def local(text):
    """A local wall-clock time, so the tests read the same in every time zone."""
    return dt.datetime.fromisoformat(text).astimezone()


def stamp(text):
    return local(text).astimezone(dt.timezone.utc).isoformat()


def epoch(text):
    return int(local(text).timestamp())


def claude_limit(at, reset=None, kind='five_hour', text="You've hit your 5-hour limit", session='s1', status='rejected'):
    e = {'timestamp': stamp(at), 'type': 'assistant', 'sessionId': session, 'isApiErrorMessage': True,
         'message': {'content': [{'type': 'text', 'text': text}]}}
    if reset:
        e['quotaLimits'] = {'status': status, 'resetsAt': epoch(reset), 'rateLimitType': kind}
    return e


def claude_reply(at, usage, mid, ctx=1000, session='s1', side=False, model='claude-opus-5'):
    return {'timestamp': stamp(at), 'type': 'assistant', 'sessionId': session, 'isSidechain': side,
            'message': {'id': mid, 'model': model, 'usage': {'input_tokens': usage, 'cache_read_input_tokens': ctx}}}


def prompt(at, text):
    return {'timestamp': stamp(at), 'type': 'user', 'message': {'role': 'user', 'content': text}}


def codex_reading(at, percent, reset, minutes=300, limit_id='codex', total=1):
    return {'timestamp': stamp(at), 'payload': {
        'type': 'token_count', 'info': {'total_token_usage': {'n': total}, 'last_token_usage': {'input_tokens': 100, 'output_tokens': 10}},
        'rate_limits': {'limit_id': limit_id, 'primary': {'used_percent': percent, 'window_minutes': minutes, 'resets_at': epoch(reset)}}}}


class LimitTests(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.home = self.dir.name

    def tearDown(self):
        self.dir.cleanup()

    def write(self, path, events):
        p = Path(self.home) / path
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text('\n'.join(json.dumps(e) for e in events))

    def claude(self, events, path='.claude/projects/demo/s1.jsonl'):
        self.write(path, events)

    def codex(self, events):
        self.write('.codex/sessions/2026/10/c1.jsonl', events)

    def hits(self):
        readings = collect.codex_limit_readings(self.home, EPOCH)
        return collect.merge_limits(collect.claude_limit_hits(self.home, EPOCH)
                                    + collect.codex_limit_hits(collect.codex_windows(readings)))

    def report(self, week=WEEK, **kw):
        return collect.limit_report(self.home, week, self.hits(), collect.codex_limit_readings(self.home, EPOCH), **kw)

    def test_repeated_messages_for_one_reset_count_once(self):
        self.claude([claude_limit(f'2026-10-21T14:16:{s:02}', '2026-10-21T18:10') for s in (1, 2, 9, 22, 44)])
        self.assertEqual(len(self.hits()), 1)
        self.assertEqual(self.hits()[0]['at'], epoch('2026-10-21T14:16:01'))

    def test_two_resets_the_same_day_count_twice(self):
        self.claude([claude_limit('2026-10-21T12:24', '2026-10-21T13:10'), claude_limit('2026-10-21T14:16', '2026-10-21T18:10')])
        self.assertEqual(len(self.hits()), 2)

    def test_helper_agent_hit_counts(self):
        self.claude([claude_limit('2026-10-21T12:24', '2026-10-21T13:10')], '.claude/projects/demo/s1/subagents/agent-1.jsonl')
        self.assertEqual(len(self.hits()), 1)

    def test_kinds_come_from_the_structured_field(self):
        self.claude([claude_limit('2026-10-21T12:24', '2026-10-21T13:10', text="You've hit your session limit"),
                     claude_limit('2026-10-21T12:30', '2026-10-24T14:00', kind='seven_day', text="You've hit your weekly limit"),
                     claude_limit('2026-10-21T12:40', '2026-10-24T14:00', kind='seven_day_opus', text="You've hit your Opus limit")])
        self.assertEqual([h['kind'] for h in self.hits()], ['five_hour', 'weekly', 'seven_day_opus'])
        self.assertEqual(collect.limit_counts(self.hits(), EPOCH), {'claude_code': {'five_hour': 1, 'weekly': 1, 'other': 1}})

    def test_brief_errors_and_spend_limits_are_not_hits(self):
        self.claude([claude_limit('2026-10-21T12:24', text="API Error: This request would exceed your account's rate limit. Please try again later."),
                     claude_limit('2026-10-21T12:25', text="You've hit your monthly spend limit. Switch to another model."),
                     claude_limit('2026-10-21T12:26', text="You're out of usage credits."),
                     claude_limit('2026-10-21T12:27', '2026-10-21T13:10', status='allowed_warning'),
                     prompt('2026-10-21T12:28', "why does it say I've hit your 5-hour limit?")])
        self.assertEqual(self.hits(), [])

    def test_older_text_only_messages(self):
        self.claude([claude_limit('2026-10-21T12:24', text="You've hit your session limit · resets 1:10pm (America/Los_Angeles)"),
                     claude_limit('2026-10-21T12:26', text="You've hit your 5-hour limit · resets 1:10pm (America/Los_Angeles)"),
                     claude_limit('2026-10-21T14:16', text="5-hour limit reached ∙ resets 6:10pm"),
                     claude_limit('2026-10-22T09:00', text=f"Claude AI usage limit reached|{epoch('2026-10-22T13:00')}")])
        hits = self.hits()
        self.assertEqual([h['kind'] for h in hits], ['five_hour'] * 3)
        self.assertEqual([h['reset'] for h in hits], [epoch('2026-10-21T13:10'), epoch('2026-10-21T18:10'), epoch('2026-10-22T13:00')])

    def test_codex_counts_only_full_windows(self):
        self.codex([codex_reading('2026-10-21T09:00', 99, '2026-10-21T13:20'),
                    codex_reading('2026-10-21T14:00', 99.6, '2026-10-21T18:30'),
                    codex_reading('2026-10-21T15:00', 100, '2026-10-21T18:30:20'),
                    codex_reading('2026-10-21T15:10', 100, '2026-10-21T18:29:50'),
                    codex_reading('2026-10-21T16:00', 100, '2026-10-21T18:30', limit_id='codex_other'),
                    codex_reading('2026-10-22T15:10', 100, '2026-10-22T15:00')])
        self.assertEqual([h['at'] for h in self.hits() if h['kind'] == 'five_hour'], [epoch('2026-10-21T15:00')])
        codex = self.report()['apps'][0]
        self.assertEqual(codex['id'], 'codex')
        self.assertEqual(codex['cells'][2], [None, 99, 99, 100, None, None])
        self.assertEqual((codex['peak'], codex['next']), (100, {'percent': 99, 'day': 2, 'slot': 1}))

    def test_saved_hits_do_not_double_on_a_rerun(self):
        self.claude([claude_limit('2026-10-21T12:24', '2026-10-21T13:10')])
        fresh = self.hits()
        saved = [{k: h[k] for k in ('app', 'kind', 'at', 'reset')} for h in fresh]
        merged = collect.merge_limits(fresh + saved)
        self.assertEqual(len(merged), 1)
        self.assertEqual(merged[0]['session'], 's1')

    def test_week_edges_and_slots(self):
        self.claude([claude_limit('2026-10-18T23:59', '2026-10-19T02:00'), claude_limit('2026-10-19T00:00', '2026-10-19T04:00'),
                     claude_limit('2026-10-21T14:59', '2026-10-21T18:00'), claude_limit('2026-10-25T23:59', '2026-10-26T03:00'),
                     claude_limit('2026-10-26T00:00', '2026-10-26T04:59')])
        app = self.report(review_from='2026-10-19')['apps'][0]
        self.assertEqual([(h['day'], h['slot']) for h in app['hits']], [(0, 0), (2, 2), (6, 5)])
        self.assertEqual(app['since_review'], 4)

    def test_first_review_counts_two_weeks(self):
        self.claude([claude_limit('2026-10-01T10:00', '2026-10-01T13:00'), claude_limit('2026-10-21T10:00', '2026-10-21T13:00')])
        app = self.report(now=dt.datetime(2026, 10, 26))['apps'][0]
        self.assertEqual(app['since_review'], 1)
        self.assertIsNone(self.report(now=dt.datetime(2026, 10, 26))['review_from'])

    def test_quiet_week_keeps_the_earlier_count(self):
        self.claude([claude_limit('2026-10-14T10:00', '2026-10-14T13:00')])
        app = self.report(review_from='2026-10-12')['apps'][0]
        self.assertEqual((app['hits'], app['since_review'], app['split']), ([], 1, None))

    def test_usage_shares_and_split(self):
        self.claude([claude_reply('2026-10-21T06:00', 100, 'old', ctx=0),            # before the window opened
                     prompt('2026-10-21T09:00', 'Please build the form'),
                     claude_reply('2026-10-21T09:10', 100, 'a', ctx=0),
                     claude_reply('2026-10-21T09:10', 100, 'a', ctx=0),              # the same reply, logged twice
                     prompt('2026-10-21T09:20', "no, that's not what I asked for"),
                     claude_reply('2026-10-21T12:10', 100, 'b', ctx=0),
                     claude_reply('2026-10-21T12:20', 100, 'c', ctx=151000),
                     claude_limit('2026-10-21T12:30', '2026-10-21T13:10'),
                     claude_reply('2026-10-21T14:00', 100, 'd', ctx=0)])
        app = self.report()['apps'][0]
        self.assertEqual(app['hits'], [{'day': 2, 'slot': 2, 'long': True, 'model': 'Opus'}])
        self.assertAlmostEqual(sum(map(sum, app['cells'])), 1, places=2)
        self.assertEqual(sum(app['split'].values()), 100)
        # reply a was corrected; of reply c, the part past the long-session line is re-reading
        self.assertGreater(app['split']['work'], app['split']['reread'])
        self.assertGreater(app['split']['redo'], 0)

    def test_helper_usage_counts_once(self):
        self.claude([claude_reply('2026-10-21T09:10', 100, 'a', ctx=0)])
        self.claude([claude_reply('2026-10-21T15:10', 300, 'h', ctx=0, side=True)], '.claude/projects/demo/s1/subagents/agent-1.jsonl')
        app = self.report()['apps'][0]
        self.assertEqual((app['cells'][2][1], app['cells'][2][3]), (0.25, 0.75))

    def test_the_reply_that_fills_the_codex_window_counts(self):
        first, last = codex_reading('2026-10-21T14:00:00.100', 50, '2026-10-21T18:00', total=1), codex_reading('2026-10-21T15:00:00.500', 100, '2026-10-21T18:00', total=2)
        last['payload']['info']['last_token_usage'] = {'input_tokens': 900 + collect.LONG_LINE, 'cached_input_tokens': collect.LONG_LINE + 900}
        self.codex([first, last])
        self.assertGreater(self.report()['apps'][0]['split']['reread'], 0)

    def test_a_hit_after_the_known_reset_is_its_own(self):
        hit = lambda at, reset=None: {'app': 'claude_code', 'kind': 'five_hour', 'at': epoch(at), 'reset': reset and epoch(reset)}
        self.assertEqual(len(collect.merge_limits([hit('2026-10-21T12:55', '2026-10-21T13:00'), hit('2026-10-21T14:00')])), 2)
        self.assertEqual(len(collect.merge_limits([hit('2026-10-21T12:55', '2026-10-21T16:00'), hit('2026-10-21T14:00')])), 1)
        self.assertEqual(len(collect.merge_limits([hit('2026-10-21T12:55'), hit('2026-10-21T14:00', '2026-10-21T16:00')])), 1)
        self.assertEqual(len(collect.merge_limits([hit('2026-10-21T12:55'), hit('2026-10-21T14:00')])), 1)

    def test_other_codex_limits_are_evidence_only(self):
        self.codex([codex_reading('2026-10-21T14:00', 40, '2026-10-21T18:00'),
                    codex_reading('2026-10-21T15:00', 100, '2026-10-21T18:00', limit_id='codex_other')])
        self.assertEqual(collect.limit_counts(self.hits(), EPOCH), {'codex': {'other': 1}})
        codex = self.report()['apps'][0]
        self.assertEqual((codex['hits'], codex['peak'], codex['cells'][2]), ([], 40, [None, None, 40, None, None, None]))

    def test_saved_hits_without_logs_have_no_map(self):
        saved = [{'app': a, 'kind': 'five_hour', 'at': epoch('2026-10-21T15:00'), 'reset': epoch('2026-10-21T18:00')} for a in ('claude_code', 'codex')]
        for app in collect.limit_report(self.home, WEEK, saved, [])['apps']:
            self.assertEqual((len(app['hits']), app['cells'], app['split']), (1, None, None), app['id'])
        # some of the week's logs are left: shares of what remains would mislead, readings still stand
        self.claude([claude_reply('2026-10-22T09:10', 100, 'a', ctx=0)])
        self.codex([codex_reading('2026-10-22T14:00', 40, '2026-10-22T18:00')])
        claude, codex = collect.limit_report(self.home, WEEK, saved, collect.codex_limit_readings(self.home, EPOCH))['apps']
        self.assertEqual((claude['cells'], claude['split'], codex['split']), (None, None, None))
        self.assertEqual((codex['cells'][2][3], codex['cells'][3][2]), (100, 40))

    def test_no_evidence(self):
        self.assertEqual(self.report(), {'from': WEEK, 'to': '2026-10-25', 'review_from': None, 'apps': []})

    def test_collector_saves_hits_and_keeps_them_after_logs_go(self):
        now = dt.datetime.now().astimezone().replace(microsecond=0)
        at, reset = now - dt.timedelta(hours=2), now + dt.timedelta(hours=1)
        e = claude_limit('2026-10-21T12:24', '2026-10-21T13:10')
        e['timestamp'], e['quotaLimits']['resetsAt'] = at.isoformat(), int(reset.timestamp())
        self.claude([prompt('2026-10-21T12:00', 'Please research this feature'), e])
        state = os.path.join(self.home, 'state')
        run = lambda: json.loads(subprocess.run([sys.executable, str(SCRIPTS / 'collect.py'), '--home', self.home, '--all-history', '--trend',
                                                 '--state-dir', state, '--review-from', (now - dt.timedelta(days=3)).date().isoformat()],
                                                capture_output=True, text=True, check=True).stdout)
        saved = lambda: json.loads(Path(state, 'history.json').read_text())['limits']
        self.assertEqual(run()['limits']['apps'][0]['since_review'], 1)
        self.assertEqual(saved(), [{'app': 'claude_code', 'kind': 'five_hour', 'at': int(at.timestamp()), 'reset': int(reset.timestamp())}])
        run()
        self.assertEqual(len(saved()), 1)
        os.remove(Path(self.home, '.claude/projects/demo/s1.jsonl'))
        self.assertEqual(run()['limits']['apps'][0]['since_review'], 1)
        self.assertNotIn('Please research', Path(state, 'history.json').read_text())


class CheckerTests(unittest.TestCase):
    GOOD = {'from': WEEK, 'to': '2026-10-25', 'review_from': None, 'apps': [
        {'id': 'claude_code', 'hits': [{'day': 2, 'slot': 3, 'long': True, 'model': 'Opus'}], 'since_review': 1,
         'split': {'work': 50, 'reread': 40, 'redo': 10}, 'cells': [[0] * 6 for _ in range(7)]}]}

    def problems(self, limits, recs='{}', end=WEEK, ids=''):
        html = f'const LIMITS = {limits if isinstance(limits, str) else json.dumps(limits)};\nconst LIMIT_RECS = {recs};\n{ids}'
        return check.limit_problems(html, dt.date.fromisoformat(end))

    def test_collector_output_and_none_pass(self):
        self.assertEqual(self.problems(self.GOOD), [])
        self.assertEqual(self.problems('null'), [])
        unknown = json.loads(json.dumps(self.GOOD)); unknown['apps'][0].update(cells=None, split=None)
        self.assertEqual(self.problems(unknown), [])

    def test_bad_shapes_are_named(self):
        self.assertTrue(any('END' in p for p in self.problems(self.GOOD, end='2026-10-12')))
        self.assertTrue(any('app' in p for p in self.problems({**self.GOOD, 'apps': [{'id': 'cursor'}]})))
        bad = json.loads(json.dumps(self.GOOD)); bad['apps'][0]['hits'][0]['slot'] = 9
        self.assertTrue(any('hits' in p for p in self.problems(bad)))
        bad = json.loads(json.dumps(self.GOOD)); bad['apps'][0]['cells'].pop()
        self.assertTrue(any('cells' in p for p in self.problems(bad)))

    def test_recommendation_links_must_exist(self):
        recs = '{"claude_code": [["p-long", "long sessions"]]}'
        self.assertTrue(any('p-long' in p for p in self.problems(self.GOOD, recs)))
        self.assertEqual(self.problems(self.GOOD, recs, ids='<article id="p-long" class="icard">'), [])


if __name__ == '__main__':
    unittest.main()
