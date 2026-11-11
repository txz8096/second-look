#!/usr/bin/env python3
"""Check palette text pairings and the required equivalent chart-data route."""
import argparse
import re
from pathlib import Path


def luminance(color):
    channels = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    linear = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
    return sum(c * weight for c, weight in zip(linear, (0.2126, 0.7152, 0.0722)))


def contrast(first, second):
    low, high = sorted((luminance(first), luminance(second)))
    return (high + 0.05) / (low + 0.05)


def problems(source):
    issues = []
    colors = dict(re.findall(r"--chart-([\w-]+):\s*(#[\da-fA-F]{6})\s*;", source))
    categories = re.search(r"const CHART_CATEGORIES = \{(.*?)\};", source, re.S)
    groups = re.search(r"const CHART_GROUPS = \{(.*?)\};", source, re.S)
    if not categories or not groups or not {"black", "white"} <= colors.keys():
        return ["Missing the chart palette or stable category/group mappings"]
    white_names = {"orange", "blue", "blue-deep", "pink-deep"}
    fills = re.findall(r':\s*"([\w-]+)"', categories.group(1) + groups.group(1))
    for name in set(fills):
        if name not in colors:
            issues.append(f"Undefined chart color: {name}")
            continue
        ink = colors["white" if name in white_names else "black"]
        ratio = contrast(colors[name], ink)
        if ratio < 4.5:
            issues.append(f"{name} and its specified text pairing have {ratio:.2f}:1; need 4.5:1")
    for required in ('function chartData(', '<summary>View chart data</summary>',
                     'workMix.appendChild(chartData(', 'card.appendChild(chartData(',
                     'scope="row"', 'scope="col"', '<caption>'):
        if required not in source:
            issues.append(f"Missing equivalent chart-table information: {required}")
    if '.chart-pattern-' in source or 'stroke: "var(--chart-white)"' in source:
        issues.append("Added patterns or line underlays: keep the requested solid chart styling")
    return issues


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", nargs="?", type=Path,
                        default=Path(__file__).resolve().parent.parent / "report-template.html")
    args = parser.parse_args()
    issues = problems(args.report.read_text())
    if issues:
        print("Chart palette check failed:")
        for issue in issues:
            print(" -", issue)
        raise SystemExit(1)
    print("Palette text pairings and data-table checks passed. Solid-mark contrast remains contextual; rendered interaction checks are required.")


if __name__ == "__main__":
    main()
