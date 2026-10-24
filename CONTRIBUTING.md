# Contributing

Thanks for helping. Issues and pull requests are welcome.

## Good first contributions

- Support for another tool's session logs in `plugin/skills/second-look/scripts/collect.py`
- Better wording patterns for corrections, briefs and checks (with example prompts)
- Fixes to the install script on your OS

## Before you open a pull request

1. Run the collector on your own logs: `python3 plugin/skills/second-look/scripts/collect.py --days 14`
2. If you touched the report, run `python3 plugin/skills/second-look/scripts/check_report.py plugin/skills/second-look/report-template.html`
3. If you touched the plugin files, run `claude plugin validate .`
4. Never commit real prompts, session logs or anything from `~/.second-look`.

## Report design

The report's look is fixed by `report-template.html` and described in
`references/design-system.md`. Change the design in the template itself, in its own pull
request, and keep the check passing.
