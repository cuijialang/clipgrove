/* eslint-disable @next/next/no-img-element */

'use client';

import { BarChart3, Trophy, Info } from 'lucide-react';

interface BenchmarkScores {
  swe_bench_verified: number | null;
  terminal_bench: number | null;
  swe_bench_pro: number | null;
  aider_polyglot: number | null;
  live_code_bench: number | null;
}

interface BenchmarkPanelProps {
  benchmarks: BenchmarkScores | null;
}

// Weighted scoring formula: ClipScore = SWE-bench V × 0.30 + Terminal-Bench × 0.25 + SWE-Pro × 0.20 + Aider × 0.15 + LiveCode × 0.10
const WEIGHTS: Record<keyof BenchmarkScores, number> = {
  swe_bench_verified: 0.30,
  terminal_bench: 0.25,
  swe_bench_pro: 0.20,
  aider_polyglot: 0.15,
  live_code_bench: 0.10,
};

const BENCHMARK_INFO: Record<string, { name: string; org: string; desc: string; url: string }> = {
  swe_bench_verified: { name: 'SWE-bench Verified', org: 'OpenAI', desc: '500 real GitHub issues, human-validated', url: 'https://www.swebench.com/' },
  terminal_bench: { name: 'Terminal-Bench 2.1', org: 'tbench.ai', desc: 'Agent driving a real terminal to complete dev tasks', url: 'https://www.tbench.ai/' },
  swe_bench_pro: { name: 'SWE-bench Pro', org: 'Scale AI', desc: '1,865 contamination-resistant tasks across 41 repos', url: 'https://scale.com/leaderboard/swe-bench-pro' },
  aider_polyglot: { name: 'Aider Polyglot', org: 'Aider', desc: 'Multi-language code editing benchmark', url: 'https://aider.chat/docs/leaderboards/' },
  live_code_bench: { name: 'LiveCodeBench', org: 'LiveCodeBench', desc: 'Live coding competition problems', url: 'https://livecodebench.github.io/' },
};

function calculateClipScore(benchmarks: BenchmarkScores): number | null {
  const entries = (Object.keys(WEIGHTS) as Array<keyof BenchmarkScores>)
    .filter((key) => benchmarks[key] != null)
    .map((key) => ({ key, score: benchmarks[key] as number, weight: WEIGHTS[key] }));

  if (entries.length === 0) return null;

  const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
  const weightedSum = entries.reduce((sum, e) => sum + e.score * e.weight, 0);

  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#1a7a4c';
  if (score >= 70) return '#135e6b';
  if (score >= 50) return '#d4a017';
  return '#7b869a';
}

function getScoreBar(score: number, maxScore: number = 100): string {
  const pct = Math.min((score / maxScore) * 100, 100);
  if (pct >= 85) return 'bg-[#1a7a4c]';
  if (pct >= 70) return 'bg-[#135e6b]';
  if (pct >= 50) return 'bg-[#d4a017]';
  return 'bg-[#7b869a]';
}

export default function BenchmarkPanel({ benchmarks }: BenchmarkPanelProps) {
  if (!benchmarks) return null;

  const keys = Object.keys(WEIGHTS) as Array<keyof BenchmarkScores>;
  const hasScores = keys.some((k) => benchmarks[k] != null);
  if (!hasScores) return null;

  const clipScore = calculateClipScore(benchmarks);
  const sortedBenchmarks = keys
    .filter((k) => benchmarks[k] != null)
    .map((k) => ({ key: k, value: benchmarks[k] as number }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className='border-t border-[#eef0f2]'>
      {/* Header */}
      <div className='flex items-center gap-2 border-b border-[#eef0f2] px-5 py-3'>
        <BarChart3 className='size-4 text-[#135e6b]' />
        <span className='text-[13px] font-bold text-[#1c2733]'>Benchmarks</span>
        {clipScore != null && (
          <span className='ml-auto flex items-center gap-1 rounded-lg bg-[#e8f4f6] px-2 py-0.5 text-[11px] font-bold text-[#135e6b]'>
            <Trophy className='size-3' />
            ClipScore {clipScore}
          </span>
        )}
      </div>

      {/* Weighted score explanation */}
      {clipScore != null && (
        <div className='border-b border-[#eef0f2] px-5 py-2.5'>
          <div className='mb-2 flex items-center gap-1 text-[10px] text-[#a0a8b4]'>
            <Info className='size-3' />
            Weighted: SWE-bench V×30% + TB 2.1×25% + SWE-Pro×20% + Aider×15% + LiveCode×10%
          </div>
          {/* Big score display */}
          <div className='flex items-end gap-2'>
            <span className='text-[32px] font-bold leading-none' style={{ color: getScoreColor(clipScore) }}>
              {clipScore}
            </span>
            <span className='pb-1 text-[12px] text-[#7b869a]'>/100</span>
          </div>
        </div>
      )}

      {/* Benchmark bars */}
      <div className='px-5 py-3'>
        <div className='space-y-3'>
          {sortedBenchmarks.map(({ key, value }) => {
            const info = BENCHMARK_INFO[key];
            const barClass = getScoreBar(value);
            return (
              <div key={key} className='group'>
                <div className='mb-1 flex items-center justify-between'>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-[12px] font-medium text-[#1c2733]'>{info.name}</span>
                    <span className='rounded bg-[#f0f1f2] px-1.5 py-0.5 text-[9px] font-semibold text-[#7b869a]'>{info.org}</span>
                  </div>
                  <span className='text-[12px] font-bold' style={{ color: getScoreColor(value) }}>
                    {value}%
                  </span>
                </div>
                <div className='h-2 w-full overflow-hidden rounded-full bg-[#f0f1f2]'>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barClass}`}
                    style={{ width: `${Math.min(value, 100)}%` }}
                  />
                </div>
                <div className='mt-0.5 text-[10px] text-[#a0a8b4] opacity-0 transition-opacity group-hover:opacity-100'>
                  {info.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data source notice */}
      <div className='border-t border-[#eef0f2] px-5 py-2.5'>
        <p className='text-[10px] leading-relaxed text-[#b0b8c2]'>
          Data sourced from official vendor reports, tbench.ai, llm-stats.com, and aider.chat leaderboards.
          Scores are self-reported by vendors unless noted. Last updated: August 2026.
        </p>
      </div>
    </div>
  );
}
