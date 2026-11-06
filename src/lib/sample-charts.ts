import type { TermName } from "@/components/Term";

// Geometry read from the charts in report-template.html, drawn at the report's small-chart size (viewBox 0 0 340 162).
export type SampleChart = {
  title: string;
  term: TermName;
  def: string;
  read?: string;
  yTicks: readonly [string, string, string];
  line: string;
  was: readonly [number, number];
  now: readonly [number, number];
  nowLabel: { text: string; y: number };
  wasLabel?: { text: string; x: number; y: number };
};

export const SAMPLE_CHARTS: readonly SampleChart[] = [
  {
    title: "Restarts",
    term: "restarts",
    def: "Sessions that start over on a task you began in the last 2 days.",
    read: "Up: more sessions started a recent task over.",
    yTicks: ["0%", "20%", "40%"],
    line: "M36.0 77.8L41.8 93.2L47.5 109.1L53.3 111.4L59.0 117.7L64.8 121.6L70.6 106.7L76.3 107.3L82.1 111.0L87.9 106.2L93.6 108.2L99.4 110.2L105.2 105.9L110.9 100.3L116.7 104.2L122.5 92.3L128.2 98.6L134.0 94.8L139.8 87.3L145.5 87.9L151.3 84.2L157.1 93.6L162.8 98.6L168.6 109.1L174.4 109.1L180.1 110.6L185.9 114.6L191.6 108.5L197.4 112.4L203.2 116.7L208.9 119.8L214.7 126.2L220.5 123.3L226.2 115.8L232.0 113.6L237.8 115.6L243.5 114.3L249.3 117.0L255.1 119.3L260.8 119.8L266.6 121.3L272.4 123.6L278.1 125.5L283.9 128.8L289.7 129.0L295.4 127.4L301.2 125.6L307.0 122.1L312.7 113.2L318.5 110.9L324.2 100.1L330.0 95.8",
    was: [307, 122.1],
    now: [330, 95.8],
    nowLabel: { text: "now 15%", y: 87.8 },
    wasLabel: { text: "was 6%", x: 311.9, y: 136 },
  },
  {
    title: "Output checking",
    term: "outputChecking",
    def: "Build and research sessions where you asked for sources, what could break or a critique.",
    read: "Down: you asked for checks in fewer build and research sessions.",
    yTicks: ["0%", "40%", "80%"],
    line: "M36.0 77.9L41.8 88.2L47.5 107.0L53.3 105.0L59.1 107.3L64.8 99.2L70.6 83.9L76.4 79.2L82.1 72.3L87.9 80.0L93.6 88.5L99.4 91.7L105.2 104.8L110.9 103.8L116.7 99.7L122.5 103.8L128.2 95.4L134.0 95.4L139.8 89.3L145.5 87.0L151.3 89.3L157.1 89.3L162.8 94.0L168.6 91.7L174.4 87.3L180.1 80.1L185.9 77.0L191.6 75.2L197.4 70.5L203.2 71.8L208.9 75.9L214.7 74.6L220.5 73.1L226.2 76.6L232.0 67.5L237.8 66.4L243.5 71.9L249.3 71.2L255.1 73.9L260.8 71.8L266.6 69.4L272.4 69.4L278.1 70.0L283.9 73.9L289.6 76.1L295.4 74.1L301.2 74.2L306.9 74.8L312.7 81.8L318.5 85.8L324.2 88.8L330.0 91.3",
    was: [306.9, 74.8],
    now: [330, 91.3],
    nowLabel: { text: "now 34%", y: 109.3 },
    wasLabel: { text: "was 45%", x: 311.9, y: 66.8 },
  },
  {
    title: "Corrections per 10 messages",
    term: "corrections",
    def: "Times you said “no, I meant…”, per 10 messages.",
    yTicks: ["0", "2.0", "4.0"],
    line: "M36.0 79.6L41.8 83.5L47.5 83.9L53.3 85.2L59.1 84.8L64.8 82.4L70.6 82.5L76.4 80.0L82.1 80.5L87.9 83.3L93.6 83.4L99.4 84.9L105.2 86.5L110.9 83.9L116.7 84.3L122.5 84.7L128.2 83.1L134.0 83.8L139.8 82.4L145.5 80.9L151.3 82.1L157.1 83.3L162.8 86.9L168.6 89.9L174.4 92.3L180.1 94.2L185.9 93.5L191.6 95.3L197.4 98.8L203.2 101.9L208.9 105.5L214.7 109.3L220.5 108.3L226.2 109.6L232.0 108.2L237.8 105.9L243.5 106.4L249.3 105.6L255.1 107.0L260.8 107.3L266.6 106.2L272.4 106.7L278.1 106.0L283.9 106.1L289.6 106.7L295.4 106.7L301.2 106.2L306.9 106.4L312.7 105.8L318.5 105.5L324.2 105.5L330.0 104.8",
    was: [306.9, 106.4],
    now: [330, 104.8],
    nowLabel: { text: "now 1.2", y: 96.8 },
  },
  {
    title: "Briefed starts",
    term: "briefedStarts",
    def: "Sessions whose first message gives at least two of these: the goal, the background, what done looks like.",
    yTicks: ["0%", "40%", "80%"],
    line: "M36.0 108.9L41.8 93.2L47.5 96.8L53.3 97.2L59.1 99.8L64.8 107.8L70.6 113.9L76.4 119.0L82.1 115.8L87.9 113.4L93.6 108.3L99.4 108.0L105.2 108.0L110.9 108.2L116.7 112.2L122.5 108.2L128.2 111.8L134.0 111.8L139.8 111.8L145.5 115.8L151.3 114.0L157.1 112.9L162.8 109.9L168.6 101.3L174.4 97.5L180.1 92.3L185.9 85.6L191.6 85.8L197.4 79.6L203.2 78.3L208.9 77.6L214.7 72.7L220.5 70.0L226.2 71.0L232.0 62.6L237.8 66.8L243.5 66.3L249.3 64.9L255.1 68.4L260.8 65.7L266.6 68.9L272.4 68.9L278.1 65.7L283.9 66.1L289.6 61.1L295.4 60.3L301.2 63.4L306.9 63.9L312.7 64.8L318.5 65.2L324.2 64.8L330.0 64.8",
    was: [306.9, 63.9],
    now: [330, 64.8],
    nowLabel: { text: "now 52%", y: 82.8 },
  },
];
